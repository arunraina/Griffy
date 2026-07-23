import { redirect } from 'next/navigation';

// Kept as a redirect for anyone with the old URL bookmarked/cached -- the
// personalized home page moved to /home (a distinct URL from /dashboard,
// per user feedback that the two are conceptually different pages).
export default function DashboardHomeRedirect() {
  redirect('/home');
}
