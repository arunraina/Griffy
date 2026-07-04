/**
 * Griffy seed script — run with:
 *   cd backend && npx ts-node -r tsconfig-paths/register src/seed.ts
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../.env') });

import { User, UserRole } from './users/user.entity';
import { Material, MaterialCategory } from './materials/material.entity';
import { Contractor, ContractorSpecialty } from './contractors/contractor.entity';
import { Labour, LabourTrade } from './labour/labour.entity';

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'griffy',
  password: process.env.DB_PASS ?? 'griffy_pass',
  database: process.env.DB_NAME ?? 'griffy_db',
  entities: [User, Material, Contractor, Labour],
  synchronize: false,
});

async function seed() {
  await ds.initialize();
  console.log('Connected to DB');

  const userRepo = ds.getRepository(User);
  const matRepo = ds.getRepository(Material);
  const ctrRepo = ds.getRepository(Contractor);
  const lbrRepo = ds.getRepository(Labour);

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // ── Supplier users ──────────────────────────────────────────────────────────

  const supplierDefs = [
    { fullName: 'Kaveri Aggregates Pvt Ltd',    email: 'kaveri@griffy.in',    city: 'Bengaluru',  state: 'Karnataka' },
    { fullName: 'Rajasthan Brick Works',         email: 'rbw@griffy.in',       city: 'Jaipur',     state: 'Rajasthan' },
    { fullName: 'UltraTech Authorized Dealer',   email: 'ultratech@griffy.in', city: 'Mumbai',     state: 'Maharashtra' },
    { fullName: 'JSW Steel Distributors',        email: 'jsw@griffy.in',       city: 'Hyderabad',  state: 'Telangana' },
    { fullName: 'Kashmir Timber House',          email: 'kashmirtimber@griffy.in', city: 'Srinagar', state: 'Jammu & Kashmir' },
    { fullName: 'Kajaria Tiles Dealer',          email: 'kajaria@griffy.in',   city: 'Delhi',      state: 'Delhi' },
    { fullName: 'Asian Paints Depot Pune',       email: 'asianpaints@griffy.in', city: 'Pune',     state: 'Maharashtra' },
    { fullName: 'Havells Electricals Chennai',   email: 'havells@griffy.in',   city: 'Chennai',    state: 'Tamil Nadu' },
    { fullName: 'Supreme Plumbing Ahmedabad',    email: 'supreme@griffy.in',   city: 'Ahmedabad',  state: 'Gujarat' },
    { fullName: 'Deccan Aggregates',             email: 'deccan@griffy.in',    city: 'Pune',       state: 'Maharashtra' },
    { fullName: 'Renacon Infra Ltd',             email: 'renacon@griffy.in',   city: 'Ahmedabad',  state: 'Gujarat' },
    { fullName: 'Deodar Wood Works',             email: 'deodar@griffy.in',    city: 'Jammu',      state: 'Jammu & Kashmir' },
    { fullName: 'Tata Steel Distributors',       email: 'tata@griffy.in',      city: 'Mumbai',     state: 'Maharashtra' },
    { fullName: 'SAIL TMT Depot Kolkata',        email: 'sail@griffy.in',       city: 'Kolkata',   state: 'West Bengal' },
    { fullName: 'Finolex Wire House Pune',       email: 'finolex@griffy.in',   city: 'Pune',       state: 'Maharashtra' },
  ];

  const suppliers: User[] = [];
  for (const def of supplierDefs) {
    const existing = await userRepo.findOne({ where: { email: def.email } });
    if (existing) { suppliers.push(existing); continue; }
    const u = userRepo.create({
      ...def, role: UserRole.SUPPLIER,
      password: await hash('Supplier@123'), isVerified: true,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
    });
    suppliers.push(await userRepo.save(u));
    console.log(`Created supplier: ${def.fullName}`);
  }

  // ── Materials ───────────────────────────────────────────────────────────────

  const materialDefs: Partial<Material & { supplierIdx: number }>[] = [
    // Sand
    { supplierIdx: 0,  name: 'River Sand (Fine Grade)',            category: MaterialCategory.SAND,      pricePerUnit: 1800, unit: 'ton',    minOrderQuantity: 5,   stockQuantity: 500, rating: 4.7, reviewCount: 234, deliveryDays: 'Within 24 hrs', isFeatured: true,  description: 'Premium river sand from certified Kaveri basin quarries. Grade A fine sand ideal for plastering, RCC and brickwork. Meets IS 383:2016. Sieved and washed.' },
    { supplierIdx: 9,  name: 'M-Sand (Manufactured Sand)',         category: MaterialCategory.SAND,      pricePerUnit: 1500, unit: 'ton',    minOrderQuantity: 5,   stockQuantity: 800, rating: 4.5, reviewCount: 156, deliveryDays: 'Within 24 hrs', isFeatured: false, description: 'High-quality manufactured sand made from granite crusher fines. Consistent gradation, no silt or clay. Eco-friendly alternative to river sand. IS 383 compliant.' },
    { supplierIdx: 9,  name: 'P-Sand (Plaster Sand)',              category: MaterialCategory.SAND,      pricePerUnit: 1650, unit: 'ton',    minOrderQuantity: 3,   stockQuantity: 400, rating: 4.6, reviewCount: 98,  deliveryDays: '1–2 days',      isFeatured: false, description: 'Specially processed plaster sand with uniform particle size. Ideal for internal and external plastering, rendering, and wall finishing.' },
    { supplierIdx: 9,  name: 'Coarse Sand (Concrete Grade)',       category: MaterialCategory.SAND,      pricePerUnit: 1400, unit: 'ton',    minOrderQuantity: 5,   stockQuantity: 600, rating: 4.3, reviewCount: 67,  deliveryDays: '1–2 days',      isFeatured: false, description: 'Coarse washed sand suitable for concrete work and foundation filling. Natural aggregates, free from organic matter.' },
    // Bricks
    { supplierIdx: 1,  name: 'Red Clay Bricks (Class A)',          category: MaterialCategory.BRICKS,    pricePerUnit: 8,    unit: 'piece',  minOrderQuantity: 1000, stockQuantity: 200000, rating: 4.8, reviewCount: 412, deliveryDays: '2–3 days',  isFeatured: true,  description: 'First-class red clay bricks fired at 1100°C. Standard size 230×110×75mm, compressive strength >10 N/mm². IS 1077 certified. Ideal for load-bearing walls.' },
    { supplierIdx: 10, name: 'AAC Blocks (600×200×150mm)',         category: MaterialCategory.BRICKS,    pricePerUnit: 45,   unit: 'piece',  minOrderQuantity: 500, stockQuantity: 50000, rating: 4.7, reviewCount: 278, deliveryDays: '2–4 days',   isFeatured: true,  description: 'Autoclaved Aerated Concrete blocks — lightweight, thermally insulating, fire resistant. Reduces dead load by 60% vs clay bricks. IS 2185 compliant.' },
    { supplierIdx: 1,  name: 'Fly Ash Bricks IS 12894',           category: MaterialCategory.BRICKS,    pricePerUnit: 5,    unit: 'piece',  minOrderQuantity: 1000, stockQuantity: 300000, rating: 4.4, reviewCount: 189, deliveryDays: '2–3 days', isFeatured: false, description: 'Eco-friendly fly ash bricks with higher compressive strength than clay bricks. Lower water absorption, IS 12894 standard. Ideal for all masonry work.' },
    { supplierIdx: 1,  name: 'Wire Cut Bricks (Extruded)',         category: MaterialCategory.BRICKS,    pricePerUnit: 7,    unit: 'piece',  minOrderQuantity: 1000, stockQuantity: 150000, rating: 4.5, reviewCount: 134, deliveryDays: '3–4 days', isFeatured: false, description: 'Machine-made wire-cut bricks with uniform dimensions and smooth surface. High density, low water absorption. Suitable for exposed brickwork and boundary walls.' },
    // Cement
    { supplierIdx: 2,  name: 'UltraTech OPC 53 Grade Cement',     category: MaterialCategory.CEMENT,    pricePerUnit: 420,  unit: 'bag',    minOrderQuantity: 20,  stockQuantity: 5000, rating: 4.9, reviewCount: 1089, deliveryDays: 'Same day', isFeatured: true,  description: 'India\'s No.1 cement brand. OPC 53 Grade suitable for high-strength concrete, prestressed concrete, bridges, and industrial flooring. IS 269 certified. 50kg bag.' },
    { supplierIdx: 9,  name: 'ACC Gold PPC Cement',               category: MaterialCategory.CEMENT,    pricePerUnit: 395,  unit: 'bag',    minOrderQuantity: 20,  stockQuantity: 3000, rating: 4.7, reviewCount: 567, deliveryDays: '1 day',     isFeatured: false, description: 'Portland Pozzolana Cement with fly ash. Better workability, lower heat of hydration, superior durability for coastal and normal construction. 50kg bag.' },
    { supplierIdx: 1,  name: 'Shree Ultra J.K. Cement PPC',       category: MaterialCategory.CEMENT,    pricePerUnit: 380,  unit: 'bag',    minOrderQuantity: 20,  stockQuantity: 2500, rating: 4.6, reviewCount: 345, deliveryDays: '1–2 days',  isFeatured: false, description: 'High quality PPC cement from J.K. Group. Excellent workability, reduced cracking. IS 1489 certified. Ideal for plastering, masonry, and residential construction. 50kg bag.' },
    // Steel
    { supplierIdx: 3,  name: 'JSW Neosteel TMT Fe500D 12mm',      category: MaterialCategory.STEEL,     pricePerUnit: 68000, unit: 'ton',   minOrderQuantity: 1,   stockQuantity: 200,  rating: 4.8, reviewCount: 567, deliveryDays: '1–2 days',  isFeatured: true,  description: 'JSW Neosteel 550D TMT bars with superior ductility and earthquake resistance. Fe500D grade, corrosion resistant. IS 1786 certified. 12mm dia, 12m length.' },
    { supplierIdx: 12, name: 'Tata Tiscon 500SD TMT 10mm',        category: MaterialCategory.STEEL,     pricePerUnit: 66000, unit: 'ton',   minOrderQuantity: 1,   stockQuantity: 150,  rating: 4.9, reviewCount: 789, deliveryDays: '1–2 days',  isFeatured: false, description: 'Tata Tiscon Super Ductile TMT bars. Fe500SD grade with superior bend-rebend properties. Ideal for seismic zones. IS 1786:2008. 10mm dia, 12m length.' },
    { supplierIdx: 13, name: 'SAIL TMT Fe500D 16mm Bars',         category: MaterialCategory.STEEL,     pricePerUnit: 65000, unit: 'ton',   minOrderQuantity: 1,   stockQuantity: 180,  rating: 4.6, reviewCount: 312, deliveryDays: '2–3 days',  isFeatured: false, description: 'SAIL (Steel Authority of India) TMT Fe500D reinforcement bars. High ductility, weldability. Used in heavy-duty foundations, columns, and beams. 16mm dia.' },
    // Wood — J&K featured!
    { supplierIdx: 4,  name: 'Deodar Cedar Beams (J&K)',          category: MaterialCategory.WOOD,      pricePerUnit: 1800, unit: 'cu ft', minOrderQuantity: 10,  stockQuantity: 300,  rating: 4.8, reviewCount: 145, deliveryDays: '4–6 days',  isFeatured: true,  description: 'Authentic Deodar (Cedrus deodara) timber from Jammu & Kashmir forests. Aromatic, naturally rot-resistant, ideal for roof beams, doors, and window frames. Forest dept certified.' },
    { supplierIdx: 11, name: 'Kashmir Pine Wood Planks',          category: MaterialCategory.WOOD,      pricePerUnit: 1400, unit: 'cu ft', minOrderQuantity: 10,  stockQuantity: 400,  rating: 4.6, reviewCount: 89,  deliveryDays: '5–7 days',  isFeatured: false, description: 'Chir Pine (Pinus roxburghii) planks from Jammu. Straight grain, easy to work. Good for furniture, shuttering, and light construction. Seasoned and kiln-dried.' },
    { supplierIdx: 4,  name: 'Teak Grade 1 Planks (Mysuru)',      category: MaterialCategory.WOOD,      pricePerUnit: 2200, unit: 'cu ft', minOrderQuantity: 5,   stockQuantity: 200,  rating: 4.7, reviewCount: 189, deliveryDays: '3–5 days',  isFeatured: false, description: 'Premium Grade 1 teak (Tectona grandis) planks from government depots. Dense, durable, naturally weather-resistant. Ideal for doors, windows, and high-end furniture.' },
    { supplierIdx: 13, name: 'Sal Wood Timber (Bengal)',          category: MaterialCategory.WOOD,      pricePerUnit: 1200, unit: 'cu ft', minOrderQuantity: 10,  stockQuantity: 500,  rating: 4.4, reviewCount: 67,  deliveryDays: '5–7 days',  isFeatured: false, description: 'Shorea robusta (Sal) timber sourced from West Bengal. Hard, heavy wood ideal for structural work, railway sleepers, and rough furniture. Termite resistant.' },
    // Tiles
    { supplierIdx: 5,  name: 'Kajaria Vitrified Tiles 2×2 ft Matt', category: MaterialCategory.TILES,  pricePerUnit: 65,   unit: 'sq ft', minOrderQuantity: 100, stockQuantity: 10000, rating: 4.7, reviewCount: 344, deliveryDays: '2–3 days', isFeatured: true,  description: 'Kajaria Double Charge Vitrified tiles 600×600mm, Matt finish. High durability, low water absorption (<0.1%). Ideal for living rooms, halls, and offices. IS 13712.' },
    { supplierIdx: 10, name: 'Somany Ceramic Wall Tiles 2×1 ft', category: MaterialCategory.TILES,     pricePerUnit: 35,   unit: 'sq ft', minOrderQuantity: 50,  stockQuantity: 8000, rating: 4.5, reviewCount: 178, deliveryDays: '3–4 days',  isFeatured: false, description: 'Somany ceramic wall tiles 600×300mm. Glossy finish, suitable for kitchen backsplash, bathroom walls. Scratch resistant glaze. IS 15622 certified.' },
    { supplierIdx: 2,  name: 'Parking Tiles Anti-Skid 1×1 ft',  category: MaterialCategory.TILES,     pricePerUnit: 55,   unit: 'sq ft', minOrderQuantity: 50,  stockQuantity: 5000, rating: 4.6, reviewCount: 212, deliveryDays: '2–3 days',  isFeatured: false, description: 'Heavy-duty anti-skid ceramic parking tiles 300×300mm. High compressive strength, resistant to chemical attack and heavy vehicles. Ideal for driveways and parking.' },
    // Paint
    { supplierIdx: 6,  name: 'Asian Paints Royale Luxury Emulsion', category: MaterialCategory.PAINT, pricePerUnit: 580,  unit: 'litre', minOrderQuantity: 4,   stockQuantity: 2000, rating: 4.8, reviewCount: 456, deliveryDays: '1–2 days',  isFeatured: true,  description: 'Asian Paints Royale Luxury Emulsion — ultra premium interior wall paint with anti-fungal, anti-bacterial properties. Smooth matt finish. 4L/10L/20L available.' },
    { supplierIdx: 6,  name: 'Nerolac Excel Total Exterior',      category: MaterialCategory.PAINT,    pricePerUnit: 520,  unit: 'litre', minOrderQuantity: 4,   stockQuantity: 1500, rating: 4.6, reviewCount: 289, deliveryDays: '1–2 days',  isFeatured: false, description: 'Kansai Nerolac Excel Total — high performance exterior emulsion. Weatherproof, algae resistant, UV protective. Suitable for all Indian climates including J&K winters.' },
    { supplierIdx: 6,  name: 'Berger WeatherCoat All Guard',      category: MaterialCategory.PAINT,    pricePerUnit: 490,  unit: 'litre', minOrderQuantity: 4,   stockQuantity: 1200, rating: 4.5, reviewCount: 198, deliveryDays: '2–3 days',  isFeatured: false, description: 'Berger WeatherCoat All Guard — elastomeric exterior paint with waterproofing properties. Bridges hairline cracks, protects against driving rain and UV radiation.' },
    // Electrical
    { supplierIdx: 7,  name: 'Havells FRLS Wire 1.5 sqmm (90m)', category: MaterialCategory.ELECTRICAL, pricePerUnit: 1450, unit: 'roll',  minOrderQuantity: 5,   stockQuantity: 500,  rating: 4.8, reviewCount: 234, deliveryDays: '1–2 days',  isFeatured: true,  description: 'Havells Lifeline FRLS (Flame Retardant Low Smoke) PVC insulated copper wire, 1.5sqmm, 90m roll. BIS IS 694 certified. Suitable for domestic light-point wiring.' },
    { supplierIdx: 7,  name: 'Legrand Arteor 6A Switch (White)',  category: MaterialCategory.ELECTRICAL, pricePerUnit: 350,  unit: 'piece', minOrderQuantity: 10,  stockQuantity: 2000, rating: 4.7, reviewCount: 167, deliveryDays: '2–3 days',  isFeatured: false, description: 'Legrand Arteor 6A one-way switch with indicator. Modular, ISI marked. Flame retardant polycarbonate body. Suitable for all Legrand Arteor range switch boxes.' },
    { supplierIdx: 14, name: 'Finolex 4 sqmm Copper Wire (100m)', category: MaterialCategory.ELECTRICAL, pricePerUnit: 3200, unit: 'roll', minOrderQuantity: 3,   stockQuantity: 300,  rating: 4.7, reviewCount: 189, deliveryDays: '1–2 days',  isFeatured: false, description: 'Finolex FR PVC insulated copper cable 4sqmm, 100m roll. Suitable for power circuits, AC sub-circuits and heavy appliances. IS 694 certified.' },
    // Plumbing
    { supplierIdx: 8,  name: 'Astral CPVC Pipe 20mm (3m)',        category: MaterialCategory.PLUMBING,  pricePerUnit: 85,   unit: 'piece', minOrderQuantity: 20,  stockQuantity: 3000, rating: 4.8, reviewCount: 312, deliveryDays: '1–2 days',  isFeatured: true,  description: 'Astral FlowGuard Plus CPVC pipe 20mm OD, 3m length. Hot & cold water rated upto 93°C. NSF/ANSI 61 certified. 50-year warranty. Easy solvent welding joint.' },
    { supplierIdx: 8,  name: 'Jaguar Concealed Stopcock 15mm',    category: MaterialCategory.PLUMBING,  pricePerUnit: 1200, unit: 'piece', minOrderQuantity: 5,   stockQuantity: 500,  rating: 4.6, reviewCount: 145, deliveryDays: '2–3 days',  isFeatured: false, description: 'Jaguar concealed angle stopcock 15mm (½ inch) full-bore. Brass body with chrome plating. For bathroom and kitchen isolation. 5-year warranty.' },
    { supplierIdx: 8,  name: 'Prince UPVC Column Pipe 4" (6m)',   category: MaterialCategory.PLUMBING,  pricePerUnit: 1800, unit: 'piece', minOrderQuantity: 5,   stockQuantity: 800,  rating: 4.5, reviewCount: 89,  deliveryDays: '2–4 days',  isFeatured: false, description: 'Prince UPVC column pipe 4-inch dia, 6m length for submersible pumps. IS 16647 compliant, UV stabilised, pressure rated PN 10. Suitable for borewells up to 200ft depth.' },
  ];

  for (const def of materialDefs) {
    const { supplierIdx, ...rest } = def as any;
    const existing = await matRepo.findOne({ where: { name: rest.name } });
    if (existing) continue;
    const m = matRepo.create({ ...rest, supplierId: suppliers[supplierIdx].id, isAvailable: true });
    await matRepo.save(m);
    console.log(`Created material: ${rest.name}`);
  }

  // ── Contractor users + profiles ─────────────────────────────────────────────

  const contractorDefs = [
    {
      user: { fullName: 'Rajan P', email: 'rajan@griffy.in', city: 'Bengaluru', state: 'Karnataka' },
      profile: { businessName: 'Rajan Constructions', specialty: ContractorSpecialty.CIVIL, experienceYears: 14, priceRangeMin: 800, priceRangeMax: 1200, priceUnit: 'sqft', rating: 4.9, reviewCount: 287, completedProjects: 143, isAvailable: true, isVerified: true, licenseNumber: 'KA-CONT-2034-BLR', bio: 'Full-service civil construction company in Bengaluru. 14 years experience, 143+ projects across Bengaluru, Mysuru and Mangaluru. RCC structures, foundations, brickwork, plastering, waterproofing.', skills: ['RCC Construction', 'Foundation Work', 'Brickwork & Plastering', 'Waterproofing', 'Flooring', 'Roofing'] },
    },
    {
      user: { fullName: 'Vikram Mehta', email: 'vikram@griffy.in', city: 'Mumbai', state: 'Maharashtra' },
      profile: { businessName: 'Mehta & Associates', specialty: ContractorSpecialty.STRUCTURAL, experienceYears: 20, priceRangeMin: 1200, priceRangeMax: 2000, priceUnit: 'sqft', rating: 4.8, reviewCount: 412, completedProjects: 230, isAvailable: true, isVerified: true, licenseNumber: 'MH-STR-0892-MUM', bio: 'Structural engineering firm with 20 years of experience in Mumbai and Pune. Specialise in structural design, load calculations, BIS standard compliance. 230+ residential and commercial projects.', skills: ['Structural Design', 'Load Calculation', 'BIS Standards', 'AutoCAD', 'ETABS', 'Foundation Design'] },
    },
    {
      user: { fullName: 'Suresh Kumar', email: 'suresh.electric@griffy.in', city: 'Hyderabad', state: 'Telangana' },
      profile: { businessName: 'Powerline Electricals', specialty: ContractorSpecialty.ELECTRICAL, experienceYears: 10, priceRangeMin: 80, priceRangeMax: 150, priceUnit: 'sqft', rating: 4.7, reviewCount: 198, completedProjects: 310, isAvailable: false, isVerified: true, licenseNumber: 'TS-ELEC-4521-HYD', bio: 'Licensed electrical contractor serving Hyderabad and Secunderabad. Specialise in complete house wiring, 3-phase connections, solar panel integration and EV charging stations.', skills: ['House Wiring', '3-Phase Connection', 'Solar Integration', 'Panel Setup', 'EV Charging', 'Fire Alarm'] },
    },
    {
      user: { fullName: 'Ajay Sharma', email: 'ajay.plumb@griffy.in', city: 'Delhi', state: 'Delhi' },
      profile: { businessName: 'AquaFix Plumbing', specialty: ContractorSpecialty.PLUMBING, experienceYears: 8, priceRangeMin: 60, priceRangeMax: 100, priceUnit: 'sqft', rating: 4.6, reviewCount: 153, completedProjects: 280, isAvailable: true, isVerified: true, licenseNumber: 'DL-PLMB-7823-DEL', bio: 'Delhi-based plumbing contractor with expertise in CPVC, UPVC and GI piping. Complete bathrooms, STP systems, water proofing and borewell installations. Fast response, quality guarantee.', skills: ['CPVC Piping', 'STP Systems', 'Waterproofing', 'Borewell', 'Bathroom Fitting', 'UPVC'] },
    },
    {
      user: { fullName: 'Priya Nambiar', email: 'priya@griffy.in', city: 'Kochi', state: 'Kerala' },
      profile: { businessName: 'Studio Interio', specialty: ContractorSpecialty.INTERIOR, experienceYears: 12, priceRangeMin: 1500, priceRangeMax: 4000, priceUnit: 'sqft', rating: 4.9, reviewCount: 345, completedProjects: 180, isAvailable: true, isVerified: true, licenseNumber: 'KL-INT-2211-KOC', bio: 'Award-winning interior design studio based in Kochi. 12 years creating stunning residential spaces across Kerala and Bengaluru. Specialise in modular kitchens, false ceilings, custom furniture and 3D visualisation.', skills: ['Modular Kitchen', 'False Ceiling', 'Custom Wardrobe', '3D Design', 'Space Planning', 'Turnkey Interior'] },
    },
    {
      user: { fullName: 'Mohan Das', email: 'mohan@griffy.in', city: 'Chennai', state: 'Tamil Nadu' },
      profile: { businessName: 'ColorPro Painters', specialty: ContractorSpecialty.PAINTING, experienceYears: 6, priceRangeMin: 18, priceRangeMax: 35, priceUnit: 'sqft', rating: 4.5, reviewCount: 121, completedProjects: 420, isAvailable: true, isVerified: true, licenseNumber: 'TN-PAINT-3312-CHE', bio: 'Professional painting contractor serving Chennai and surrounding areas. Expert in Asian Paints, Nerolac and Berger applications. Texture painting, wall putty, exterior weather coating and epoxy flooring specialists.', skills: ['Interior Emulsion', 'Exterior Coating', 'Texture Painting', 'Wall Putty', 'Enamel Paint', 'Epoxy Flooring'] },
    },
    {
      user: { fullName: 'Bashir Ahmed', email: 'bashir@griffy.in', city: 'Srinagar', state: 'Jammu & Kashmir' },
      profile: { businessName: 'Bashir Construction Co.', specialty: ContractorSpecialty.CIVIL, experienceYears: 16, priceRangeMin: 750, priceRangeMax: 1100, priceUnit: 'sqft', rating: 4.8, reviewCount: 167, completedProjects: 98, isAvailable: true, isVerified: true, licenseNumber: 'JK-CONT-0934-SRG', bio: 'Leading civil contractor in Jammu & Kashmir. 16 years experience building homes, hotels and commercial structures in the valley. Expertise in earthquake-resistant construction and cold-climate building techniques suitable for J&K conditions.', skills: ['Earthquake-Resistant RCC', 'Cold Climate Construction', 'Stone Masonry', 'Timber Framing', 'Foundation in Rocky Terrain', 'Snow Load Design'] },
    },
    {
      user: { fullName: 'Ramesh Gupta', email: 'ramesh@griffy.in', city: 'Jaipur', state: 'Rajasthan' },
      profile: { businessName: 'Gupta Architects', specialty: ContractorSpecialty.ARCHITECT, experienceYears: 18, priceRangeMin: 50, priceRangeMax: 150, priceUnit: 'sqft', rating: 4.7, reviewCount: 234, completedProjects: 165, isAvailable: true, isVerified: true, licenseNumber: 'RJ-ARCH-1122-JAI', bio: 'Council of Architecture registered architect with 18 years experience in Jaipur. Blend of traditional Rajasthani architecture with modern design. Expert in vastu-compliant layouts, sustainable design and government approval drawings.', skills: ['Architectural Design', 'Vastu Compliance', 'AutoCAD', 'Revit BIM', 'Govt Approvals', 'Sustainable Design'] },
    },
    {
      user: { fullName: 'Naveen Kumar', email: 'naveen@griffy.in', city: 'Bengaluru', state: 'Karnataka' },
      profile: { businessName: 'Naveen Civil Works', specialty: ContractorSpecialty.CIVIL, experienceYears: 9, priceRangeMin: 650, priceRangeMax: 950, priceUnit: 'sqft', rating: 4.6, reviewCount: 145, completedProjects: 67, isAvailable: true, isVerified: false, licenseNumber: null as any, bio: 'Bengaluru-based civil contractor focusing on affordable quality housing. Transparent pricing, no hidden costs. Specialize in apartment construction, row houses and villas in North and East Bengaluru.', skills: ['Residential Construction', 'RCC Work', 'Brickwork', 'Tiling', 'Plastering', 'Interior Finishing'] },
    },
    {
      user: { fullName: 'Dinesh Verma', email: 'dinesh@griffy.in', city: 'Lucknow', state: 'Uttar Pradesh' },
      profile: { businessName: 'Verma Constructions', specialty: ContractorSpecialty.CIVIL, experienceYears: 11, priceRangeMin: 600, priceRangeMax: 900, priceUnit: 'sqft', rating: 4.5, reviewCount: 98, completedProjects: 78, isAvailable: true, isVerified: true, licenseNumber: 'UP-CONT-5678-LKO', bio: 'Established civil contractor serving Lucknow and Kanpur. Specialise in residential and government construction projects. Experienced in UP-RERA compliant projects and PMAY housing schemes.', skills: ['Residential RCC', 'Government Projects', 'PMAY Housing', 'Boundary Walls', 'Site Supervision', 'BOQ Estimation'] },
    },
  ];

  for (const def of contractorDefs) {
    const existing = await userRepo.findOne({ where: { email: def.user.email } });
    let cUser: User;
    if (existing) {
      cUser = existing;
    } else {
      cUser = await userRepo.save(userRepo.create({
        ...def.user, role: UserRole.CONTRACTOR,
        password: await hash('Contractor@123'), isVerified: true,
        phone: `+91 99${Math.floor(10000000 + Math.random() * 89999999)}`,
      }));
      console.log(`Created contractor user: ${def.user.fullName}`);
    }
    const cExisting = await ctrRepo.findOne({ where: { userId: cUser.id } });
    if (!cExisting) {
      await ctrRepo.save(ctrRepo.create({ ...def.profile, userId: cUser.id, city: def.user.city, state: def.user.state }));
      console.log(`Created contractor profile: ${def.profile.businessName}`);
    }
  }

  // ── Labour users + profiles ─────────────────────────────────────────────────

  const labourDefs = [
    { user: { fullName: 'Mohammed Rafiq', email: 'rafiq@griffy.in', city: 'Bengaluru', state: 'Karnataka' }, profile: { trade: LabourTrade.MASON, experienceYears: 12, dailyRate: 900, weeklyRate: 5500, rating: 4.8, reviewCount: 167, completedJobs: 340, isAvailable: true, isVerified: true, bio: 'Experienced mason with 12 years in Bengaluru. Expert in brickwork, plastering, tile fixing and waterproofing. Zero-rework guarantee. Available for daily or long-term site contracts.', skills: ['Brickwork', 'Plastering', 'Tile Fixing', 'Waterproofing', 'Concrete Pouring', 'RCC Repair'], languages: ['Kannada', 'Hindi', 'Urdu'] } },
    { user: { fullName: 'Sanjay Bhosale', email: 'sanjay@griffy.in', city: 'Mumbai', state: 'Maharashtra' }, profile: { trade: LabourTrade.ELECTRICIAN, experienceYears: 8, dailyRate: 750, weeklyRate: 4500, rating: 4.7, reviewCount: 234, completedJobs: 510, isAvailable: true, isVerified: true, bio: 'Licensed electrician with 8 years experience in Mumbai. Expertise in complete house wiring, DB panel installation, earthing and solar connections. ITI certified.', skills: ['House Wiring', 'DB Panel', 'Earthing', 'Switchboard', 'Conduit Work', 'Solar Wiring'], languages: ['Hindi', 'Marathi'] } },
    { user: { fullName: 'Ramu Venkatesh', email: 'ramu@griffy.in', city: 'Hyderabad', state: 'Telangana' }, profile: { trade: LabourTrade.PLUMBER, experienceYears: 6, dailyRate: 650, weeklyRate: 3900, rating: 4.6, reviewCount: 98, completedJobs: 220, isAvailable: false, isVerified: true, bio: 'Reliable plumber serving Hyderabad. Specialise in CPVC/UPVC piping, bathroom installations, drain repairs and water tank connections. Available for emergency repairs.', skills: ['CPVC Fitting', 'Bathroom Installation', 'Drain Repair', 'Water Tank', 'UPVC Piping', 'Tap Fitting'], languages: ['Telugu', 'Hindi'] } },
    { user: { fullName: 'Arjun Chandrasekhar', email: 'arjun@griffy.in', city: 'Chennai', state: 'Tamil Nadu' }, profile: { trade: LabourTrade.CARPENTER, experienceYears: 15, dailyRate: 1100, weeklyRate: 6500, rating: 4.9, reviewCount: 310, completedJobs: 450, isAvailable: true, isVerified: true, bio: 'Master carpenter with 15 years in Chennai. Expert in custom furniture, modular kitchens, doors, windows and polish work. Teak and plywood specialist.', skills: ['Custom Furniture', 'Modular Kitchen', 'Doors & Windows', 'Polish Work', 'Plywood Work', 'Veneer Finish'], languages: ['Tamil', 'Telugu', 'Hindi (basic)'] } },
    { user: { fullName: 'Deepak Pratap', email: 'deepak@griffy.in', city: 'Delhi', state: 'Delhi' }, profile: { trade: LabourTrade.PAINTER, experienceYears: 9, dailyRate: 700, weeklyRate: 4200, rating: 4.7, reviewCount: 189, completedJobs: 380, isAvailable: true, isVerified: true, bio: 'Professional painter with expertise in Asian Paints, Nerolac and Berger. Interior emulsion, exterior weather coat, texture painting and wood staining. Wall putty specialist.', skills: ['Interior Emulsion', 'Exterior Coating', 'Texture Painting', 'Wall Putty', 'Enamel Paint', 'Wood Staining'], languages: ['Hindi', 'Punjabi', 'Urdu'] } },
    { user: { fullName: 'Kumar Thampi', email: 'kumar@griffy.in', city: 'Kochi', state: 'Kerala' }, profile: { trade: LabourTrade.TILER, experienceYears: 7, dailyRate: 850, weeklyRate: 5100, rating: 4.8, reviewCount: 145, completedJobs: 290, isAvailable: true, isVerified: true, bio: 'Precision tiler from Kochi with 7 years experience. Expert in vitrified tiles, wall tiles, mosaic, stone cladding and waterproof grouting. Perfect finish guaranteed.', skills: ['Vitrified Tiles', 'Wall Tiles', 'Mosaic Work', 'Stone Cladding', 'Waterproof Grouting', 'Parking Tiles'], languages: ['Malayalam', 'Tamil', 'Hindi (basic)'] } },
    { user: { fullName: 'Bunty Singh', email: 'bunty@griffy.in', city: 'Pune', state: 'Maharashtra' }, profile: { trade: LabourTrade.WELDER, experienceYears: 11, dailyRate: 950, weeklyRate: 5700, rating: 4.6, reviewCount: 87, completedJobs: 175, isAvailable: true, isVerified: true, bio: 'Skilled welder from Pune with expertise in MS gates, railings, structural steel, grills and fabrication. Arc welding, MIG welding certified. Industrial and residential projects.', skills: ['Arc Welding', 'MIG Welding', 'MS Gates', 'Railing Fabrication', 'Structural Steel', 'Grills'], languages: ['Hindi', 'Marathi'] } },
    { user: { fullName: 'Ramesh Hegde', email: 'ramesh.h@griffy.in', city: 'Bengaluru', state: 'Karnataka' }, profile: { trade: LabourTrade.HELPER, experienceYears: 3, dailyRate: 400, weeklyRate: 2400, rating: 4.4, reviewCount: 56, completedJobs: 90, isAvailable: true, isVerified: false, bio: 'Reliable construction helper with 3 years on-site experience. Material carrying, concrete mixing, cleaning, basic support work. Hard-working and punctual.', skills: ['Material Carrying', 'Concrete Mixing', 'Site Cleaning', 'Scaffolding Support', 'Shuttering Work'], languages: ['Kannada', 'Hindi'] } },
    // J&K workers
    { user: { fullName: 'Farooq Ahmad Dar', email: 'farooq@griffy.in', city: 'Srinagar', state: 'Jammu & Kashmir' }, profile: { trade: LabourTrade.MASON, experienceYears: 14, dailyRate: 950, weeklyRate: 5700, rating: 4.9, reviewCount: 198, completedJobs: 420, isAvailable: true, isVerified: true, bio: 'Senior mason from Srinagar with 14 years in J&K construction. Expert in stone masonry, brick work, traditional Kashmiri Dhajji Dewari (earthquake-resistant wood-brick) construction and modern RCC work.', skills: ['Stone Masonry', 'Brick Work', 'Dhajji Dewari', 'RCC Work', 'Plastering', 'Waterproofing'], languages: ['Kashmiri', 'Urdu', 'Hindi'] } },
    { user: { fullName: 'Hamid Bhat', email: 'hamid@griffy.in', city: 'Jammu', state: 'Jammu & Kashmir' }, profile: { trade: LabourTrade.WELDER, experienceYears: 8, dailyRate: 800, weeklyRate: 4800, rating: 4.5, reviewCount: 67, completedJobs: 130, isAvailable: true, isVerified: true, bio: 'Experienced welder from Jammu specialising in MS and SS fabrication, gates, grills and structural steel. ITI certified. Experienced in cold-climate construction requirements.', skills: ['MS Fabrication', 'SS Welding', 'Gates & Grills', 'Structural Steel', 'Arc Welding', 'Pipe Welding'], languages: ['Dogri', 'Hindi', 'Urdu'] } },
    { user: { fullName: 'Rohit Sharma', email: 'rohit@griffy.in', city: 'Jaipur', state: 'Rajasthan' }, profile: { trade: LabourTrade.ELECTRICIAN, experienceYears: 5, dailyRate: 650, weeklyRate: 3900, rating: 4.5, reviewCount: 89, completedJobs: 210, isAvailable: true, isVerified: true, bio: 'Electrician from Jaipur with 5 years experience. House wiring, solar rooftop, switchboard and DB panel work. ITI certified from Rajasthan. Quick response, quality work.', skills: ['House Wiring', 'Solar Rooftop', 'DB Panel', 'Switchboard', 'MCB Fitting', 'LED Lighting'], languages: ['Hindi', 'Rajasthani'] } },
    { user: { fullName: 'Suresh Thakkar', email: 'suresh.t@griffy.in', city: 'Ahmedabad', state: 'Gujarat' }, profile: { trade: LabourTrade.CARPENTER, experienceYears: 10, dailyRate: 900, weeklyRate: 5400, rating: 4.6, reviewCount: 145, completedJobs: 280, isAvailable: true, isVerified: true, bio: 'Carpenter from Ahmedabad with 10 years in furniture and interior work. Specialise in modular furniture, false ceiling framework, shuttering and plywood work.', skills: ['Modular Furniture', 'False Ceiling Frame', 'Shuttering', 'Plywood Work', 'Door Fitting', 'Laminate Work'], languages: ['Gujarati', 'Hindi'] } },
    { user: { fullName: 'Vijay Khanna', email: 'vijay@griffy.in', city: 'Lucknow', state: 'Uttar Pradesh' }, profile: { trade: LabourTrade.PLUMBER, experienceYears: 7, dailyRate: 600, weeklyRate: 3600, rating: 4.4, reviewCount: 78, completedJobs: 190, isAvailable: false, isVerified: true, bio: 'Plumber from Lucknow with 7 years of experience. Expertise in GI, CPVC and PVC piping. Bathroom and kitchen fitting, water heater connections and overhead tank installations.', skills: ['GI Piping', 'CPVC Fitting', 'Bathroom Fitting', 'Water Heater', 'Overhead Tank', 'PVC Work'], languages: ['Hindi', 'Bhojpuri'] } },
    { user: { fullName: 'Anil Mondal', email: 'anil@griffy.in', city: 'Kolkata', state: 'West Bengal' }, profile: { trade: LabourTrade.TILER, experienceYears: 6, dailyRate: 780, weeklyRate: 4680, rating: 4.5, reviewCount: 112, completedJobs: 240, isAvailable: true, isVerified: false, bio: 'Tiler from Kolkata with 6 years experience in floor and wall tiling. Expert in large format tiles, marble, granite and mosaic. Available for residential and commercial projects.', skills: ['Floor Tiles', 'Wall Tiles', 'Marble Laying', 'Granite Work', 'Mosaic', 'Anti-skid Tiles'], languages: ['Bengali', 'Hindi'] } },
    { user: { fullName: 'Gajendra Patel', email: 'gajendra@griffy.in', city: 'Pune', state: 'Maharashtra' }, profile: { trade: LabourTrade.HELPER, experienceYears: 4, dailyRate: 450, weeklyRate: 2700, rating: 4.3, reviewCount: 45, completedJobs: 110, isAvailable: true, isVerified: false, bio: 'Construction helper with 4 years experience on residential sites in Pune. Material handling, concrete mixing, site cleaning and shuttering support. Fast and dependable.', skills: ['Material Handling', 'Concrete Mixing', 'Shuttering Support', 'Site Cleaning', 'Bar Bending (basic)'], languages: ['Hindi', 'Marathi', 'Gujarati'] } },
  ];

  for (const def of labourDefs) {
    const existing = await userRepo.findOne({ where: { email: def.user.email } });
    let lUser: User;
    if (existing) {
      lUser = existing;
    } else {
      lUser = await userRepo.save(userRepo.create({
        ...def.user, role: UserRole.LABOUR,
        password: await hash('Labour@123'), isVerified: def.profile.isVerified,
        phone: `+91 97${Math.floor(10000000 + Math.random() * 89999999)}`,
      }));
      console.log(`Created labour user: ${def.user.fullName}`);
    }
    const lExisting = await lbrRepo.findOne({ where: { userId: lUser.id } });
    if (!lExisting) {
      await lbrRepo.save(lbrRepo.create({ ...def.profile, userId: lUser.id, city: def.user.city, state: def.user.state }));
      console.log(`Created labour profile: ${def.user.fullName} (${def.profile.trade})`);
    }
  }

  // Demo homeowner
  const homeEmail = 'demo@griffy.in';
  if (!(await userRepo.findOne({ where: { email: homeEmail } }))) {
    await userRepo.save(userRepo.create({
      fullName: 'Rajesh Kumar', email: homeEmail, phone: '+91 9876543210',
      role: UserRole.HOMEOWNER, password: await hash('Demo@123'),
      city: 'Bengaluru', state: 'Karnataka', isVerified: true,
    }));
    console.log('Created demo homeowner: demo@griffy.in / Demo@123');
  }

  await ds.destroy();
  console.log('\nSeed complete!');
}

seed().catch((e) => { console.error(e); process.exit(1); });
