import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Lets the API trigger an immediate ISR refresh for a specific public page
// right after an admin edit, instead of waiting out the revalidate: 300
// window (up to 5 minutes) for the change to show up. Called server-to-
// server only (apps/api/src/admin/admin.service.ts), never from the browser
// -- guarded by a shared secret since it's an unauthenticated route by
// necessity (Next.js route handlers don't share the API's auth guards).
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Revalidation not configured' }, { status: 501 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.path || body.secret !== secret) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 401 });
  }

  revalidatePath(body.path);
  return NextResponse.json({ revalidated: true, path: body.path });
}
