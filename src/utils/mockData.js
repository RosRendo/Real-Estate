// EstateX Marketplace Mock Database

export const mockListings = [
  {
    id: "modern-villa",
    name: "Modern 4 Bedroom Villa",
    price: 250000,
    address: "Street 2004, Toul Kork, Phnom Penh",
    beds: 4,
    baths: 3,
    area: 220,
    tier: "Advanced",
    purpose: "Buy",
    isProject: false,
    description: "This luxury double-story modern villa offers open-concept structural grids, high ceilings, custom landscaped garden lawns, and automated solar panel installations. Situated inside a gated street with 24/7 security patrol, it represents Toul Kork's premium residential experience.",
    coords: { x: -2.8, z: -2.8 },
    dimensions: { w: 1.8, h: 1.6, d: 1.8 },
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Free public video for testing
    photos: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Private Pool", "Landscaped Garden", "Gated Security", "Solar Smart Grid", "Furnished"],
    rooms: {
      living_room: {
        id: "living_room",
        name: "Grand Living Room",
        description: "Spacious living area complete with a high-end designer sectional sofa, architectural fireplace details, and sliding glass wall grids opening onto the poolside lawn.",
        connections: ["kitchen", "master_suite"]
      },
      kitchen: {
        id: "kitchen",
        name: "Chef's Kitchen",
        description: "State-of-the-art kitchen featuring double built-in ovens, marble waterfall countertops, induction hobs, and custom floating oak cabinets.",
        connections: ["living_room"]
      },
      master_suite: {
        id: "master_suite",
        name: "Master Suite",
        description: "Bespoke master bedroom equipped with a king-size frame, linear strip accent lighting, and dedicated walk-in closets.",
        connections: ["living_room", "spa_bathroom"]
      },
      spa_bathroom: {
        id: "spa_bathroom",
        name: "Spa Bathroom",
        description: "Polished marble wall bathroom incorporating a double floating vanity, smart mist-free LED mirrors, and a deep soaking concrete tub.",
        connections: ["master_suite"]
      }
    }
  },
  {
    id: "skyline-residence",
    name: "Skyline Residence Towers",
    price: 185000, // starting price
    address: "Sihanouk Blvd, Tonle Bassac, Phnom Penh",
    beds: 2,
    baths: 2,
    area: 82,
    tier: "Premium",
    purpose: "Buy",
    isProject: true,
    description: "Tonle Bassac's newest elite skyscraper complex. Skyline Residence offers an active rooftop club deck, 50-meter lap infinity pool overlooking the Mekong river, high-speed automated elevator stacks, and 5 levels of private secure car parking.",
    coords: { x: 2.8, z: 2.8 },
    dimensions: { w: 1.8, h: 4.8, d: 1.8 },
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    photos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Infinity Pool", "Rooftop Sky Bar", "Secure Car Garage", "24h Concierge", "Fitness Studio"],
    floors: [1, 2, 18, 19, 20],
    units: [
      {
        id: "sky-1801",
        number: "1801",
        floor: 18,
        price: 165000,
        beds: 1,
        baths: 1,
        area: 58,
        amenities: ["Balcony", "Parking", "River View"],
        videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
      },
      {
        id: "sky-1802",
        number: "1802",
        floor: 18,
        price: 185000,
        beds: 2,
        baths: 2,
        area: 82,
        amenities: ["Balcony", "Parking", "River View", "Smart Locks"],
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
      },
      {
        id: "sky-1901",
        number: "1901",
        floor: 19,
        price: 195000,
        beds: 2,
        baths: 2,
        area: 85,
        amenities: ["Balcony", "Parking", "Mekong View"],
        videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
      },
      {
        id: "sky-1902",
        number: "1902",
        floor: 19,
        price: 215000,
        beds: 3,
        baths: 2,
        area: 104,
        amenities: ["Large Balcony", "Parking", "Mekong View", "Jacuzzi Pool"],
        videoUrl: "https://www.w3schools.com/html/movie.mp4"
      },
      {
        id: "sky-2001",
        number: "2001",
        floor: 20,
        price: 295000,
        beds: 3,
        baths: 3,
        area: 138,
        amenities: ["Penthouse Layout", "Wrap-around Terrace", "Private Lift", "Sky Automation"],
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
      },
      {
        id: "sky-2002",
        number: "2002",
        floor: 20,
        price: 320000,
        beds: 3,
        baths: 3.5,
        area: 152,
        amenities: ["Premium Penthouse", "Mekong Skyline Panorama", "Private Pool Access", "Rooftop Garden"],
        videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
      }
    ]
  },
  {
    id: "cosy-townhouse",
    name: "Cozy 3 Bedroom Townhouse",
    price: 1200, // Monthly Rent
    address: "Chea Sophara St, Sen Sok, Phnom Penh",
    beds: 3,
    baths: 2.5,
    area: 150,
    tier: "Basic",
    purpose: "Rent",
    isProject: false,
    description: "This comfortable double-story family townhouse is located in a secure gated community (Borey) in Sen Sok. It features a private parking space, a compact front flower garden, and open layouts perfect for small families or young couples seeking entry-level comfort.",
    coords: { x: -2.8, z: 2.8 },
    dimensions: { w: 1.5, h: 1.8, d: 1.5 },
    videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
    photos: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1613977257592-4871e5f87699?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Secure Community", "Covered Parking", "Backyard Deck", "Gated Entrance"]
  },
  {
    id: "waterfront-condo",
    name: "Bayside Luxury Penthouse",
    price: 2500, // Monthly Rent
    address: "National Road 1, Chbar Ampov, Phnom Penh",
    beds: 3,
    baths: 3,
    area: 168,
    tier: "Advanced",
    purpose: "Rent",
    isProject: false,
    description: "Splendid waterfront apartment complex along the river branch. Emphasizing sunset river view terraces, wide double-glazed thermal windows, private marina slips, and high-end built-in kitchen amenities. Quiet and breeze-oriented location.",
    coords: { x: 2.8, z: -2.8 },
    dimensions: { w: 1.8, h: 2.4, d: 1.8 },
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    photos: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Marina Deck Slip", "Sunset River Balcony", "Infinity Pool", "Roof Garden", "Gym Facility"],
    rooms: {
      lounge: {
        id: "lounge",
        name: "Riverview Lounge",
        description: "Wide seating space offering a deep view of the Chbar Ampov waterfront through custom insulated glass facades.",
        connections: ["terrace", "kitchen_suite"]
      },
      terrace: {
        id: "terrace",
        name: "Harbor Terrace",
        description: "Wide wooden-decked terrace looking out directly onto the yacht harbor, outfitted with weather-resistant outdoor lounge sets.",
        connections: ["lounge"]
      },
      kitchen_suite: {
        id: "kitchen_suite",
        name: "Chef's Galley",
        description: "Compact but highly efficient open-galley kitchen with high-gloss cabinetry and integrated smart refrigerator panels.",
        connections: ["lounge", "master_bed"]
      },
      master_bed: {
        id: "master_bed",
        name: "Mekong Suite",
        description: "High-floor bedroom setup catching the cooling river breeze, detailed with a private dressing alcove and premium sound insulating doors.",
        connections: ["kitchen_suite"]
      }
    }
  },
  {
    id: "urban-heights",
    name: "Urban Heights Studio",
    price: 650, // Rent
    address: "St 302, Boeng Keng Kang 1 (BKK1), Phnom Penh",
    beds: 1,
    baths: 1,
    area: 45,
    tier: "Basic",
    purpose: "Rent",
    isProject: false,
    description: "Modern, fully furnished studio apartment located in the heart of BKK1. Includes cleaning service, high-speed internet access, and access to a shared rooftop gym and pool deck.",
    coords: { x: 1.5, z: 1.2 },
    dimensions: { w: 1.2, h: 2.0, d: 1.2 },
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Rooftop Gym", "Swimming Pool", "24h Reception", "High-speed Wi-Fi"]
  },
  {
    id: "mekong-penthouse",
    name: "Mekong River Penthouse",
    price: 420000, // Buy
    address: "Keo Chenda St, Chroy Changvar, Phnom Penh",
    beds: 3,
    baths: 3,
    area: 210,
    tier: "Premium",
    purpose: "Buy",
    isProject: true,
    description: "Exceptional duplex sky villa on the tip of Chroy Changvar peninsula. Panoramic views of the Mekong and Tonle Sap rivers. Features a double-height ceiling in the lounge and private plunge pool on the terrace.",
    coords: { x: 2.5, z: -3.5 },
    dimensions: { w: 2.0, h: 4.2, d: 2.0 },
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    photos: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Private Plunge Pool", "Duplex Lounge", "Marina View", "Smart Lock Automation"],
    floors: [14, 15],
    units: [
      {
        id: "mekong-1401",
        number: "1401",
        floor: 14,
        price: 420000,
        beds: 3,
        baths: 3,
        area: 210,
        amenities: ["Balcony", "River View"],
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
      }
    ]
  },
  {
    id: "sensok-villa",
    name: "Sensok Family Villa",
    price: 185000, // Buy
    address: "St 1986, Sen Sok, Phnom Penh",
    beds: 4,
    baths: 4,
    area: 190,
    tier: "Advanced",
    purpose: "Buy",
    isProject: false,
    description: "Spacious multi-generation family house in a highly secured gated community. Includes a paved front courtyard with 2 car parking spaces, custom teak wood paneling, and an outdoor BBQ kitchen area.",
    coords: { x: -3.5, z: 2.2 },
    dimensions: { w: 1.7, h: 1.8, d: 1.7 },
    videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
    photos: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Gated Borey Security", "Double Car Parking", "BBQ Patio Area", "Teak Carpentry"],
    rooms: {
      lounge: {
        id: "lounge",
        name: "Lounge Hallway",
        description: "Open floor plan lounge with solid teak flooring and hand-carved feature walls.",
        connections: ["dining", "backyard"]
      },
      dining: {
        id: "dining",
        name: "Dining Area",
        description: "Cozy space for an 8-seater dining table, located directly opposite the closed kitchen.",
        connections: ["lounge"]
      },
      backyard: {
        id: "backyard",
        name: "BBQ Courtyard",
        description: "Paved backyard deck equipped with a brick-built grill counter and outdoor washing sinks.",
        connections: ["lounge"]
      }
    }
  },
  {
    id: "toulkork-loft",
    name: "Toul Kork Duplex Loft",
    price: 1100, // Rent
    address: "St 289, Toul Kork, Phnom Penh",
    beds: 2,
    baths: 2,
    area: 110,
    tier: "Basic",
    purpose: "Rent",
    isProject: false,
    description: "Industrial loft-style duplex featuring exposed brick textures, high structural steel beams, and custom floating staircases. Steps away from local dining houses and supermarkets.",
    coords: { x: -2.2, z: -1.8 },
    dimensions: { w: 1.4, h: 2.2, d: 1.4 },
    photos: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Industrial Steel Design", "Rooftop Terrace Access", "Pet Friendly", "Fully Serviced Lobby"]
  },
  {
    id: "diamond-island-skyvilla",
    name: "Diamond Island Sky Villa",
    price: 780000, // Buy
    address: "Elite Road, Koh Pich (Diamond Island), Phnom Penh",
    beds: 5,
    baths: 6,
    area: 340,
    tier: "Premium",
    purpose: "Buy",
    isProject: true,
    description: "Prestige residence offering a 360-degree cityscape view over Diamond Island. Features a private elevator vestibule, custom marble slab accents, double kitchens (wet & dry), and wrap-around viewing balconies.",
    coords: { x: 3.5, z: 1.8 },
    dimensions: { w: 2.2, h: 5.2, d: 2.2 },
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    photos: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Private Lift Entrance", "Wet & Dry Kitchens", "Wrap-around Balconies", "Koh Pich Waterfront View"],
    floors: [24, 25],
    units: [
      {
        id: "skyvilla-2401",
        number: "2401",
        floor: 24,
        price: 780000,
        beds: 5,
        baths: 6,
        area: 340,
        amenities: ["Balcony View", "Parking Space"],
        videoUrl: "https://www.w3schools.com/html/movie.mp4"
      }
    ]
  },
  {
    id: "bkk-apartment",
    name: "Boeng Keng Kang Apartment",
    price: 850, // Rent
    address: "St 278, Boeng Keng Kang 1 (BKK1), Phnom Penh",
    beds: 2,
    baths: 2,
    area: 95,
    tier: "Advanced",
    purpose: "Rent",
    isProject: false,
    description: "Well-appointed premium apartment in BKK1. Safe access with keycard security grids, open kitchen-lounge layout, private balcony facing sunset, and access to a shared sauna room.",
    coords: { x: 0.8, z: 0.8 },
    dimensions: { w: 1.3, h: 2.2, d: 1.3 },
    videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Sauna Room", "Keycard Security Gate", "Sunset Balcony View", "Central A/C"],
    rooms: {
      lounge: {
        id: "lounge",
        name: "Executive Lounge",
        description: "Open floor plan living area equipped with a modern sofa set, keycard entry, and smart lighting panels.",
        connections: ["kitchen", "balcony"]
      },
      kitchen: {
        id: "kitchen",
        name: "Compact Kitchen",
        description: "Equipped with custom high-gloss lacquer cabinetry, induction hob, and dynamic refrigerator cabinets.",
        connections: ["lounge"]
      },
      balcony: {
        id: "balcony",
        name: "Sunset View Balcony",
        description: "Balcony set with iron chairs to view the beautiful Phnom Penh sunset.",
        connections: ["lounge"]
      }
    }
  },
  {
    id: "toulkork-studio",
    name: "Toul Kork Cozy Studio",
    price: 450, // Rent
    address: "St 516, Toul Kork, Phnom Penh",
    beds: 1,
    baths: 1,
    area: 40,
    tier: "Basic",
    purpose: "Rent",
    isProject: false,
    description: "Compact studio apartment in a highly convenient area of Toul Kork. Perfectly suited for single students or working professionals. Roof deck access included.",
    coords: { x: -2.5, z: -2.5 },
    dimensions: { w: 1.1, h: 2.0, d: 1.1 },
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Laundry Facility", "Elevator Access", "Rooftop Garden", "Moto Parking"]
  },
  {
    id: "bkk3-loft",
    name: "BKK3 Loft Apartment",
    price: 750, // Rent
    address: "St 360, Boeng Keng Kang 3 (BKK3), Phnom Penh",
    beds: 2,
    baths: 1,
    area: 80,
    tier: "Basic",
    purpose: "Rent",
    isProject: false,
    description: "Modern loft apartment featuring a mezzanine bedroom, tall double-height windows, and an industrial metal spiral stair layout.",
    coords: { x: 0.5, z: 1.5 },
    dimensions: { w: 1.3, h: 2.2, d: 1.3 },
    photos: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Mezzanine Design", "High Ceilings", "Secured Access Gates", "Balcony"]
  },
  {
    id: "kohpich-luxury",
    name: "Koh Pich Luxury Condo",
    price: 220000, // Buy
    address: "Sopheak Mongkol Rd, Koh Pich (Diamond Island), Phnom Penh",
    beds: 2,
    baths: 2,
    area: 90,
    tier: "Advanced",
    purpose: "Buy",
    isProject: false,
    description: "Elegant, high-floor luxury condo in Diamond Island. Excellent views of the Bassac river. Features customized built-in timber closets, double bathrooms, and automated smart locks.",
    coords: { x: 3.2, z: 1.2 },
    dimensions: { w: 1.5, h: 3.2, d: 1.5 },
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    photos: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Smart Security Locks", "Bassac River View", "Built-in Closets", "Shared Steam Room"],
    rooms: {
      lounge: {
        id: "lounge",
        name: "Bassac Lounge",
        description: "Comfortable lounge area overlooking the Bassac river branch through sound-insulating dual glass facades.",
        connections: ["kitchen", "master_bed"]
      },
      kitchen: {
        id: "kitchen",
        name: "Wood Cabinet Kitchen",
        description: "Compact kitchen layout fitted with dark oak cabinetry, induction cooktop, and floating ventilation hood.",
        connections: ["lounge"]
      },
      master_bed: {
        id: "master_bed",
        name: "Riverview Suite",
        description: "Spacious master bedroom with integrated wooden closets and direct bathroom access.",
        connections: ["lounge"]
      }
    }
  },
  {
    id: "chroy-townhouse",
    name: "Chroy Changvar Townhouse",
    price: 165000, // Buy
    address: "Ochheuteal St, Chroy Changvar, Phnom Penh",
    beds: 3,
    baths: 3,
    area: 140,
    tier: "Advanced",
    purpose: "Buy",
    isProject: false,
    description: "Gated Borey townhouse in a quiet residential district of Chroy Changvar. Cozy front garden, fully tiled floors, and a rooftop viewing deck facing the sunset over the Tonle Sap.",
    coords: { x: 2.2, z: -3.2 },
    dimensions: { w: 1.5, h: 2.2, d: 1.5 },
    videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
    photos: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1613977257592-4871e5f87699?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Borey Security System", "Rooftop Sunset Deck", "Front Garden Deck", "Tiled Courtyard"],
    rooms: {
      lounge: {
        id: "lounge",
        name: "Family Lounge",
        description: "Ground floor lounge area designed for family entertainment, with access to the front garden yard.",
        connections: ["kitchen", "deck"]
      },
      kitchen: {
        id: "kitchen",
        name: "Traditional Kitchen",
        description: "Spacious layout with tiled kitchen countertops and ventilation ducts.",
        connections: ["lounge"]
      },
      deck: {
        id: "deck",
        name: "Viewing Roof Deck",
        description: "Rooftop viewing deck offering a cooling river breeze and high views of the Tonle Sap skyline.",
        connections: ["lounge"]
      }
    }
  },
  {
    id: "sensok-smart-penthouse",
    name: "Sensok Smart Penthouse",
    price: 350000, // Buy
    address: "Mong Reththy Blvd, Sen Sok, Phnom Penh",
    beds: 4,
    baths: 3,
    area: 180,
    tier: "Premium",
    purpose: "Buy",
    isProject: true,
    description: "State-of-the-art penthouse residence in Sen Sok. Fully integrated automated voice lighting grids, smart appliances, private viewing terrace, and elite access keycards.",
    coords: { x: -3.2, z: 1.8 },
    dimensions: { w: 1.8, h: 4.2, d: 1.8 },
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    photos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Voice Control Home", "Rooftop Private Terrace", "Exclusive Elevator Key", "Smart Lock Gate"],
    floors: [12, 13],
    units: [
      {
        id: "smart-1201",
        number: "1201",
        floor: 12,
        price: 350000,
        beds: 4,
        baths: 3,
        area: 180,
        amenities: ["Private Balcony", "Smart Locks"],
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
      }
    ]
  },
  {
    id: "bkk1-villa",
    name: "BKK1 Colonial Villa",
    price: 3500, // Rent
    address: "St 282, Boeng Keng Kang 1 (BKK1), Phnom Penh",
    beds: 5,
    baths: 5,
    area: 280,
    tier: "Advanced",
    purpose: "Rent",
    isProject: false,
    description: "Classic colonial-style villa converted for commercial or premium residential rent in BKK1. Lush tropical garden borders, tall windows, grand lobby entrance, and secure high gates.",
    coords: { x: 1.2, z: 0.5 },
    dimensions: { w: 2.0, h: 2.2, d: 2.0 },
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    photos: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Lush Tropical Garden", "Grand Lobby Hallway", "High Security Gates", "Commercial Grade A/C"],
    rooms: {
      lobby: {
        id: "lobby",
        name: "Grand Colonial Lobby",
        description: "High ceiling lobby entrance detailed with classical arches and crystal chandeliers.",
        connections: ["salon", "garden"]
      },
      salon: {
        id: "salon",
        name: "Reception Salon",
        description: "Spacious salon room suitable for executive meetings or lounge setups.",
        connections: ["lobby"]
      },
      garden: {
        id: "garden",
        name: "Tropical Garden Yard",
        description: "Enclosed courtyard garden shaded by palm tree leaves, featuring a concrete fountain.",
        connections: ["lobby"]
      }
    }
  },
  {
    id: "bangkok-popular-home",
    name: "Sathorn Sky Penthouse",
    price: 320000,
    address: "Sathorn Road, Bangkok, Thailand",
    beds: 3,
    baths: 3,
    area: 165,
    tier: "Basic",
    purpose: "Buy",
    isProject: false,
    description: "Premium high-rise apartment in Bangkok's Sathorn financial hub. Enjoy standard high ceilings, private elevator vestibules, and custom visual skyline orientations.",
    coords: { x: 2.1, z: 2.1 },
    photos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Rooftop Fitness", "Sunset Skyline Balcony", "Secure Parking Grid"]
  },
  {
    id: "bangkok-sukhumvit",
    name: "Sukhumvit Garden Loft",
    price: 245000,
    address: "Sukhumvit Soi 23, Bangkok, Thailand",
    beds: 2,
    baths: 2,
    area: 98,
    tier: "Basic",
    purpose: "Buy",
    isProject: false,
    description: "Elegant modern condominium block located steps away from Asoke BTS. Complete with wooden decks, infinity pool lounge areas, and keycard security locks.",
    coords: { x: 1.8, z: 2.2 },
    photos: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Infinity Pool Deck", "Keycard Security Gate", "Central A/C"]
  },
  {
    id: "hotel-sensok-palace",
    name: "Sensok Palace Hotel Suite",
    price: 120, // Nightly rent (represented under Rent purpose)
    address: "Mong Reththy Blvd, Sen Sok, Phnom Penh (Hotel)",
    beds: 1,
    baths: 1,
    area: 55,
    tier: "Basic",
    purpose: "Rent",
    isProject: false,
    description: "Luxury hotel room suite containing double beds, separate work desks, central HVAC panels, and 24h concierge desk service.",
    coords: { x: -3.0, z: 1.5 },
    photos: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["24h Room Service", "Buffet Breakfast Access", "Fitness Center"]
  },
  {
    id: "hotel-toulkork-grand",
    name: "Toul Kork Grand Hotel",
    price: 95,
    address: "St 289, Toul Kork, Phnom Penh (Hotel)",
    beds: 1,
    baths: 1,
    area: 45,
    tier: "Basic",
    purpose: "Rent",
    isProject: false,
    description: "Premium hotel suite detailing cozy lounge layouts, automated smart room indicators, mini bar stacks, and secure keyless checkins.",
    coords: { x: -2.0, z: -2.0 },
    photos: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Sauna & Spa Room", "Concierge Service", "Mini Bar"]
  },
  {
    id: "hcmc-d1-central",
    name: "D1 Central 2BR • Comfort Stay • 5 Pax",
    price: 44, // 1 night price
    address: "Quận 1, Thành phố Hồ Chí Minh, Vietnam",
    beds: 2,
    baths: 1,
    area: 68,
    tier: "Basic",
    purpose: "Rent",
    isProject: false,
    description: "One of the most loved homes on Airbnb, according to guests. HN Homes - A sophisticated, peaceful retreat in the heart of District 1. The 2-bedroom – 1-toilet apartment is designed in a classic style combined with modernity, imbued with the spirit of Asian aesthetics: warmth, sophistication and comfort. The space is suitable for up to 6 guests, fully meeting the needs of rest and living. Note: The apartment is on the mezzanine floor, so you will use the stairs during your stay.",
    coords: { x: 2.2, z: -1.2 },
    photos: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Lock on bedroom door", "Canal view", "Park view", "Waterfront", "Kitchen", "Wifi", "Dedicated workspace"]
  },
  {
    id: "hcmc-riverside",
    name: "Saigon Riverside Condo",
    price: 55,
    address: "Nguyen Huu Canh St, Quận 1, Ho Chi Minh City, Vietnam",
    beds: 1,
    baths: 1,
    area: 50,
    tier: "Basic",
    purpose: "Rent",
    isProject: false,
    description: "Elegant riverside apartment close to District 1, containing high-speed wifi, smart home integrations, washing machine, and panoramic balcony views of Landmark 81.",
    coords: { x: 2.6, z: -1.6 },
    photos: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Sauna Room", "Landmark 81 View", "Security Guard Gate"]
  }
];
