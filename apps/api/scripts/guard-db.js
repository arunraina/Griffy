#!/usr/bin/env node
// Blocks dev-only Prisma commands (migrate dev, db push, seed) from ever
// running against the production database. `prisma migrate deploy` is not
// gated here -- that's the sanctioned way to apply reviewed migrations to
// UAT or prod as an explicit release step.

const PROD_REF = 'wfigustqkjvbaclfwcto';

const target = process.env.DATABASE_URL || '';

if (target.includes(PROD_REF)) {
  console.error(
    `\n🛑 Refusing to run "${process.env.npm_lifecycle_event}": DATABASE_URL points at the PRODUCTION project (${PROD_REF}).\n` +
      'This command is for the local/UAT database only. If you really need to run it against production,\n' +
      'do it by hand with an explicit, deliberate command -- not through this npm script.\n'
  );
  process.exit(1);
}
