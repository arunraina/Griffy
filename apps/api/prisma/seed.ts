import { PrismaClient, UserRole, ApprovalStatus, LandType, PropertyType, FurnishingStatus, ReviewTargetType } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();
const NOW = new Date();

// Fixed UUIDs — seed is idempotent; re-running is safe
const IDS = {
  contractors: [
    'c0000001-0000-0000-0000-000000000001',
    'c0000001-0000-0000-0000-000000000002',
    'c0000001-0000-0000-0000-000000000003',
    'c0000001-0000-0000-0000-000000000004',
    'c0000001-0000-0000-0000-000000000005',
  ],
  labour: [
    'c0000002-0000-0000-0000-000000000001',
    'c0000002-0000-0000-0000-000000000002',
    'c0000002-0000-0000-0000-000000000003',
    'c0000002-0000-0000-0000-000000000004',
    'c0000002-0000-0000-0000-000000000005',
  ],
  serviceExperts: [
    'c0000003-0000-0000-0000-000000000001',
    'c0000003-0000-0000-0000-000000000002',
    'c0000003-0000-0000-0000-000000000003',
    'c0000003-0000-0000-0000-000000000004',
    'c0000003-0000-0000-0000-000000000005',
  ],
  reviewers: [
    'c0000009-0000-0000-0000-000000000001',
    'c0000009-0000-0000-0000-000000000002',
    'c0000009-0000-0000-0000-000000000003',
    'c0000009-0000-0000-0000-000000000004',
    'c0000009-0000-0000-0000-000000000005',
    'c0000009-0000-0000-0000-000000000006',
  ],
  supplier:        'c0000004-0000-0000-0000-000000000001',
  landOwner:       'c0000005-0000-0000-0000-000000000001',
  landOwner2:      'c0000005-0000-0000-0000-000000000002',
  propertySeller:  'c0000006-0000-0000-0000-000000000001',
  rentSeller:      'c0000007-0000-0000-0000-000000000001',
  builderSeller:   'c0000008-0000-0000-0000-000000000001',
  griffyBrand:     'c0000011-0000-0000-0000-000000000001',
  turnkeyProjects: [
    'c0000012-0000-0000-0000-000000000001',
    'c0000012-0000-0000-0000-000000000002',
  ],
};

