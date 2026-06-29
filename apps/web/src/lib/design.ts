export const colors = {
  primary:      '#C0593A',
  primaryDark:  '#9E3F24',
  primaryDeeper:'#7A2E18',
  primaryLight: '#FAEEE9',
  primaryMid:   '#E8A98E',
  primaryBorder:'#E8C4B0',
  headings:     '#2C1810',
  body:         '#6B5248',
  muted:        '#A08070',
  border:       '#EBE0D8',
  stone:        '#5C4A3A',
  pageBg:       '#FDF8F5',
  cardBg:       '#FFFFFF',
  sandBg:       '#F7F1EC',
  star:         '#E8922A',
} as const;

export const typography = {
  display: 'Georgia, serif',
  body:    'var(--font-sans)',
} as const;

export const cls = {
  // Buttons
  btnPrimary:   'bg-tc hover:bg-tc-dark text-white font-semibold text-sm px-5 py-2.5 rounded-md transition-colors',
  btnSecondary: 'bg-tc-light hover:bg-tc-border text-tc-dark font-semibold text-sm px-5 py-2.5 rounded-md transition-colors',
  btnOutline:   'border border-tc text-tc hover:bg-tc-light font-semibold text-sm px-5 py-2.5 rounded-md transition-colors',
  btnWhite:     'bg-white hover:bg-tc-light text-brown-head font-semibold text-sm px-5 py-2.5 rounded-md transition-colors',
  btnGhost:     'text-brown-body hover:text-tc hover:bg-tc-light text-sm px-4 py-2 rounded-md transition-colors',

  // Cards
  card:          'bg-white border border-brown-border rounded-xl p-4',
  cardHover:     'bg-white border border-brown-border rounded-xl p-4 hover:border-tc transition-colors',
  cardHighlight: 'bg-tc-light border-2 border-tc rounded-xl p-4',
  cardSand:      'bg-sand-base border border-brown-border rounded-xl p-4',

  // Sections
  section:     'px-6 py-10',
  sectionWhite:'bg-white border-b border-brown-border px-6 py-10',
  sectionSand: 'bg-sand-warm px-6 py-10',
  sectionWarm: 'bg-tc-light border border-tc-border px-6 py-10',

  // Layout
  maxW: 'max-w-3xl mx-auto',

  // Typography
  eyebrow: 'text-xs font-bold text-tc uppercase tracking-widest',
  h1:      'text-4xl md:text-5xl font-bold text-brown-head leading-tight',
  h2:      'text-2xl font-bold text-brown-head',
  h3:      'text-base font-bold text-brown-head',
  h4:      'text-sm font-semibold text-brown-head',
  body:    'text-sm text-brown-body leading-relaxed',
  caption: 'text-xs text-brown-muted',

  // Badges & tags
  badge: 'inline-flex items-center gap-1 bg-tc-light text-tc-dark text-xs font-semibold px-3 py-1 rounded-full',
  tag:   'text-[10px] bg-tc-light text-tc-dark border border-tc-border px-2 py-0.5 rounded font-semibold',

  // Form
  input:     'w-full bg-sand-warm border border-brown-border rounded-lg px-4 py-2.5 text-sm text-brown-head placeholder-brown-muted outline-none focus:border-tc transition-colors',
  label:     'block text-xs font-semibold text-brown-head mb-1',
  formError: 'text-xs text-red-600 mt-1',

  // Nav
  navLink:       'text-brown-body text-sm hover:text-tc transition-colors',
  navLinkActive: 'text-tc text-sm font-semibold',

  // Misc
  avatar:      'w-10 h-10 bg-tc-light border border-tc-border flex items-center justify-center text-sm font-bold text-tc-dark rounded-lg',
  avatarRound: 'w-10 h-10 bg-tc text-white flex items-center justify-center text-sm font-bold rounded-full',
  divider:     'border-t border-brown-border',
  rating:      'flex items-center gap-1 text-xs text-brown-body',
  star:        'text-[#E8922A]',
} as const;
