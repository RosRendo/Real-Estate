// prisma/seed.js — Production seed for normalized PostgreSQL schema
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper: map old tier string to Prisma enum
const tierMap = { Basic: 'BASIC', Advanced: 'ADVANCED', Premium: 'PREMIUM' };
const purposeMap = { Buy: 'BUY', Rent: 'RENT' };

// ─── Geo coordinates for seed listings ────────────────────────────────────────
const geoCoords = {
  'modern-villa':         { lat: 11.5683, lng: 104.8906 },
  'skyline-residence':    { lat: 11.5516, lng: 104.9329 },
  'waterfront-condo':     { lat: 11.5401, lng: 104.9312 },
  'cosy-townhouse':       { lat: 11.5833, lng: 104.8667 },
  'urban-heights':        { lat: 11.5471, lng: 104.9254 },
  'mekong-penthouse':     { lat: 11.5973, lng: 104.9318 },
  'diamond-condo':        { lat: 11.5452, lng: 104.9392 },
  'sensok-borey':         { lat: 11.5833, lng: 104.8667 },
  'sathorn-condo':        { lat: 13.7201, lng: 100.5273 },
  'sukhumvit-luxury':     { lat: 13.7367, lng: 100.5604 },
  'hcmc-riverside':       { lat: 10.7903, lng: 106.7214 },
  'bangkok-penthouse':    { lat: 13.7457, lng: 100.5331 },
};

