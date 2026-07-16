export async function shareOrCopyLink(title: string, url?: string): Promise<'shared' | 'copied' | 'failed'> {
  const shareUrl = url ?? window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title, url: shareUrl });
      return 'shared';
    } catch {
      return 'failed';
    }
  }
  try {
    await navigator.clipboard.writeText(shareUrl);
    return 'copied';
  } catch {
    return 'failed';
  }
}
