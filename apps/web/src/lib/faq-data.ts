export interface FaqEntry {
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const FAQ: FaqEntry[] = [
  {
    category: 'Getting Started',
    question: 'How do I sign up on Griffy?',
    answer: 'Click "Sign up" in the top right, choose whether you\'re a homeowner or a professional/supplier, then sign up with Google, WhatsApp, or email. Professionals pick a specific role (Contractor, Labour, Service Expert, Material Supplier, Land Owner, Property Seller, Builder, or Property Agent) in the next step.',
    keywords: ['sign up', 'signup', 'register', 'create account', 'join'],
  },
  {
    category: 'Getting Started',
    question: "What's the difference between a homeowner and professional account?",
    answer: 'Homeowner accounts are for finding and hiring contractors, buying materials, and posting projects. Professional accounts are for contractors, labour, service experts, and suppliers who want to list their services and bid on work.',
    keywords: ['homeowner', 'professional', 'account type', 'difference'],
  },
  {
    category: 'Getting Started',
    question: 'Is Griffy free to use?',
    answer: 'Yes — browsing, posting a project, and messaging is free. You only pay for the materials or services you actually order or book.',
    keywords: ['free', 'cost', 'pricing', 'fees', 'charge'],
  },
  {
    category: 'Materials & Orders',
    question: 'How do I order construction materials?',
    answer: 'Browse the Materials marketplace, add items to your cart, and check out. You can pay via UPI/card/netbanking (Razorpay) or Cash on Delivery. Orders over ₹5,000 get free delivery.',
    keywords: ['order materials', 'buy materials', 'cart', 'checkout', 'cement', 'steel', 'tiles'],
  },
  {
    category: 'Materials & Orders',
    question: 'What payment methods are accepted?',
    answer: 'UPI, credit/debit cards, and netbanking via Razorpay, plus Cash on Delivery for material orders.',
    keywords: ['payment', 'pay', 'upi', 'card', 'cod', 'cash on delivery', 'razorpay'],
  },
  {
    category: 'Materials & Orders',
    question: 'Can I track my order?',
    answer: 'Yes — go to Orders from your profile menu to see status updates (Confirmed, Shipped, Delivered) for every order. You\'ll also get a notification each time the status changes.',
    keywords: ['track order', 'order status', 'where is my order', 'delivery status'],
  },
  {
    category: 'Materials & Orders',
    question: "What's your return or refund policy?",
    answer: 'Refund and cancellation terms are shown at checkout for that specific order, since they can vary by supplier and material type. For a payment that\'s already gone through, contact support@griffy.in with your order ID.',
    keywords: ['refund', 'return', 'cancel order', 'cancellation'],
  },
  {
    category: 'Contractors & Professionals',
    question: 'How do I find a contractor near me?',
    answer: 'Go to Marketplace → Find Contractors, and filter by specialization, experience, rating, or location. You can also use Search from the top bar to search contractors, labour, and service experts at once.',
    keywords: ['find contractor', 'hire contractor', 'nearby', 'search contractor'],
  },
  {
    category: 'Contractors & Professionals',
    question: 'How are professionals verified?',
    answer: 'Every contractor, labourer, and service expert profile goes through an approval review before it goes live. Verified profiles show a blue checkmark.',
    keywords: ['verified', 'verification', 'trust', 'background check'],
  },
  {
    category: 'Contractors & Professionals',
    question: "What if I'm not happy with the work?",
    answer: 'Leave a review on the professional\'s profile so other homeowners are informed, and contact support@griffy.in if you believe the issue warrants platform review — we take repeated complaints seriously when deciding whether a profile stays listed.',
    keywords: ['complaint', 'bad work', 'not happy', 'dispute', 'problem with contractor'],
  },
  {
    category: 'Projects & Bidding',
    question: 'What is the Projects marketplace?',
    answer: 'It\'s an open marketplace where homeowners post a project (type, budget, timeline, location) and contractors submit bids. You review bids and pick the one you want.',
    keywords: ['projects marketplace', 'open projects', 'post project', 'what is projects'],
  },
  {
    category: 'Projects & Bidding',
    question: 'How do I post a project?',
    answer: 'Click "Post a Project" from the Projects page or the navbar. Fill in project type, title, description, location, budget range, and timeline across a short 3-step form — it\'s free to post.',
    keywords: ['post a project', 'create project', 'new project'],
  },
  {
    category: 'Projects & Bidding',
    question: 'How does bidding work?',
    answer: 'Once your project is posted, contractors can submit bids with an amount and message. You\'ll get a notification for each bid. Accepting one bid marks the project as awarded; the other bidders are notified it wasn\'t selected this time.',
    keywords: ['bidding', 'bid', 'accept bid', 'reject bid', 'how do bids work'],
  },
  {
    category: 'Projects & Bidding',
    question: "Why can't I share my phone number in a bid message?",
    answer: 'We block phone numbers and email addresses in bid and enquiry messages to keep both sides protected — all communication and payment should stay on Griffy until you\'re ready to finalize a deal.',
    keywords: ['phone number blocked', 'contact info', 'share number', 'email blocked'],
  },
  {
    category: 'Projects & Bidding',
    question: 'What is a Turnkey project?',
    answer: 'Turnkey is for homeowners who only have land and want everything handled end-to-end — design, contractors, materials, and labour — under one project. Post it from the homepage banner or choose "Turnkey / Full Construction" when posting a project.',
    keywords: ['turnkey', 'land', 'full construction', 'end to end'],
  },
  {
    category: 'Cost Estimator',
    question: 'How accurate is the Cost Estimator?',
    answer: 'It gives a ballpark range based on average Indian market rates, your area, and (for Electrical/Plumbing/Interior work) your room and bathroom count. Actual costs vary by city, material brand, and contractor — always get real quotes before starting.',
    keywords: ['cost estimator', 'estimate accuracy', 'how much will it cost'],
  },
  {
    category: 'Cost Estimator',
    question: 'Does the estimate account for my city?',
    answer: 'The estimator uses national average rates as a starting point. For a city-specific number, browse actual contractor quotes and material prices in your area, or post a project to get real bids.',
    keywords: ['city specific cost', 'local rates', 'regional pricing'],
  },
  {
    category: 'Referrals & Leaderboard',
    question: 'How do referrals work?',
    answer: 'Find your referral link on your Profile page and share it. When someone signs up through your link, they count toward your referral total, shown right there on your profile.',
    keywords: ['referral', 'refer a friend', 'invite', 'referral code', 'referral link'],
  },
  {
    category: 'Referrals & Leaderboard',
    question: 'What are the contractor/labour tiers on the Leaderboard?',
    answer: 'Tiers (New, Rising Star, Trusted Pro, Elite) are based on completed jobs and rating — they update automatically as a professional finishes more work and collects reviews. Check /leaderboard to see current rankings.',
    keywords: ['leaderboard', 'tier', 'rising star', 'trusted pro', 'elite', 'ranking'],
  },
  {
    category: 'Account & Safety',
    question: 'How do I reset my password?',
    answer: 'On the Log in page, use "Continue with Email & Password" then look for the "Forgot password?" link, or sign in with Google/WhatsApp instead if that\'s how you originally signed up.',
    keywords: ['reset password', 'forgot password', 'change password'],
  },
  {
    category: 'Account & Safety',
    question: 'How do I delete my account?',
    answer: 'Email support@griffy.in from your registered email address requesting deletion. We\'ll remove your personal data except records we\'re legally required to retain (like completed payment transactions).',
    keywords: ['delete account', 'close account', 'remove account'],
  },
  {
    category: 'Account & Safety',
    question: 'How do I report a problem with a professional or listing?',
    answer: 'Use the Contact Us page and select "Report a problem," or email support@griffy.in with the profile/listing name and details. Our team reviews every report.',
    keywords: ['report', 'flag', 'abuse', 'fraud', 'scam'],
  },
];

export const FAQ_CATEGORIES = Array.from(new Set(FAQ.map((f) => f.category)));

function score(query: string, entry: FaqEntry): number {
  const q = query.toLowerCase();
  let s = 0;
  for (const kw of entry.keywords) {
    if (q.includes(kw)) s += kw.split(' ').length * 2;
  }
  const questionWords = entry.question.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  for (const w of questionWords) {
    if (q.includes(w)) s += 1;
  }
  return s;
}

export function findBestAnswer(query: string): FaqEntry | null {
  if (!query.trim()) return null;
  const scored = FAQ.map((entry) => ({ entry, s: score(query, entry) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s);
  return scored[0]?.entry ?? null;
}