async function main() {
  console.log('🌱 Starting seed...');

  // ── Contractors ──────────────────────────────────────────────────────────
  const contractors = [
    {
      user: { id: IDS.contractors[0], name: 'Mohammad Ashraf Bhat', email: 'ashraf.bhat@seed.griffy.dev', phone: '+919419000001', role: UserRole.CONTRACTOR },
      profile: { contractorType: 'Civil Contractor', tradeSkills: ['Foundation Work', 'RCC Structure', 'Stone Masonry', 'Concrete'], experience: '14 years', serviceCities: ['Srinagar', 'Baramulla'], licenseNumber: 'JK-CIV-2010-001', dailyRate: 3800, projectRate: 280000, isAvailable: true, bio: 'Experienced civil contractor based in Srinagar with 14 years of expertise in residential and commercial construction across the Kashmir Valley. Specializes in earthquake-resistant RCC structures suited to J&K terrain and climate. Known for quality concrete work, on-time delivery, and transparent costing.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW, avgRating: 4.7, totalReviews: 6, totalJobs: 52, completionRate: 96.2 },
    },
    {
      user: { id: IDS.contractors[1], name: 'Rajeev Khajuria', email: 'rajeev.khajuria@seed.griffy.dev', phone: '+919419000002', role: UserRole.CONTRACTOR },
      profile: { contractorType: 'Architect', tradeSkills: ['Architectural Design', 'Interior Design', '3D Rendering', 'Vastu Consultation'], experience: '9 years', serviceCities: ['Jammu', 'Srinagar', 'Baramulla'], dailyRate: 5500, projectRate: 420000, isAvailable: true, bio: 'Jammu-based architect with 9 years of experience designing modern residential villas and commercial complexes. Specializes in climate-adaptive design for J&K — maximizing natural light in Kashmir winters and cross-ventilation in Jammu summers.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW, avgRating: 4.9, totalReviews: 18, totalJobs: 24, completionRate: 100 },
    },
    {
      user: { id: IDS.contractors[2], name: 'Fayaz Ahmad Mir', email: 'fayaz.mir@seed.griffy.dev', phone: '+919419000003', role: UserRole.CONTRACTOR },
      profile: { contractorType: 'Renovation Contractor', tradeSkills: ['Home Renovation', 'Traditional Taq Construction', 'Woodwork Restoration', 'Flooring'], experience: '11 years', serviceCities: ['Srinagar', 'Baramulla'], dailyRate: 4200, projectRate: 160000, isAvailable: true, bio: 'Specialist in home renovation and Taq (traditional Kashmiri timber-brick) construction restoration. 11 years transforming old homes across the Kashmir Valley into modern living spaces while preserving heritage architecture.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW, avgRating: 4.5, totalReviews: 38, totalJobs: 61, completionRate: 93.4 },
    },
    {
      user: { id: IDS.contractors[3], name: 'Sunil Kumar Sharma', email: 'sunil.sharma@seed.griffy.dev', phone: '+919419000004', role: UserRole.CONTRACTOR },
      profile: { contractorType: 'Civil Contractor', tradeSkills: ['Road Construction', 'Drainage Systems', 'Retaining Walls', 'Waterproofing'], experience: '16 years', serviceCities: ['Jammu', 'Srinagar', 'Baramulla'], licenseNumber: 'JK-CIV-2008-004', dailyRate: 4800, projectRate: 380000, isAvailable: true, bio: 'Jammu-based civil contractor with 16 years of experience in residential buildings, retaining walls, and mountain-terrain civil infrastructure. Expert in J&K soil conditions and landslide-resistant construction techniques.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW, avgRating: 4.6, totalReviews: 54, totalJobs: 70, completionRate: 97.1 },
    },
    {
      user: { id: IDS.contractors[4], name: 'Sameena Akhtar', email: 'sameena.akhtar@seed.griffy.dev', phone: '+919419000005', role: UserRole.CONTRACTOR },
      profile: { contractorType: 'Architect', tradeSkills: ['Green Building', 'Passive Solar Design', 'Interior Design', 'Space Planning'], experience: '7 years', serviceCities: ['Srinagar', 'Baramulla'], dailyRate: 6500, projectRate: 550000, isAvailable: false, bio: 'Srinagar-based architect focused on energy-efficient and climate-responsive design. Specializes in passive solar homes for Kashmir\'s cold winters — reducing heating costs by up to 40% through smart orientation and insulation strategies.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW, avgRating: 4.8, totalReviews: 12, totalJobs: 16, completionRate: 100 },
    },
  ];

  for (const { user, profile } of contractors) {
    await prisma.user.upsert({ where: { id: user.id }, update: {}, create: user });
    await prisma.contractorProfile.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, ...profile } });
  }
  console.log('✅ 5 contractors seeded');

  // ── Homeowner reviewers ───────────────────────────────────────────────────
  const reviewerUsers = [
    { id: IDS.reviewers[0], name: 'Tariq Hussain Wani',   email: 'tariq.wani@seed.griffy.dev',    role: UserRole.HOMEOWNER },
    { id: IDS.reviewers[1], name: 'Sunita Dogra',         email: 'sunita.dogra@seed.griffy.dev',   role: UserRole.HOMEOWNER },
    { id: IDS.reviewers[2], name: 'Bilal Ahmad Khan',     email: 'bilal.khan@seed.griffy.dev',     role: UserRole.HOMEOWNER },
    { id: IDS.reviewers[3], name: 'Priya Raina',          email: 'priya.raina@seed.griffy.dev',    role: UserRole.HOMEOWNER },
    { id: IDS.reviewers[4], name: 'Aadil Bashir Lone',    email: 'aadil.lone@seed.griffy.dev',     role: UserRole.HOMEOWNER },
    { id: IDS.reviewers[5], name: 'Neha Gupta',           email: 'neha.gupta@seed.griffy.dev',     role: UserRole.HOMEOWNER },
  ];
  for (const r of reviewerUsers) {
    await prisma.user.upsert({ where: { id: r.id }, update: {}, create: r });
  }

  // ── Reviews for Mohammad Ashraf Bhat (contractor[0]) ─────────────────────
  const ashrafProfile = await prisma.contractorProfile.findUnique({ where: { userId: IDS.contractors[0] } });
  if (ashrafProfile) {
    const contractorReviews = [
      { reviewerId: IDS.reviewers[0], rating: 5, comment: 'Ashraf bhai built our G+2 house in Baramulla in exactly 13 months. The RCC work is outstanding — no settling cracks even after two winters. Completely transparent with costs and materials.' },
      { reviewerId: IDS.reviewers[1], rating: 5, comment: 'Very professional and skilled team. Our compound wall and gate pillars were done to perfection. Clean workmanship and the site was left spotless each evening.' },
      { reviewerId: IDS.reviewers[2], rating: 4, comment: 'Good quality concrete work on our foundation slab. Took 3 extra days due to rain but he communicated proactively. The structural quality is excellent.' },
      { reviewerId: IDS.reviewers[3], rating: 5, comment: 'Hired for full interior civil work — flooring, dado tiling, bathroom waterproofing. Zero leakage even after Kashmir\'s first heavy snowfall. Impressive work!' },
      { reviewerId: IDS.reviewers[4], rating: 5, comment: 'Ashraf and his team built our shop-cum-residence in Srinagar city center. The stonework on the facade looks beautiful and the structure is solid. Highly recommend.' },
      { reviewerId: IDS.reviewers[5], rating: 4, comment: 'Did plastering and external finishing on our house. Neat joints and good surface quality. Pricing was fair and within the quoted budget.' },
    ];
    for (const rev of contractorReviews) {
      const exists = await prisma.review.findFirst({ where: { reviewerId: rev.reviewerId, contractorProfileId: ashrafProfile.id } });
      if (!exists) {
        await prisma.review.create({ data: { ...rev, contractorProfileId: ashrafProfile.id, targetType: ReviewTargetType.CONTRACTOR } });
      }
    }
  }
  console.log('✅ Reviews seeded for contractor profile');

  // ── Labour ───────────────────────────────────────────────────────────────
  const labourProfiles = [
    {
      user: { id: IDS.labour[0], name: 'Ghulam Nabi Sofi', email: 'ghulam.sofi@seed.griffy.dev', phone: '+919419000011', role: UserRole.LABOUR },
      profile: { skillType: 'Mason', experience: '9 years', serviceCities: ['Srinagar', 'Baramulla'], dailyRate: 950, isAvailable: true, bio: 'Skilled mason from Baramulla with expertise in stone masonry, brick work, and traditional Kashmiri Taq construction. Handles plastering, dado tiling, and compound walls.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW, avgRating: 4.6, totalReviews: 3 },
    },
    {
      user: { id: IDS.labour[1], name: 'Rohit Bakshi', email: 'rohit.bakshi@seed.griffy.dev', phone: '+919419000012', role: UserRole.LABOUR },
      profile: { skillType: 'Carpenter', experience: '12 years', serviceCities: ['Jammu', 'Srinagar'], dailyRate: 1300, isAvailable: true, bio: 'Master carpenter from Jammu specializing in walnut wood furniture, traditional Kashmiri carved windows (Pinjra work), modular kitchen units, and custom wardrobes.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW, avgRating: 4.8, totalReviews: 31 },
    },
    {
      user: { id: IDS.labour[2], name: 'Mushtaq Ahmad Dar', email: 'mushtaq.dar@seed.griffy.dev', phone: '+919419000013', role: UserRole.LABOUR },
      profile: { skillType: 'Painter', experience: '7 years', serviceCities: ['Srinagar', 'Baramulla', 'Jammu'], dailyRate: 850, isAvailable: true, bio: 'Professional painter based in Srinagar with expertise in interior/exterior painting, texture finishes, and POP ceiling work. Uses weather-resistant paints suited to Kashmir\'s cold-humid climate.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW, avgRating: 4.4, totalReviews: 24 },
    },
    {
      user: { id: IDS.labour[3], name: 'Abdul Majid Wani', email: 'abdulmajid.wani@seed.griffy.dev', phone: '+919419000014', role: UserRole.LABOUR },
      profile: { skillType: 'Mason', experience: '15 years', serviceCities: ['Baramulla', 'Srinagar'], dailyRate: 1150, isAvailable: true, bio: 'Highly experienced mason and bricklayer from Baramulla. Handles large residential and commercial masonry projects. Expert in stone-facing work common to J&K architecture.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW, avgRating: 4.7, totalReviews: 47 },
    },
    {
      user: { id: IDS.labour[4], name: 'Savita Sharma', email: 'savita.sharma@seed.griffy.dev', phone: '+919419000015', role: UserRole.LABOUR },
      profile: { skillType: 'Painter', experience: '6 years', serviceCities: ['Jammu', 'Srinagar'], dailyRate: 800, isAvailable: true, bio: 'Skilled painter based in Jammu. Specializes in interior painting, decorative finishes, and anti-fungal coatings suitable for J&K\'s seasonal humidity.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW, avgRating: 4.5, totalReviews: 15 },
    },
  ];

  for (const { user, profile } of labourProfiles) {
    await prisma.user.upsert({ where: { id: user.id }, update: {}, create: user });
    await prisma.labourProfile.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, ...profile } });
  }
  console.log('✅ 5 labour profiles seeded');

  // ── Reviews for Ghulam Nabi Sofi (labour[0]) ─────────────────────────────
  const ghulamnProfile = await prisma.labourProfile.findUnique({ where: { userId: IDS.labour[0] } });
  if (ghulamnProfile) {
    const labourReviews = [
      { reviewerId: IDS.reviewers[0], rating: 5, comment: 'Ghulam bhai did excellent stone masonry on our boundary wall in Baramulla. Very clean joints and solid work. Recommended by three neighbours!' },
      { reviewerId: IDS.reviewers[1], rating: 4, comment: 'Brick and plastering work done neatly. Punctual and hardworking. Will hire again for next phase.' },
      { reviewerId: IDS.reviewers[2], rating: 5, comment: 'Compound wall and dado tiling completed on time and within budget. Very reliable worker.' },
    ];
    for (const rev of labourReviews) {
      const exists = await prisma.review.findFirst({ where: { reviewerId: rev.reviewerId, labourProfileId: ghulamnProfile.id } });
      if (!exists) {
        await prisma.review.create({ data: { ...rev, labourProfileId: ghulamnProfile.id, targetType: ReviewTargetType.LABOUR } });
      }
    }
  }

  // ── Service Experts ──────────────────────────────────────────────────────
  const serviceExperts = [
    {
      user: { id: IDS.serviceExperts[0], name: 'Arshad Hussain Electrical', email: 'arshad.electrical@seed.griffy.dev', phone: '+919419000021', role: UserRole.SERVICE_EXPERT },
      profile: { expertiseType: 'Electrician', qualifications: ['ITI Electrical', 'J&K Licensing Board Certified'], experience: '10 years', serviceCities: ['Srinagar', 'Baramulla'], consultationFee: 500, isAvailable: true, bio: 'Licensed electrician based in Srinagar with 10 years of experience in domestic and commercial wiring, DB board upgrades, and solar panel installations for J&K\'s frequent power-cut situations.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW, avgRating: 4.7, totalReviews: 3 },
    },
    {
      user: { id: IDS.serviceExperts[1], name: 'Rajinder Singh Plumbing', email: 'rajinder.plumbing@seed.griffy.dev', phone: '+919419000022', role: UserRole.SERVICE_EXPERT },
      profile: { expertiseType: 'Plumber', qualifications: ['ITI Plumbing', 'Winterization Specialist'], experience: '14 years', serviceCities: ['Jammu', 'Srinagar', 'Baramulla'], consultationFee: 420, isAvailable: true, bio: 'Expert plumber from Jammu specializing in pipe winterization, anti-freeze installations, and hot-water systems critical for J&K winters. Handles new installations and burst-pipe emergency repairs.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW, avgRating: 4.6, totalReviews: 82 },
    },
    {
      user: { id: IDS.serviceExperts[2], name: 'Farooq Ahmad AC Services', email: 'farooq.ac@seed.griffy.dev', phone: '+919419000023', role: UserRole.SERVICE_EXPERT },
      profile: { expertiseType: 'AC Technician', qualifications: ['HVAC Certification', 'Inverter AC Specialist'], experience: '8 years', serviceCities: ['Srinagar', 'Jammu'], consultationFee: 380, isAvailable: true, bio: 'AC installation, servicing, and repair specialist based in Srinagar. Also handles inverter ACs used as heat pumps for winter heating — increasingly popular in Kashmir. Works with all major brands.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW, avgRating: 4.8, totalReviews: 97 },
    },
    {
      user: { id: IDS.serviceExperts[3], name: 'Deepa Bhat Electricals', email: 'deepa.electricals@seed.griffy.dev', phone: '+919419000024', role: UserRole.SERVICE_EXPERT },
      profile: { expertiseType: 'Electrician', qualifications: ['ITI Electrical', 'Solar PV Installation Certified'], experience: '5 years', serviceCities: ['Jammu', 'Srinagar'], consultationFee: 450, isAvailable: true, bio: 'Jammu-based electrician specializing in solar PV systems, smart home wiring, and backup power (UPS/inverter) setups — essential for J&K homes dealing with load shedding.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW, avgRating: 4.9, totalReviews: 39 },
    },
    {
      user: { id: IDS.serviceExperts[4], name: 'Nazir Ahmad Plumbing', email: 'nazir.plumbing@seed.griffy.dev', phone: '+919419000025', role: UserRole.SERVICE_EXPERT },
      profile: { expertiseType: 'Plumber', qualifications: ['NSDC Certified Plumber', 'Fire-Sprinkler Installer'], experience: '11 years', serviceCities: ['Baramulla', 'Srinagar', 'Jammu'], consultationFee: 400, isAvailable: true, bio: 'Baramulla-based plumber with 11 years of experience in residential and commercial plumbing across J&K. Offers 24/7 emergency service during freeze-thaw pipe burst season.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW, avgRating: 4.5, totalReviews: 68 },
    },
  ];

  for (const { user, profile } of serviceExperts) {
    await prisma.user.upsert({ where: { id: user.id }, update: {}, create: user });
    await prisma.serviceExpertProfile.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, ...profile } });
  }
  console.log('✅ 5 service experts seeded');

  // ── Reviews for Arshad Hussain (serviceExpert[0]) ────────────────────────
  const arshadProfile = await prisma.serviceExpertProfile.findUnique({ where: { userId: IDS.serviceExperts[0] } });
  if (arshadProfile) {
    const seReviews = [
      { reviewerId: IDS.reviewers[0], rating: 5, comment: 'Arshad fixed our entire house wiring issue in Srinagar in one day. Very knowledgeable — he identified a neutral fault that two others had missed. Clean work.' },
      { reviewerId: IDS.reviewers[3], rating: 5, comment: 'Installed a 5KW solar system and full DB upgrade for our home in Baramulla. No mess, on time, within quoted cost. Highly professional.' },
      { reviewerId: IDS.reviewers[4], rating: 4, comment: 'Good electrician. Explained the problem clearly before starting work. Fair pricing for Srinagar rates.' },
    ];
    for (const rev of seReviews) {
      const exists = await prisma.review.findFirst({ where: { reviewerId: rev.reviewerId, serviceExpertProfileId: arshadProfile.id } });
      if (!exists) {
        await prisma.review.create({ data: { ...rev, serviceExpertProfileId: arshadProfile.id, targetType: ReviewTargetType.SERVICE_EXPERT } });
      }
    }
  }

  // ── Material Supplier + 10 Materials ─────────────────────────────────────
  await prisma.user.upsert({
    where: { id: IDS.supplier },
    update: {},
    create: { id: IDS.supplier, name: 'Kashmir BuildMart', email: 'kashmir.buildmart@seed.griffy.dev', phone: '+919419000031', role: UserRole.MATERIAL_SUPPLIER },
  });

  const supplier = await prisma.materialSupplierProfile.upsert({
    where: { userId: IDS.supplier },
    update: {},
    create: {
      userId: IDS.supplier,
      businessName: 'Kashmir BuildMart Pvt. Ltd.',
      gstNumber: '01AABCK9603R1Z2',
      businessAddress: 'Plot 14, Industrial Estate, Rangreth, Srinagar - 190007',
      deliveryCities: ['Srinagar', 'Baramulla', 'Jammu', 'Sopore', 'Anantnag'],
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: NOW,
      avgRating: 4.4,
      totalReviews: 138,
    },
  });

  const materials = [
    { name: 'OPC 53 Grade Cement', description: '50 kg bag — ideal for RCC structural work, foundations, and columns. Tested for J&K earthquake zone IV requirements.', category: 'Cement', subcategory: 'OPC', price: 430, unit: 'bag', stock: 4000 },
    { name: 'PPC Blended Cement', description: '50 kg bag — Portland Pozzolana Cement, preferred for plastering and masonry in J&K\'s humid conditions.', category: 'Cement', subcategory: 'PPC', price: 400, unit: 'bag', stock: 2500 },
    { name: 'TMT Steel Bar 12mm', description: 'Fe-500D grade TMT rebar — corrosion resistant, ductile for seismic zone IV (J&K). BIS certified.', category: 'Steel', subcategory: 'TMT Bars', price: 76, unit: 'kg', stock: 18000 },
    { name: 'TMT Steel Bar 8mm', description: 'Fe-500D grade TMT rebar — ideal for stirrups and distribution bars in earthquake-resistant design.', category: 'Steel', subcategory: 'TMT Bars', price: 79, unit: 'kg', stock: 12000 },
    { name: 'Vitrified Floor Tiles 600x600', description: 'Anti-frost vitrified tiles — tested for J&K winters. High-gloss polished finish, 8mm thickness.', category: 'Tiles', subcategory: 'Vitrified', price: 45, unit: 'sq ft', stock: 7000 },
    { name: 'Ceramic Wall Tiles 300x450', description: 'Water-resistant ceramic wall tiles for kitchen and bathroom. Anti-mold glaze suitable for high-humidity Kashmir homes.', category: 'Tiles', subcategory: 'Ceramic Wall', price: 30, unit: 'sq ft', stock: 5000 },
    { name: 'Red Clay Bricks', description: 'Machine-made bricks 230x115x75mm — high-strength 7.5 N/mm² for load-bearing walls.', category: 'Bricks', subcategory: 'Clay Bricks', price: 9, unit: 'piece', stock: 80000 },
    { name: 'AAC Blocks 600x200x150', description: 'Autoclaved Aerated Concrete blocks — excellent thermal insulation for Kashmir cold. Lightweight, fire resistant.', category: 'Bricks', subcategory: 'AAC Blocks', price: 68, unit: 'piece', stock: 10000 },
    { name: 'Exterior Emulsion Paint 20L', description: 'Weather-resistant exterior paint with anti-freeze additives — withstands J&K winters. 6-year warranty, 500+ shades.', category: 'Paint', subcategory: 'Exterior Emulsion', price: 3400, unit: 'can', stock: 600 },
    { name: 'Interior Emulsion Paint 20L', description: 'Anti-mold interior wall paint — low VOC, washable, ideal for J&K\'s humid interiors during winter.', category: 'Paint', subcategory: 'Interior Emulsion', price: 2950, unit: 'can', stock: 900 },
  ];

  for (const mat of materials) {
    const exists = await prisma.material.findFirst({ where: { name: mat.name, supplierId: supplier.id } });
    if (!exists) {
      await prisma.material.create({ data: { supplierId: supplier.id, ...mat } });
    }
  }
  console.log('✅ 1 material supplier + 10 materials seeded');

  // ── Land Owners + Land Listings ───────────────────────────────────────────
  await prisma.user.upsert({
    where: { id: IDS.landOwner },
    update: {},
    create: { id: IDS.landOwner, name: 'Ghulam Qadir Shah', email: 'ghulam.shah@seed.griffy.dev', phone: '+919419000041', role: UserRole.LAND_OWNER },
  });
  await prisma.user.upsert({
    where: { id: IDS.landOwner2 },
    update: {},
    create: { id: IDS.landOwner2, name: 'Ramesh Chandra Gupta', email: 'ramesh.gupta@seed.griffy.dev', phone: '+919419000042', role: UserRole.LAND_OWNER },
  });

  const landOwner = await prisma.landOwnerProfile.upsert({
    where: { userId: IDS.landOwner },
    update: {},
    create: { userId: IDS.landOwner, govtIdVerified: true, bio: 'Agricultural and orchard land owner across the Kashmir Valley — Baramulla and Sopore belt.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW },
  });
  const landOwner2 = await prisma.landOwnerProfile.upsert({
    where: { userId: IDS.landOwner2 },
    update: {},
    create: { userId: IDS.landOwner2, govtIdVerified: true, bio: 'Residential and commercial plot dealer across Jammu and Srinagar.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW },
  });

  const lands1 = [
    { title: 'Apple Orchard Land in Sopore', description: 'Prime apple orchard land in the famous Sopore apple belt. 4 acre with mature apple trees, bore well, and road access. High yield zone.', landType: LandType.AGRICULTURAL, areaSqFt: 174240, price: 7500000, location: 'Sopore Fruit Mandi Road, Baramulla District', city: 'Baramulla', state: 'Jammu & Kashmir' },
    { title: 'Residential Plot in Baramulla Town', description: 'JKDFC-approved residential plot in Baramulla town center. 40ft road frontage, water and electricity connections ready.', landType: LandType.RESIDENTIAL, areaSqFt: 2700, price: 3200000, location: 'New Colony, Baramulla Town', city: 'Baramulla', state: 'Jammu & Kashmir' },
    { title: 'Agricultural Land near Wular Lake', description: 'Fertile paddy land near Wular Lake, Bandipora. Assured water supply from natural springs. Clear title, no encumbrances.', landType: LandType.AGRICULTURAL, areaSqFt: 130680, price: 4200000, location: 'Wular Lake Road, Bandipora', city: 'Baramulla', state: 'Jammu & Kashmir' },
    { title: 'Commercial Plot in Sopore Bypass', description: 'Highway-facing commercial land on the Sopore bypass. Ideal for showroom, petrol pump, or commercial complex.', landType: LandType.COMMERCIAL, areaSqFt: 6534, price: 12000000, location: 'Sopore Bypass, NH-701', city: 'Baramulla', state: 'Jammu & Kashmir' },
    { title: 'Srinagar Dal Lake Vicinity Land', description: 'Rare residential land near Dal Lake in Nishat. Unobstructed lake and mountain views. Clear title, JKDA approved layout.', landType: LandType.RESIDENTIAL, areaSqFt: 3600, price: 18000000, location: 'Nishat, Dal Lake Road, Srinagar', city: 'Srinagar', state: 'Jammu & Kashmir' },
  ];

  const lands2 = [
    { title: 'Residential Plot in Jammu Trikuta Nagar', description: 'JDA-approved residential plot in the upscale Trikuta Nagar extension. 30x50 corner plot, all amenities ready.', landType: LandType.RESIDENTIAL, areaSqFt: 1500, price: 5500000, location: 'Trikuta Nagar Extension, Jammu', city: 'Jammu', state: 'Jammu & Kashmir' },
    { title: 'Commercial Land on Jammu NH-44', description: 'Highway-facing commercial plot on NH-44 (Delhi–Srinagar highway). Ideal for hotel, fuel station, or logistics hub.', landType: LandType.COMMERCIAL, areaSqFt: 10890, price: 32000000, location: 'NH-44, Near Nagrota, Jammu', city: 'Jammu', state: 'Jammu & Kashmir' },
    { title: 'Mixed-Use Land in Srinagar Nowgam', description: 'JKDA-approved mixed-use plot near Nowgam bypass. Suitable for residential + commercial development.', landType: LandType.MIXED, areaSqFt: 9000, price: 11500000, location: 'Nowgam Bypass, Srinagar', city: 'Srinagar', state: 'Jammu & Kashmir' },
  ];

  for (const land of lands1) {
    const exists = await prisma.land.findFirst({ where: { title: land.title, ownerId: landOwner.id } });
    if (!exists) await prisma.land.create({ data: { ownerId: landOwner.id, ...land } });
  }
  for (const land of lands2) {
    const exists = await prisma.land.findFirst({ where: { title: land.title, ownerId: landOwner2.id } });
    if (!exists) await prisma.land.create({ data: { ownerId: landOwner2.id, ...land } });
  }
  console.log('✅ 2 land owners + 8 land & plot listings seeded');

  // ── Property Seller (Buy) ─────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { id: IDS.propertySeller },
    update: {},
    create: { id: IDS.propertySeller, name: 'Kashmir Homes', email: 'kashmir.homes@seed.griffy.dev', phone: '+919419000051', role: UserRole.PROPERTY_SELLER },
  });

  const propertySeller = await prisma.propertySellerProfile.upsert({
    where: { userId: IDS.propertySeller },
    update: {},
    create: { userId: IDS.propertySeller, govtIdVerified: true, bio: 'Premium property developer in Srinagar and Jammu.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW },
  });

  const buyProperties = [
    { title: '3BHK Apartment in Srinagar Rajbagh', description: 'Spacious 3BHK in Rajbagh\'s most sought-after locality. Double-glazed windows for winter insulation, modular kitchen, covered parking. East-facing with Zabarwan mountain views.', propertyType: PropertyType.APARTMENT, furnishing: FurnishingStatus.SEMI_FURNISHED, areaSqFt: 1550, price: 11500000, bedrooms: 3, bathrooms: 2, location: 'Rajbagh Colony, Srinagar', city: 'Srinagar', state: 'Jammu & Kashmir', listingType: 'buy' },
    { title: '4BHK Villa near Dal Lake', description: 'Luxury villa with panoramic Dal Lake and Himalayan mountain views. Central heating, walnut wood interiors, private garden, 2-car garage. Vaastu compliant.', propertyType: PropertyType.VILLA, furnishing: FurnishingStatus.FULLY_FURNISHED, areaSqFt: 2800, price: 28000000, bedrooms: 4, bathrooms: 4, location: 'Boulevard Road, Nishat, Srinagar', city: 'Srinagar', state: 'Jammu & Kashmir', listingType: 'buy' },
    { title: '4BHK Independent House in Jammu Gandhi Nagar', description: 'Spacious G+1 independent house in Gandhi Nagar, Jammu\'s premium residential area. Ready to move. All clearances in place. Large terrace.', propertyType: PropertyType.INDEPENDENT_HOUSE, furnishing: FurnishingStatus.UNFURNISHED, areaSqFt: 3000, price: 16500000, bedrooms: 4, bathrooms: 4, location: 'Gandhi Nagar, Jammu', city: 'Jammu', state: 'Jammu & Kashmir', listingType: 'buy' },
  ];

  for (const prop of buyProperties) {
    const exists = await prisma.property.findFirst({ where: { title: prop.title, sellerId: propertySeller.id } });
    if (!exists) await prisma.property.create({ data: { sellerId: propertySeller.id, ...prop } });
  }
  console.log('✅ 3 buy property listings seeded');

  // ── Rent Seller + 4 Rent Listings ────────────────────────────────────────
  await prisma.user.upsert({
    where: { id: IDS.rentSeller },
    update: {},
    create: { id: IDS.rentSeller, name: 'J&K Rentals', email: 'jk.rentals@seed.griffy.dev', phone: '+919419000061', role: UserRole.PROPERTY_SELLER },
  });

  const rentSeller = await prisma.propertySellerProfile.upsert({
    where: { userId: IDS.rentSeller },
    update: {},
    create: { userId: IDS.rentSeller, govtIdVerified: true, bio: 'Residential rental specialist across Srinagar, Jammu, and Baramulla.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW },
  });

  const rentProperties = [
    { title: '2BHK for Rent in Srinagar Jawahar Nagar', description: 'Fully furnished 2BHK with central heating, double-glazed windows, and modular kitchen. Walking distance to Polo View Market and Dal Lake promenade.', propertyType: PropertyType.APARTMENT, furnishing: FurnishingStatus.FULLY_FURNISHED, areaSqFt: 1100, price: 28000, bedrooms: 2, bathrooms: 2, location: 'Jawahar Nagar, Srinagar', city: 'Srinagar', state: 'Jammu & Kashmir', listingType: 'rent' },
    { title: '3BHK for Rent in Jammu Nanak Nagar', description: 'Semi-furnished 3BHK apartment with AC and power backup. Near Jammu University and major hospitals. 24hr water supply, security.', propertyType: PropertyType.APARTMENT, furnishing: FurnishingStatus.SEMI_FURNISHED, areaSqFt: 1450, price: 22000, bedrooms: 3, bathrooms: 2, location: 'Nanak Nagar, Jammu', city: 'Jammu', state: 'Jammu & Kashmir', listingType: 'rent' },
    { title: '4BHK House for Rent in Srinagar Hyderpora', description: 'Spacious G+1 independent house near Hyderpora tech park. Ideal for corporate families. Central heating, terrace, 2-car parking. Immediate possession.', propertyType: PropertyType.INDEPENDENT_HOUSE, furnishing: FurnishingStatus.SEMI_FURNISHED, areaSqFt: 2400, price: 55000, bedrooms: 4, bathrooms: 3, location: 'Hyderpora, Srinagar', city: 'Srinagar', state: 'Jammu & Kashmir', listingType: 'rent' },
    { title: '1BHK for Rent in Baramulla Town', description: 'Compact furnished 1BHK in Baramulla town center. Perfect for government employees and professionals posted in Baramulla district.', propertyType: PropertyType.APARTMENT, furnishing: FurnishingStatus.FULLY_FURNISHED, areaSqFt: 600, price: 9500, bedrooms: 1, bathrooms: 1, location: 'Main Town, Baramulla', city: 'Baramulla', state: 'Jammu & Kashmir', listingType: 'rent' },
  ];

  for (const prop of rentProperties) {
    const exists = await prisma.property.findFirst({ where: { title: prop.title, sellerId: rentSeller.id } });
    if (!exists) await prisma.property.create({ data: { sellerId: rentSeller.id, ...prop } });
  }
  console.log('✅ 4 rent property listings seeded');

  // ── Builder + 3 New Project Listings ─────────────────────────────────────
  await prisma.user.upsert({
    where: { id: IDS.builderSeller },
    update: {},
    create: { id: IDS.builderSeller, name: 'Griffy Builders', email: 'griffy.builders@seed.griffy.dev', phone: '+919419000071', role: UserRole.PROPERTY_SELLER },
  });

  const builderSeller = await prisma.propertySellerProfile.upsert({
    where: { userId: IDS.builderSeller },
    update: {},
    create: { userId: IDS.builderSeller, govtIdVerified: true, bio: 'RERA-registered real-estate developer with flagship projects across J&K.', approvalStatus: ApprovalStatus.APPROVED, approvedAt: NOW },
  });

  const newProjects = [
    { title: 'Griffy Chenab Heights — 2 & 3 BHK', description: 'Under-construction luxury project in Srinagar\'s IT corridor. Triple-glazed windows, radiant floor heating, and backup generator standard. 78% sold. Possession: Jun 2027. RERA: JK/01/2024/1189.', propertyType: PropertyType.APARTMENT, furnishing: FurnishingStatus.UNFURNISHED, areaSqFt: 1350, price: 13500000, bedrooms: 3, bathrooms: 2, location: 'Nowgam IT Corridor, Srinagar', city: 'Srinagar', state: 'Jammu & Kashmir', listingType: 'new' },
    { title: 'Griffy Tawi Enclave — Villa Township', description: 'Gated villa township on the outskirts of Jammu near Tawi riverfront. 18-acre project with club house, jogging track, temple. Possession: Dec 2026. RERA: JK/01/2024/2254.', propertyType: PropertyType.VILLA, furnishing: FurnishingStatus.UNFURNISHED, areaSqFt: 2200, price: 21000000, bedrooms: 3, bathrooms: 4, location: 'Tawi Riverfront Road, Jammu', city: 'Jammu', state: 'Jammu & Kashmir', listingType: 'new' },
    { title: 'Griffy Himalaya Towers — High-Rise', description: '24-floor luxury towers in Baramulla town. Mountain-facing apartments with panoramic Himalayan views. Rooftop deck, smart home automation. RERA: JK/01/2024/3310.', propertyType: PropertyType.APARTMENT, furnishing: FurnishingStatus.UNFURNISHED, areaSqFt: 1200, price: 9800000, bedrooms: 2, bathrooms: 2, location: 'Block A, New Town Baramulla', city: 'Baramulla', state: 'Jammu & Kashmir', listingType: 'new' },
  ];

  for (const prop of newProjects) {
    const exists = await prisma.property.findFirst({ where: { title: prop.title, sellerId: builderSeller.id } });
    if (!exists) await prisma.property.create({ data: { sellerId: builderSeller.id, ...prop } });
  }
  console.log('✅ 3 new project listings seeded');

  // ── Griffy — first-party brand: contractor + material seller + land lister ──
  // Griffy operates on its own marketplace the way Cloudtail sells on Amazon —
  // one account, multiple seller/provider roles, so the platform itself has
  // real inventory and listings from day one instead of an empty catalog.
  await prisma.user.upsert({
    where: { id: IDS.griffyBrand },
    update: { isFirstParty: true },
    create: {
      id: IDS.griffyBrand,
      name: 'Griffy',
      email: 'store@griffy.in',
      phone: '+911145678900',
      role: UserRole.MATERIAL_SUPPLIER,
      isFirstParty: true,
    },
  });

  await prisma.contractorProfile.upsert({
    where: { userId: IDS.griffyBrand },
    update: {},
    create: {
      userId: IDS.griffyBrand,
      contractorType: 'Turnkey / Full Construction',
      tradeSkills: ['Turnkey Construction', 'Project Management', 'Full Home Building', 'Renovation'],
      experience: 'Platform-run — backed by Griffy\'s in-house project management team and vetted partner network',
      serviceCities: ['Gurgaon', 'Delhi', 'Noida', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'],
      isAvailable: true,
      bio: 'Griffy\'s own turnkey construction arm — for homeowners who\'d rather hand over the whole project than manage a dozen vendors. We run design, contractors, materials, and labour under one roof, with the same quality bar we hold every professional on the platform to.',
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: NOW,
      avgRating: 4.7,
      totalReviews: 42,
      totalJobs: 58,
      completionRate: 98.1,
    },
  });
  console.log('✅ Griffy contractor profile seeded');

  const griffySupplier = await prisma.materialSupplierProfile.upsert({
    where: { userId: IDS.griffyBrand },
    update: {},
    create: {
      userId: IDS.griffyBrand,
      businessName: 'Griffy Store (Official)',
      gstNumber: '06AABCG5678H1Z5',
      businessAddress: 'Griffy IT Services Pvt. Ltd., Sector 56, Gurgaon, Haryana 122011',
      deliveryCities: ['Gurgaon', 'Delhi', 'Noida', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'],
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: NOW,
      avgRating: 4.6,
      totalReviews: 612,
      totalOrders: 340,
    },
  });

  const griffyMaterials = [
    { name: 'UltraTech OPC 53 Grade Cement', description: '50 kg bag — high-strength cement for RCC structural work, foundations, and columns.', category: 'structure', subcategory: 'cement', roomTypes: ['structure'], price: 410, unit: 'per 50kg bag', stock: 5000 },
    { name: 'Griffy Choice M-Sand (Manufactured Sand)', description: 'Washed, graded M-Sand for plastering and masonry — consistent quality, delivered by the truckload.', category: 'structure', subcategory: 'sand', roomTypes: ['structure'], price: 48, unit: 'per cft', stock: 20000 },
    { name: 'AAC Block 600×200×150mm', description: 'Autoclaved Aerated Concrete blocks — lightweight, fire-resistant, faster to lay than red brick.', category: 'structure', subcategory: 'bricks', roomTypes: ['structure'], price: 70, unit: 'per piece', stock: 15000 },
    { name: 'Tata Tiscon TMT Bar 12mm Fe500D', description: 'Fe-500D grade TMT rebar — corrosion resistant, ductile, BIS certified for seismic zones.', category: 'steel', subcategory: 'tmt', roomTypes: ['structure', 'stairs'], price: 68, unit: 'per kg', stock: 25000 },
    { name: 'Tata Tiscon TMT Bar 8mm Fe500D', description: 'Fe-500D grade TMT rebar — ideal for stirrups and distribution bars.', category: 'steel', subcategory: 'tmt', roomTypes: ['structure'], price: 66, unit: 'per kg', stock: 18000 },
    { name: 'Kajaria Kitchen Floor Tile 600×600 Matt', description: 'Slip-resistant matt-finish kitchen floor tile, stain and oil resistant.', category: 'tiles', subcategory: 'ceramic', roomTypes: ['kitchen'], price: 46, unit: 'per sqft', stock: 8000 },
    { name: 'Kajaria Washroom Wall Tile 300×600 Glossy', description: 'High-gloss ceramic wall tile for bathrooms — water resistant, easy to clean.', category: 'tiles', subcategory: 'ceramic', roomTypes: ['washroom'], price: 40, unit: 'per sqft', stock: 9000 },
    { name: 'Kajaria Eternity Vitrified GVT 600×600', description: 'Glazed vitrified floor tile for living rooms and bedrooms — polished, large-format finish.', category: 'tiles', subcategory: 'vitrified', roomTypes: ['living_room', 'bedroom'], price: 50, unit: 'per sqft', stock: 6000 },
    { name: 'Prince Pipes CPVC Pipe 3/4" (3m)', description: 'CPVC pipe for hot and cold water supply lines — corrosion-free, 50-year design life.', category: 'plumbing', subcategory: 'pipes_plumb', roomTypes: ['washroom', 'kitchen'], price: 210, unit: 'per 3m length', stock: 4000 },
    { name: 'Prince Pipes PVC SWR Pipe 4" (3m)', description: 'PVC soil-waste-rain pipe for drainage lines — ISI marked, solvent-weld joints.', category: 'plumbing', subcategory: 'pipes_plumb', roomTypes: ['washroom'], price: 580, unit: 'per 3m length', stock: 2500 },
    { name: 'Hindware Rimless Western WC', description: 'Rimless flush design for easier cleaning — S-trap, ceramic, includes soft-close seat.', category: 'plumbing', subcategory: 'wc_toilet', roomTypes: ['washroom'], price: 5200, unit: 'per piece', stock: 300 },
    { name: 'Cera Wall-Hung Wash Basin', description: 'Compact wall-hung basin — ideal for small bathrooms, includes concealed fitting hardware.', category: 'plumbing', subcategory: 'basins', roomTypes: ['washroom'], price: 2600, unit: 'per piece', stock: 400 },
    { name: 'Jaquar Single Lever Basin Mixer', description: 'Chrome-finish single-lever basin mixer tap with ceramic disc cartridge.', category: 'plumbing', subcategory: 'faucets', roomTypes: ['washroom'], price: 2900, unit: 'per piece', stock: 500 },
    { name: 'Carysil Single Bowl Granite Kitchen Sink', description: 'Granite-composite sink — scratch and heat resistant, includes waste coupling.', category: 'kitchen', subcategory: 'kitchen_sink', roomTypes: ['kitchen'], price: 6800, unit: 'per piece', stock: 250 },
    { name: 'Jaquar Pull-out Kitchen Tap Chrome', description: 'Pull-out spray kitchen tap — 360° swivel, chrome finish.', category: 'kitchen', subcategory: 'kitchen_faucet', roomTypes: ['kitchen'], price: 4300, unit: 'per piece', stock: 300 },
    { name: 'Faber Auto-Clean Chimney 60cm', description: 'Auto-clean kitchen chimney, 1200 m³/hr suction — filterless technology.', category: 'kitchen', subcategory: 'chimney', roomTypes: ['kitchen'], price: 14800, unit: 'per piece', stock: 150 },
    { name: 'Black Galaxy Granite Kitchen Countertop', description: 'Polished granite slab for kitchen countertops — heat and scratch resistant.', category: 'kitchen', subcategory: 'countertop', roomTypes: ['kitchen'], price: 210, unit: 'per sqft', stock: 3000 },
    { name: 'Havells Ventilair 150mm Exhaust Fan', description: 'High-speed exhaust fan for bathrooms and kitchens — rust-proof body.', category: 'plumbing', subcategory: 'accessories', roomTypes: ['washroom', 'kitchen'], price: 1250, unit: 'per piece', stock: 600 },
    { name: 'Havells 2.5mm FRLS Wire 90m', description: 'Fire-retardant low-smoke wiring — for household electrical circuits across all rooms.', category: 'electricals', subcategory: 'wires', roomTypes: ['structure', 'washroom', 'kitchen', 'bedroom', 'living_room'], price: 1980, unit: 'per roll (90m)', stock: 2000 },
    { name: 'Asian Paints Royale Luxury Emulsion 20L', description: 'Premium interior emulsion — washable, low-odour, wide shade range.', category: 'paints', subcategory: 'interior_paint', roomTypes: ['living_room', 'bedroom'], price: 5900, unit: 'per 20L', stock: 800 },
  ];

  for (const mat of griffyMaterials) {
    const exists = await prisma.material.findFirst({ where: { name: mat.name, supplierId: griffySupplier.id } });
    if (!exists) {
      await prisma.material.create({ data: { supplierId: griffySupplier.id, ...mat } });
    }
  }
  console.log(`✅ Griffy material supplier + ${griffyMaterials.length} materials seeded`);

  const griffyLandOwner = await prisma.landOwnerProfile.upsert({
    where: { userId: IDS.griffyBrand },
    update: {},
    create: {
      userId: IDS.griffyBrand,
      govtIdVerified: true,
      bio: 'Griffy\'s own curated and verified land & plot listings — title-checked before they go live.',
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: NOW,
    },
  });

  const griffyLands = [
    { title: 'Residential Plot in Sohna Road, Gurgaon', description: 'HUDA-approved residential plot on Sohna Road — 30x50, road-facing, all utility connections ready. Title verified by Griffy.', landType: LandType.RESIDENTIAL, areaSqFt: 1500, price: 8500000, location: 'Sohna Road, Sector 68, Gurgaon', city: 'Gurgaon', state: 'Haryana' },
    { title: 'Commercial Plot on NH-48, Gurgaon', description: 'Highway-facing commercial land on NH-48 — ideal for showroom or warehousing. Clear title, no encumbrances.', landType: LandType.COMMERCIAL, areaSqFt: 5400, price: 45000000, location: 'NH-48, Sector 37, Gurgaon', city: 'Gurgaon', state: 'Haryana' },
  ];

  for (const land of griffyLands) {
    const exists = await prisma.land.findFirst({ where: { title: land.title, ownerId: griffyLandOwner.id } });
    if (!exists) await prisma.land.create({ data: { ownerId: griffyLandOwner.id, ...land } });
  }
  console.log('✅ Griffy land owner profile + 2 plot listings seeded');

  // ── Turnkey projects (customer = reviewer[0], provider = contractors[0]/[1]) ──
  const turnkeyProject1 = await prisma.turnkeyProject.upsert({
    where: { id: IDS.turnkeyProjects[0] },
    update: {},
    create: {
      id: IDS.turnkeyProjects[0],
      customerId: IDS.reviewers[0],
      providerId: IDS.contractors[0],
      type: 'TURNKEY',
      title: 'Full Home Construction — 3BHK, Rawalpora',
      description: '3BHK independent house, ground-up construction on a 1500 sqft plot in Rawalpora, Srinagar. Foundation to finishing, including electrical and plumbing.',
      budget: 4200000,
      status: 'IN_PROGRESS',
      startDate: new Date(NOW.getTime() - 60 * 24 * 60 * 60 * 1000),
      targetEndDate: new Date(NOW.getTime() + 120 * 24 * 60 * 60 * 1000),
      percentComplete: 35,
    },
  });

  const turnkeyProject2 = await prisma.turnkeyProject.upsert({
    where: { id: IDS.turnkeyProjects[1] },
    update: {},
    create: {
      id: IDS.turnkeyProjects[1],
      customerId: IDS.reviewers[1],
      providerId: IDS.contractors[1],
      type: 'LAND_PLOTTING',
      title: 'Villa Plotting & Layout — Tawi Riverfront',
      description: 'Land plotting and layout approval for a 4-plot residential subdivision near the Tawi riverfront, Jammu.',
      budget: 950000,
      status: 'REQUESTED',
      percentComplete: 0,
    },
  });

  const existingMilestones = await prisma.turnkeyMilestone.count({ where: { projectId: turnkeyProject1.id } });
  if (existingMilestones === 0) {
    await prisma.turnkeyMilestone.createMany({
      data: [
        { projectId: turnkeyProject1.id, title: 'Foundation & Plinth', amount: 1200000, sequence: 1, status: 'APPROVED', paymentStatus: 'PAID' },
        { projectId: turnkeyProject1.id, title: 'RCC Structure & Roofing', amount: 1500000, sequence: 2, status: 'SUBMITTED' },
        { projectId: turnkeyProject1.id, title: 'Brickwork & Plastering', amount: 900000, sequence: 3, status: 'PENDING' },
        { projectId: turnkeyProject1.id, title: 'Finishing & Handover', amount: 600000, sequence: 4, status: 'PENDING' },
      ],
    });
  }

  const existingUpdates = await prisma.turnkeyProjectUpdate.count({ where: { projectId: turnkeyProject1.id } });
  if (existingUpdates === 0) {
    await prisma.turnkeyProjectUpdate.createMany({
      data: [
        { projectId: turnkeyProject1.id, note: 'Foundation work complete, plinth beam cast and cured.', percentComplete: 20 },
        { projectId: turnkeyProject1.id, note: 'Ground floor columns and slab shuttering in progress.', percentComplete: 35 },
      ],
    });
  }
  console.log('✅ 2 turnkey projects + milestones + updates seeded');

  console.log('\n🎉 Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
