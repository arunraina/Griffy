// All notification copy lives here. Add a new event by adding a key —
// no schema migration needed, `Notification.type` is a free string.

export type NotificationEvent =
  | 'booking.created'
  | 'booking.confirmed'
  | 'booking.cancelled'
  | 'booking.completed'
  | 'order.placed'
  | 'order.status_changed'
  | 'order.rejected'
  | 'order.payment_failed'
  | 'booking.payment_failed'
  | 'order.refunded'
  | 'profile.approved'
  | 'profile.rejected'
  | 'project.bid_received'
  | 'project.bid_accepted'
  | 'project.bid_rejected'
  | 'chat.message_received'
  | 'turnkey.requested'
  | 'project.accepted'
  | 'project.update_posted'
  | 'milestone.submitted'
  | 'milestone.approved'
  | 'milestone.changes_requested'
  | 'milestone.paid'
  | 'milestone.payment_failed';

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
  'order.payment_failed': (p, base) => ({
    title: 'Payment failed',
    body: 'Your payment did not go through. Please retry to complete your order.',
    whatsappText: `Your Griffy payment did not go through. Please retry: ${base}/orders/${p.orderId}`,
    emailSubject: 'Your Griffy payment did not go through',
    linkUrl: `${base}/orders/${p.orderId}`,
  }),
  'booking.payment_failed': (_p, base) => ({
    title: 'Payment failed',
    body: 'Your payment did not go through. Please retry to confirm your booking.',
    whatsappText: `Your Griffy payment did not go through. Please retry: ${base}/dashboard`,
    emailSubject: 'Your Griffy payment did not go through',
    linkUrl: `${base}/dashboard`,
  }),
  'order.refunded': (p, base) => ({
    title: 'Refund processed',
    body: `A refund of ₹${Number(p.amountRupees).toLocaleString('en-IN')} for your order has been processed.`,
    whatsappText: `A refund of ₹${Number(p.amountRupees).toLocaleString('en-IN')} has been processed for your Griffy order. View: ${base}/orders/${p.orderId}`,
    emailSubject: 'Your Griffy refund has been processed',
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
  'chat.message_received': (p, base) => ({
    title: 'New message',
    body: `${p.senderName} sent you a message.`,
    whatsappText: `${p.senderName} sent you a message on Griffy. View: ${base}/messages/${p.conversationId}`,
    emailSubject: `New message from ${p.senderName} on Griffy`,
    linkUrl: `${base}/messages/${p.conversationId}`,
  }),
  'turnkey.requested': (p, base) => ({
    title: 'New project request',
    body: `You've been asked to take on "${p.projectTitle}".`,
    whatsappText: `New turnkey project request: "${p.projectTitle}". View: ${base}/turnkey-projects/${p.projectId}`,
    emailSubject: 'New turnkey project request on Griffy',
    linkUrl: `${base}/turnkey-projects/${p.projectId}`,
  }),
  'project.accepted': (p, base) => ({
    title: 'Project accepted',
    body: `Your project "${p.projectTitle}" was accepted — work will begin soon.`,
    whatsappText: `Your Griffy project "${p.projectTitle}" was accepted. View: ${base}/turnkey-projects/${p.projectId}`,
    emailSubject: 'Your Griffy project was accepted',
    linkUrl: `${base}/turnkey-projects/${p.projectId}`,
  }),
  'project.update_posted': (p, base) => ({
    title: 'Project update',
    body: `Your project is now ${p.percent}% complete.`,
    whatsappText: `Your Griffy project "${p.projectTitle}" is now ${p.percent}% complete. View: ${base}/turnkey-projects/${p.projectId}`,
    emailSubject: 'New update on your Griffy project',
    linkUrl: `${base}/turnkey-projects/${p.projectId}`,
  }),
  'milestone.submitted': (p, base) => ({
    title: 'Milestone submitted for review',
    body: `"${p.milestoneTitle}" has been marked complete and is awaiting your review.`,
    whatsappText: `Milestone "${p.milestoneTitle}" is ready for your review. View: ${base}/turnkey-projects/${p.projectId}`,
    emailSubject: 'A milestone is awaiting your review',
    linkUrl: `${base}/turnkey-projects/${p.projectId}`,
  }),
  'milestone.approved': (p, base) => ({
    title: 'Milestone approved',
    body: `"${p.milestoneTitle}" was approved — payment can now be released.`,
    whatsappText: `Milestone "${p.milestoneTitle}" was approved on Griffy. View: ${base}/turnkey-projects/${p.projectId}`,
    emailSubject: 'Your Griffy milestone was approved',
    linkUrl: `${base}/turnkey-projects/${p.projectId}`,
  }),
  'milestone.changes_requested': (p, base) => ({
    title: 'Changes requested',
    body: `Changes were requested on "${p.milestoneTitle}": ${p.note}`,
    whatsappText: `Changes requested on "${p.milestoneTitle}": ${p.note} View: ${base}/turnkey-projects/${p.projectId}`,
    emailSubject: 'Changes requested on your Griffy milestone',
    linkUrl: `${base}/turnkey-projects/${p.projectId}`,
  }),
  'milestone.paid': (p, base) => ({
    title: 'Milestone paid',
    body: `You've been paid ₹${Number(p.amountRupees).toLocaleString('en-IN')} for "${p.milestoneTitle}".`,
    whatsappText: `₹${Number(p.amountRupees).toLocaleString('en-IN')} released for "${p.milestoneTitle}" on Griffy. View: ${base}/turnkey-projects/${p.projectId}`,
    emailSubject: 'Milestone payment received on Griffy',
    linkUrl: `${base}/turnkey-projects/${p.projectId}`,
  }),
  'milestone.payment_failed': (p, base) => ({
    title: 'Payment failed',
    body: `Payment for "${p.milestoneTitle}" did not go through. Please retry.`,
    whatsappText: `Payment for milestone "${p.milestoneTitle}" did not go through. Please retry: ${base}/turnkey-projects/${p.projectId}`,
    emailSubject: 'Your Griffy milestone payment did not go through',
    linkUrl: `${base}/turnkey-projects/${p.projectId}`,
  }),
};

export function renderNotification(event: NotificationEvent, payload: Payload, appBaseUrl: string): RenderedNotification {
  return templates[event](payload, appBaseUrl);
}
