import { test, expect, Page } from '@playwright/test';
import { createTestUser, deleteTestUser, login, prisma, TestUser } from './helpers';

interface Issue {
  role: string;
  url: string;
  issue: string;
}

// Buttons matching these are never clicked during the crawl — either
// destructive (suspend/reject/delete/logout) or already covered by their
// own dedicated, more careful E2E spec (Confirm/Approve/Send Request).
const SKIP_BUTTON_PATTERN = /logout|suspend|unsuspend|reject|delete|remove|cancel|confirm|approve|send request|send message|report|decline/i;

const MAX_PAGES_PER_ROLE = 20;

async function crawlLinks(page: Page, role: string, startPath: string, issues: Issue[]): Promise<string[]> {
  const visited = new Set<string>();
  const queue: string[] = [startPath];
  let consoleErrors: string[] = [];

  page.on('console', (msg) => {
    const text = msg.text();
    // Two known artifacts of navigating this fast, neither a real signal:
    // (1) Next.js dev-mode Fast Refresh logging a harmless "failed to fetch
    // RSC payload" for the PREVIOUS page when a source file changes mid-crawl.
    // (2) Supabase's own session-check (GoTrueClient.getUser, fired by
    // NotificationProvider/page auth checks on every mount) getting its
    // in-flight fetch aborted when we navigate to the next page before it
    // resolves — a real user pausing between clicks would never trigger this.
    const isKnownCrawlNoise =
      /Fast Refresh|fetch RSC payload/i.test(text) ||
      (/Failed to fetch/i.test(text) && /GoTrueClient/i.test(text));
    if (msg.type() === 'error' && !isKnownCrawlNoise) {
      consoleErrors.push(text);
    }
  });
  page.on('pageerror', (err) => {
    issues.push({ role, url: page.url(), issue: `Uncaught exception: ${err.message}` });
  });

  while (queue.length && visited.size < MAX_PAGES_PER_ROLE) {
    const path = queue.shift()!;
    if (visited.has(path)) continue;
    visited.add(path);
    consoleErrors = [];

    try {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 });
      if (response && response.status() >= 400) {
        issues.push({ role, url: path, issue: `HTTP ${response.status()}` });
        continue;
      }
    } catch (e) {
      issues.push({ role, url: path, issue: `Navigation failed: ${(e as Error).message}` });
      continue;
    }

    await page.waitForTimeout(400); // let client-side content/hydration settle

    const bodyText = await page.locator('body').innerText().catch(() => '');
    if (bodyText.trim().length < 20) {
      issues.push({ role, url: path, issue: 'Blank or near-empty page' });
    }
    if (consoleErrors.length > 0) {
      issues.push({ role, url: path, issue: `Console error(s): ${consoleErrors.slice(0, 2).join(' | ')}` });
    }

    const hrefs = await page.locator('a[href]').evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    for (const href of hrefs) {
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) continue;
      const cleanPath = href.split('#')[0];
      if (!visited.has(cleanPath) && !queue.includes(cleanPath)) queue.push(cleanPath);
    }
  }

  return Array.from(visited);
}

// Lightweight, safe pass: click every visible button on a page (excluding
// destructive/already-tested ones) and confirm it produces SOME effect
// (URL change, new visible text, or a dialog/modal) rather than doing
// nothing — the classic "dead button" pattern from earlier this session.
async function checkButtonsRespond(page: Page, role: string, path: string, issues: Issue[]) {
  await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => undefined);
  await page.waitForTimeout(400);

  const buttons = await page.getByRole('button').all();
  for (const button of buttons) {
    const name = (await button.textContent().catch(() => '')) ?? '';
    if (SKIP_BUTTON_PATTERN.test(name)) continue;
    if (!(await button.isVisible().catch(() => false))) continue;

    const urlBefore = page.url();
    const textBefore = await page.locator('body').innerText().catch(() => '');

    let dialogAppeared = false;
    const dialogHandler = (dialog: import('@playwright/test').Dialog) => {
      dialogAppeared = true;
      dialog.dismiss().catch(() => undefined);
    };
    page.on('dialog', dialogHandler);

    await button.click({ timeout: 5000, force: true }).catch(() => undefined);
    await page.waitForTimeout(300);

    page.off('dialog', dialogHandler);

    const urlAfter = page.url();
    const textAfter = await page.locator('body').innerText().catch(() => '');

    if (urlAfter === urlBefore && textAfter === textBefore && !dialogAppeared) {
      issues.push({ role, url: path, issue: `Button "${name.trim().slice(0, 40)}" produced no visible effect` });
    }

    // Restore to the original page/state before checking the next button,
    // in case the click above navigated or opened a modal.
    if (urlAfter !== urlBefore) {
      await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => undefined);
      await page.waitForTimeout(300);
    } else {
      await page.keyboard.press('Escape').catch(() => undefined);
    }
  }
}

function report(role: string, roleIssues: Issue[]) {
  // eslint-disable-next-line no-console
  console.log(`\n=== CRAWL REPORT [${role}]: ${roleIssues.length} issue(s) found ===`);
  for (const issue of roleIssues) {
    // eslint-disable-next-line no-console
    console.log(`${issue.url} — ${issue.issue}`);
  }
}

test.describe('Site-wide crawl', () => {
  test('unauthenticated visitor', async ({ page }) => {
    const roleIssues: Issue[] = [];
    await crawlLinks(page, 'anonymous', '/', roleIssues);
    await checkButtonsRespond(page, 'anonymous', '/', roleIssues);
    report('anonymous', roleIssues);
    expect(roleIssues, JSON.stringify(roleIssues, null, 2)).toEqual([]);
  });

  test('homeowner', async ({ page }) => {
    const homeowner = await createTestUser('crawl-homeowner');
    const roleIssues: Issue[] = [];
    try {
      await login(page, homeowner);
      await crawlLinks(page, 'homeowner', '/dashboard', roleIssues);
      await checkButtonsRespond(page, 'homeowner', '/dashboard', roleIssues);
    } finally {
      await deleteTestUser(homeowner);
    }
    report('homeowner', roleIssues);
    expect(roleIssues, JSON.stringify(roleIssues, null, 2)).toEqual([]);
  });

  test('contractor', async ({ page }) => {
    const contractor = await createTestUser('crawl-contractor', { role: 'SERVICE_PROVIDER', pro_label: 'Contractor' });
    const roleIssues: Issue[] = [];
    try {
      await login(page, contractor);
      await crawlLinks(page, 'contractor', '/dashboard', roleIssues);
      await checkButtonsRespond(page, 'contractor', '/dashboard', roleIssues);
    } finally {
      await deleteTestUser(contractor);
    }
    report('contractor', roleIssues);
    expect(roleIssues, JSON.stringify(roleIssues, null, 2)).toEqual([]);
  });

  test('admin', async ({ page }) => {
    const admin = await createTestUser('crawl-admin');
    const roleIssues: Issue[] = [];
    try {
      await prisma.user.update({ where: { id: admin.userId }, data: { role: 'ADMIN' } });
      await login(page, admin);
      await crawlLinks(page, 'admin', '/admin', roleIssues);
      await checkButtonsRespond(page, 'admin', '/admin', roleIssues);
    } finally {
      await deleteTestUser(admin);
    }
    report('admin', roleIssues);
    expect(roleIssues, JSON.stringify(roleIssues, null, 2)).toEqual([]);
  });
});
