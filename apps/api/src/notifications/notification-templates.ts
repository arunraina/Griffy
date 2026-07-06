// All notification copy lives here. Add a new event by adding a key —
// no schema migration needed, `Notification.type` is a free string.
//
// TODO(turnkey): 'project.update_posted' and 'project.accepted' are not
// wired yet — TurnkeyProject/TurnkeyProjectUpdate exist in the schema but
// have no service/controller built. Once that module exists, add these
// two event keys here and call
//   notifications.notify(project.customerId, 'project.update_posted', { percent, projectId })
//   notifications.notify(project.customerId, 'project.accepted', { projectId })
// from wherever updates get posted / a turnkey project gets accepted.

export type NotificationEvent =
  | 'booking.created'
  | 'booking.confirmed'
  | 'booking.cancelled'
  | 'booking.completed'
  | 'order.placed'
  | 'order.status_changed'
  | 'order.rejected'
  | 'profile.approved'
  | 'profile.rejected'
  | 'project.bid_received'
  | 'project.bid_accepted'
  | 'project.bid_rejected';

export interface RenderedNotification {
  title: string;
  body: string;
  whatsappText: string;
  emailSubject: string;
  linkUrl?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Payload = Record<string, any>;

const templates: Record<NotificationEvent, (payload: Payload, appBaseUrl: string) => RenderedNotification> = {
  'booking.created': (p, base) => ({
    title: 'New booking request',
    body: `New booking request from ${p.customerName}.`,
    whatsappText: `New booking request from ${p.customerName} on Griffy. View: ${base}/dashboard`,
    emailSubject: 'New booking request on Griffy',
    linkUrl: `${base}/dashboard`,
  }),
  'booking.confirmed': (_p, base) => ({
    title: 'Booking confirmed',
    body: 'Your booking has been confirmed by the provider.',
    whatsappText: `Your Griffy booking is confirmed. View: ${base}/dashboard`,
    emailSubject: 'Your booking is confirmed',
    linkUrl: `${base}/dashboard`,
  }),
  'booking.cancelled': (_p, base) => ({
    title: 'Booking cancelled',
    body: 'Your booking has been cancelled.',
    whatsappText: `Your Griffy booking was cancelled. View: ${base}/dashboard`,
    emailSubject: 'Your booking was cancelled',
    linkUrl: `${base}/dashboard`,
  }),
  'booking.completed': (_p, base) => ({
    title: 'Work completed',
    body: 'Your booking is marked complete — leave a review to help other homeowners.',
    whatsappText: `Your Griffy booking is complete. Leave a review: ${base}/dashboard`,
    emailSubject: 'Work completed — leave a review',
    linkUrl: `${base}/dashboard`,
  }),
  'order.placed': (p, base) => ({
    title: 'New order received',
    body: `New order received for ${p.itemSummary ?? 'your materials'}.`,
    whatsappText: `New order received on Griffy. View: ${base}/dashboard`,
    emailSubject: 'New order received on Griffy',
    linkUrl: `${base}/dashboard`,
  }),
  'order.status_changed': (p, base) => ({
    title: 'Order update',
    body: p.message,
    whatsappText: `${p.message} View: ${base}/orders/${p.orderId}`,
    emailSubject: 'Your Griffy order has an update',
    linkUrl: `${base}/orders/${p.orderId}`,
  }),
  'order.rejected': (p, base) => ({
    title: 'Order rejected',
    body: 'Your order was rejected by the seller.',
    whatsappText: `Your Griffy order was rejected by the seller. View: ${base}/orders/${p.orderId}`,
    emailSubject: 'Your Griffy order was rejected',
    linkUrl: `${base}/orders/${p.orderId}`,
  }),
  'profile.approved': (_p, base) => ({
    title: 'Your Griffy profile is live!',
    body: 'Your profile has been approved and is now visible to customers.',
    whatsappText: `Your Griffy profile is approved and live! View: ${base}/dashboard`,
    emailSubject: 'Your Griffy profile is live',
    linkUrl: `${base}/dashboard`,
  }),
  'profile.rejected': (p, base) => ({
    title: 'Profile needs changes',
    body: p.reason ? `Your profile was not approved: ${p.reason}` : 'Your profile was not approved. Please review and resubmit.',
    whatsappText: `Your Griffy profile needs changes${p.reason ? `: ${p.reason}` : '.'} View: ${base}/dashboard`,
    emailSubject: 'Your Griffy profile needs changes',
    linkUrl: `${base}/dashboard`,
  }),
  'project.bid_received': (p, base) => ({
    title: 'New bid on your project',
    body: `You received a new bid of ₹${Number(p.bidAmount).toLocaleString('en-IN')} on "${p.projectTitle}".`,
    whatsappText: `New bid of ₹${Number(p.bidAmount).toLocaleString('en-IN')} on "${p.projectTitle}". View: ${base}/projects/${p.projectId}`,
    emailSubject: 'New bid on your Griffy project',
    linkUrl: `${base}/projects/${p.projectId}`,
  }),
  'project.bid_accepted': (p, base) => ({
    title: 'Bid accepted!',
    body: `Your bid on "${p.projectTitle}" was accepted.`,
    whatsappText: `Your bid on "${p.projectTitle}" was accepted! View: ${base}/projects/${p.projectId}`,
    emailSubject: 'Your Griffy bid was accepted',
    linkUrl: `${base}/projects/${p.projectId}`,
  }),
  'project.bid_rejected': (p, base) => ({
    title: 'Bid update',
    body: `Your bid on "${p.projectTitle}" was not selected this time.`,
    whatsappText: `Your bid on "${p.projectTitle}" was not selected this time. View: ${base}/projects/${p.projectId}`,
    emailSubject: 'Update on your Griffy bid',
    linkUrl: `${base}/projects/${p.projectId}`,
  }),
};

export function renderNotification(event: NotificationEvent, payload: Payload, appBaseUrl: string): RenderedNotification {
  return templates[event](payload, appBaseUrl);
}