async function main() {
  console.log('🌱 Seeding EstateX production database...');

  // ─── Seed admin + agent users ────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 10);
  const agentHash = await bcrypt.hash('agent123', 10);
  const customerHash = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@estatex.com' },
    update: {},
    create: {
      email: 'admin@estatex.com',
      passwordHash: adminHash,
      name: 'EstateX Admin',
      role: 'ADMIN',
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@estatex.com' },
    update: {},
    create: {
      email: 'agent@estatex.com',
      passwordHash: agentHash,
      name: 'HN Homes - Dũng',
      phone: '+855 12 345 678',
      role: 'AGENT',
    },
  });

  await prisma.user.upsert({
    where: { email: 'buyer@estatex.com' },
    update: {},
    create: {
      email: 'buyer@estatex.com',
      passwordHash: customerHash,
      name: 'Demo Buyer',
      role: 'CUSTOMER',
    },
  });

  console.log('✅ Users seeded');

  // ─── Listings data ────────────────────────────────────────────────────────────
  const listings = [
    {
      id: 'modern-villa',
      name: 'Modern 4 Bedroom Villa',
      price: 250000,
      address: 'Street 2004, Toul Kork, Phnom Penh',
      beds: 4, baths: 3, area: 220,
      tier: 'ADVANCED', purpose: 'BUY', isProject: false,
      description: 'This luxury double-story modern villa offers open-concept structural grids, high ceilings, custom landscaped garden lawns, and automated solar panel installations. Situated inside a gated street with 24/7 security patrol, it represents Toul Kork\'s premium residential experience.',
      photos: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      ],
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      amenities: ['Private Pool', 'Landscaped Garden', 'Gated Security', 'Solar Smart Grid', 'Furnished'],
    },
    {
      id: 'skyline-residence',
      name: 'Skyline Residence Towers',
      price: 185000,
      address: 'Sihanouk Blvd, Tonle Bassac, Phnom Penh',
      beds: 2, baths: 2, area: 82,
      tier: 'PREMIUM', purpose: 'BUY', isProject: true,
      description: 'Tonle Bassac\'s newest elite skyscraper complex. Skyline Residence offers an active rooftop club deck, 50-meter lap infinity pool overlooking the Mekong river, high-speed automated elevator stacks, and 5 levels of private secure car parking.',
      photos: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      ],
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      amenities: ['Infinity Pool', 'Rooftop Sky Bar', 'Secure Car Garage', '24h Concierge', 'Fitness Studio'],
      floors: [18, 19, 20],
      units: [
        { number: '1801', floorLevel: 18, price: 165000, beds: 1, baths: 1, area: 58, videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4' },
        { number: '1802', floorLevel: 18, price: 185000, beds: 2, baths: 2, area: 82, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { number: '1901', floorLevel: 19, price: 195000, beds: 2, baths: 2, area: 85, videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4' },
        { number: '1902', floorLevel: 19, price: 215000, beds: 3, baths: 2, area: 104, videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
      ],
    },
    {
      id: 'waterfront-condo',
      name: 'Bayside Luxury Penthouse',
      price: 2500,
      address: 'National Road 1, Chbar Ampov, Phnom Penh',
      beds: 3, baths: 3, area: 168,
      tier: 'ADVANCED', purpose: 'RENT', isProject: false,
      description: 'Splendid waterfront apartment complex along the river branch. Emphasizing sunset river view terraces, wide double-glazed thermal windows, private marina slips, and high-end built-in kitchen amenities.',
      photos: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      ],
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      amenities: ['Marina Deck Slip', 'Sunset River Balcony', 'Infinity Pool', 'Roof Garden'],
    },
    {
      id: 'cosy-townhouse',
      name: 'Cozy 3 Bedroom Townhouse',
      price: 1200,
      address: 'Chea Sophara St, Sen Sok, Phnom Penh',
      beds: 3, baths: 2.5, area: 150,
      tier: 'BASIC', purpose: 'RENT', isProject: false,
      description: 'This comfortable double-story family townhouse is located in a secure gated community in Sen Sok. Features private parking, a compact front flower garden, and open layouts perfect for small families.',
      photos: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1613977257592-4871e5f87699?auto=format&fit=crop&w=800&q=80',
      ],
      videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
      amenities: ['Secure Community', 'Covered Parking', 'Backyard Deck', 'Gated Entrance'],
    },
    {
      id: 'urban-heights',
      name: 'Urban Heights Studio',
      price: 650,
      address: 'St 302, Boeng Keng Kang 1 (BKK1), Phnom Penh',
      beds: 1, baths: 1, area: 45,
      tier: 'BASIC', purpose: 'RENT', isProject: false,
      description: 'Modern, fully furnished studio apartment located in the heart of BKK1. Includes cleaning service, high-speed internet access, and access to a shared rooftop gym and pool deck.',
      photos: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: ['Rooftop Gym', 'Swimming Pool', '24h Reception', 'High-speed Wi-Fi'],
    },
    {
      id: 'mekong-penthouse',
      name: 'Mekong River Penthouse',
      price: 420000,
      address: 'Keo Chenda St, Chroy Changvar, Phnom Penh',
      beds: 3, baths: 3, area: 210,
      tier: 'PREMIUM', purpose: 'BUY', isProject: true,
      description: 'Exceptional duplex sky villa on the tip of Chroy Changvar peninsula. Panoramic views of the Mekong and Tonle Sap rivers. Features a double-height ceiling in the lounge and private plunge pool on the terrace.',
      photos: [
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
      ],
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      amenities: ['Private Plunge Pool', 'Duplex Lounge', 'Marina View', 'Smart Lock Automation'],
      floors: [14, 15],
      units: [
        { number: '1401', floorLevel: 14, price: 420000, beds: 3, baths: 3, area: 210, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      ],
    },
    {
      id: 'diamond-condo',
      name: 'Diamond Island Condo',
      price: 95000,
      address: 'Koh Pich (Diamond Island), Phnom Penh',
      beds: 1, baths: 1, area: 55,
      tier: 'ADVANCED', purpose: 'BUY', isProject: false,
      description: 'Contemporary one-bedroom unit on the exclusive Diamond Island. Perfectly integrated smart home devices, pool views, and premium gym facilities.',
      photos: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      ],
      videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
      amenities: ['Pool View', 'Smart Home', 'Gym Access', 'Covered Parking'],
    },
    {
      id: 'sensok-borey',
      name: 'Sensok Borey Family Villa',
      price: 120000,
      address: 'Borey Piphup Thmey, Sen Sok, Phnom Penh',
      beds: 4, baths: 3, area: 190,
      tier: 'ADVANCED', purpose: 'BUY', isProject: false,
      description: 'Spacious family borey villa with a private garden, double car parking, and BBQ patio. Set within a fully gated estate with 24/7 security roving patrols.',
      photos: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: ['Gated Borey Security', 'Double Car Parking', 'BBQ Patio Area', 'Teak Carpentry'],
    },
    {
      id: 'sathorn-condo',
      name: 'Sathorn Executive Residences',
      price: 320000,
      address: 'Sathorn Rd, Sathorn, Bangkok, Thailand',
      beds: 2, baths: 2, area: 110,
      tier: 'PREMIUM', purpose: 'BUY', isProject: true,
      description: 'Landmark executive condo on the Sathorn corridor. Includes concierge, private movie room, and a rooftop private dining terrace.',
      photos: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571919674861-c2c59bc7d9ec?auto=format&fit=crop&w=800&q=80',
      ],
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      amenities: ['Rooftop Dining', 'Private Cinema', 'Concierge', 'Airport Shuttle'],
      floors: [22, 23, 24],
      units: [
        { number: '2201', floorLevel: 22, price: 320000, beds: 2, baths: 2, area: 110, videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
        { number: '2301', floorLevel: 23, price: 350000, beds: 3, baths: 2, area: 135, videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
      ],
    },
    {
      id: 'sukhumvit-luxury',
      name: 'Sukhumvit 24 Luxury Suite',
      price: 4500,
      address: 'Sukhumvit Soi 24, Khlong Toei, Bangkok, Thailand',
      beds: 3, baths: 3, area: 185,
      tier: 'PREMIUM', purpose: 'RENT', isProject: false,
      description: 'Exceptional full-floor residence in the heart of Sukhumvit. Three private en-suite bedrooms, a private Chef\'s kitchen, and bespoke designer furniture throughout.',
      photos: [
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      ],
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      amenities: ['Sky Garden', 'Chef\'s Kitchen', 'Private Elevator', 'Infinity Pool'],
    },
    {
      id: 'hcmc-riverside',
      name: 'Saigon Riverside Condo',
      price: 55,
      address: 'Nguyen Huu Canh St, Quận 1, Ho Chi Minh City, Vietnam',
      beds: 1, baths: 1, area: 50,
      tier: 'BASIC', purpose: 'RENT', isProject: false,
      description: 'Elegant riverside apartment close to District 1, containing high-speed wifi, smart home integrations, washing machine, and panoramic balcony views of Landmark 81.',
      photos: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: ['Sauna Room', 'Landmark 81 View', 'Security Guard Gate'],
    },
    {
      id: 'bangkok-penthouse',
      name: 'Asok Penthouse Suite',
      price: 9800,
      address: 'Asok Montri Rd, Watthana, Bangkok, Thailand',
      beds: 4, baths: 4, area: 380,
      tier: 'PREMIUM', purpose: 'RENT', isProject: false,
      description: 'Crown jewel of Bangkok\'s sky residences. A private rooftop pool, 360° panoramic skyline views, and concierge-grade white-glove services define this flagship rental.',
      photos: [
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1613977257592-4871e5f87699?auto=format&fit=crop&w=800&q=80',
      ],
      videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
      amenities: ['Private Rooftop Pool', '360° Panorama', 'White Glove Concierge', 'Helipad Access'],
      floors: [45, 46],
      units: [
        { number: '4501', floorLevel: 45, price: 9800, beds: 4, baths: 4, area: 380, videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4' },
      ],
    },
  ];

  // ─── Insert listings with normalized relations ────────────────────────────────
  for (const l of listings) {
    const geo = geoCoords[l.id] || { lat: 11.5564, lng: 104.9282 };

    // Delete existing for clean re-seed
    await prisma.lead.deleteMany({ where: { listingId: l.id } });
    await prisma.savedProperty.deleteMany({ where: { listingId: l.id } });
    await prisma.propertyUnit.deleteMany({ where: { listingId: l.id } });
    await prisma.propertyFloor.deleteMany({ where: { listingId: l.id } });
    await prisma.propertyAmenity.deleteMany({ where: { listingId: l.id } });
    await prisma.propertyMedia.deleteMany({ where: { listingId: l.id } });
    await prisma.listing.deleteMany({ where: { id: l.id } });

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        id: l.id,
        createdById: agent.id,
        name: l.name,
        price: l.price,
        address: l.address,
        lat: geo.lat,
        lng: geo.lng,
        beds: l.beds,
        baths: l.baths,
        area: l.area,
        tier: l.tier,
        purpose: l.purpose,
        isProject: l.isProject || false,
        status: 'PUBLISHED',
        description: l.description,
        broker: 'HN Homes - Dũng',
      },
    });

    // Photos
    for (let i = 0; i < (l.photos || []).length; i++) {
      await prisma.propertyMedia.create({
        data: {
          listingId: listing.id,
          type: 'PHOTO',
          storageKey: `photos/${l.id}-${i}.jpg`,
          url: l.photos[i],
          mimeType: 'image/jpeg',
          status: 'READY',
          sortOrder: i,
        },
      });
    }

    // Video
    if (l.videoUrl) {
      await prisma.propertyMedia.create({
        data: {
          listingId: listing.id,
          type: 'VIDEO',
          storageKey: `videos/${l.id}.mp4`,
          url: l.videoUrl,
          mimeType: 'video/mp4',
          status: 'READY',
          sortOrder: 100,
        },
      });
    }

    // Amenities
    for (const label of (l.amenities || [])) {
      await prisma.propertyAmenity.create({
        data: { listingId: listing.id, label },
      });
    }

    // Floors + Units
    if (l.floors && l.units) {
      for (const levelNum of l.floors) {
        const floor = await prisma.propertyFloor.create({
          data: { listingId: listing.id, level: levelNum },
        });

        const floorUnits = l.units.filter(u => u.floorLevel === levelNum);
        for (const u of floorUnits) {
          await prisma.propertyUnit.create({
            data: {
              listingId: listing.id,
              floorId: floor.id,
              number: u.number,
              price: u.price,
              beds: u.beds,
              baths: u.baths,
              area: u.area,
              videoUrl: u.videoUrl || null,
            },
          });
        }
      }
    }

    console.log(`  ✓ ${l.name}`);
  }

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('  Admin:    admin@estatex.com    / admin123');
  console.log('  Agent:    agent@estatex.com    / agent123');
  console.log('  Customer: buyer@estatex.com    / customer123');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
