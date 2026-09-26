// server.js — EstateX Production Express Server
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const isProd = process.env.NODE_ENV === 'production';

// ─── Upload directory setup ────────────────────────────────────────────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
['photos', 'videos', 'models', 'panoramas', 'thumbnails'].forEach(dir => {
  fs.mkdirSync(path.join(UPLOAD_DIR, dir), { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const typeMap = { 'image/jpeg': 'photos', 'image/png': 'photos', 'image/webp': 'photos', 'video/mp4': 'videos', 'model/gltf-binary': 'models' };
    const folder = typeMap[req.file?.mimetype] || 'photos';
    cb(null, path.join(UPLOAD_DIR, folder));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// ─── Auth helpers ──────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

const signToken = (userId) => jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const requireAuth = (roles = []) => async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized — please log in' });

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (roles.length > 0 && !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden — insufficient role' });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ─── Zod validation schemas ────────────────────────────────────────────────────
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'AGENT', 'OWNER']).optional().default('CUSTOMER'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const listingSchema = z.object({
  name: z.string().min(3),
  price: z.number().positive(),
  address: z.string().min(5),
  lat: z.number().optional(),
  lng: z.number().optional(),
  beds: z.number().int().min(0),
  baths: z.number().min(0),
  area: z.number().positive(),
  tier: z.enum(['BASIC', 'ADVANCED', 'PREMIUM']).optional().default('BASIC'),
  purpose: z.enum(['BUY', 'RENT']).optional().default('BUY'),
  isProject: z.boolean().optional().default(false),
  description: z.string().min(10),
});

const leadSchema = z.object({
  listingId: z.string(),
  message: z.string().min(5),
  source: z.string().optional().default('inquiry_form'),
});

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
  }
  req.validated = result.data;
  next();
};

// ─── Response helper for listing with full relations ───────────────────────────
const formatListing = (l) => ({
  id: l.id,
  name: l.name,
  price: l.price,
  address: l.address,
  coords: { lat: l.lat, lng: l.lng },
  beds: l.beds,
  baths: l.baths,
  area: l.area,
  tier: l.tier,
  purpose: l.purpose,
  isProject: l.isProject,
  status: l.status,
  description: l.description,
  broker: l.broker,
  createdAt: l.createdAt,
  photos: (l.media || []).filter(m => m.type === 'PHOTO').sort((a, b) => a.sortOrder - b.sortOrder).map(m => m.url),
  videoUrl: (l.media || []).find(m => m.type === 'VIDEO')?.url || null,
  media: (l.media || []),
  amenities: (l.amenities || []).map(a => a.label),
  floors: (l.floors || []).map(f => f.level),
  units: (l.units || []).map(u => ({
    id: u.id,
    number: u.number,
    floor: u.floor?.level,
    price: u.price,
    beds: u.beds,
    baths: u.baths,
    area: u.area,
    videoUrl: u.videoUrl,
  })),
});

const includeRelations = {
  media: true,
  amenities: true,
  floors: { orderBy: { level: 'asc' } },
  units: { include: { floor: true } },
};

async function createServer() {
  const app = express();

  // ─── Security middleware ─────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: false, // disabled for Vite dev HMR compatibility
  }));

  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }));

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests — please try again later' },
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Serve uploaded files
  app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

  // ─── Vite middleware (dev only) ─────────────────────────────────────────────
  let vite;
  if (!isProd) {
    vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { port: 24688 },
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    const compression = (await import('compression')).default;
    app.use(compression());
    app.use(express.static(path.resolve(__dirname, 'dist')));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  // POST /api/auth/register
  app.post('/api/auth/register', validate(registerSchema), async (req, res) => {
    try {
      const { email, password, name, phone, role } = req.validated;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email, passwordHash, name, phone, role },
      });

      const token = signToken(user.id);
      setCookie(res, token);
      res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // POST /api/auth/login
  app.post('/api/auth/login', validate(loginSchema), async (req, res) => {
    try {
      const { email, password } = req.validated;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

      const token = signToken(user.id);
      setCookie(res, token);
      res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', requireAuth(), (req, res) => {
    const { id, email, name, role, phone } = req.user;
    res.json({ id, email, name, role, phone });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LISTINGS ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  // GET /api/listings — public, paginated
  app.get('/api/listings', async (req, res) => {
    try {
      const { search, purpose, tier, minPrice, maxPrice, isProject, page = '1', limit = '20' } = req.query;

      const where = { status: 'PUBLISHED' };
      if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { address: { contains: search, mode: 'insensitive' } }];
      if (purpose && purpose !== 'All') where.purpose = purpose;
      if (tier) where.tier = tier;
      if (minPrice) where.price = { ...where.price, gte: Number(minPrice) };
      if (maxPrice) where.price = { ...where.price, lte: Number(maxPrice) };
      if (isProject === 'true') where.isProject = true;
      if (isProject === 'false') where.isProject = false;

      const skip = (Number(page) - 1) * Number(limit);
      const [listings, total] = await Promise.all([
        prisma.listing.findMany({ where, include: includeRelations, orderBy: { createdAt: 'desc' }, skip, take: Number(limit) }),
        prisma.listing.count({ where }),
      ]);

      res.json({ listings: listings.map(formatListing), total, page: Number(page), limit: Number(limit) });
    } catch (err) {
      console.error('Listings error:', err);
      res.status(500).json({ error: 'Failed to fetch listings' });
    }
  });

  // GET /api/listings/:id — public
  app.get('/api/listings/:id', async (req, res) => {
    try {
      const listing = await prisma.listing.findUnique({
        where: { id: req.params.id },
        include: includeRelations,
      });
      if (!listing) return res.status(404).json({ error: 'Listing not found' });
      res.json(formatListing(listing));
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch listing' });
    }
  });

  // POST /api/listings — AGENT, OWNER, ADMIN
  app.post('/api/listings', requireAuth(['AGENT', 'OWNER', 'ADMIN']), validate(listingSchema), async (req, res) => {
    try {
      const data = req.validated;
      const listing = await prisma.listing.create({
        data: { ...data, createdById: req.user.id, broker: req.user.name },
        include: includeRelations,
      });
      res.status(201).json(formatListing(listing));
    } catch (err) {
      console.error('Create listing error:', err);
      res.status(500).json({ error: 'Failed to create listing' });
    }
  });

  // PATCH /api/listings/:id — owner or admin
  app.patch('/api/listings/:id', requireAuth(), async (req, res) => {
    try {
      const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
      if (!listing) return res.status(404).json({ error: 'Not found' });
      if (listing.createdById !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const updated = await prisma.listing.update({
        where: { id: req.params.id },
        data: req.body,
        include: includeRelations,
      });
      res.json(formatListing(updated));
    } catch (err) {
      res.status(500).json({ error: 'Failed to update listing' });
    }
  });

  // ─── Media upload ────────────────────────────────────────────────────────────

  // POST /api/listings/:id/media — upload photo/video/model
  app.post('/api/listings/:id/media', requireAuth(['AGENT', 'OWNER', 'ADMIN']), upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
      if (!listing) return res.status(404).json({ error: 'Listing not found' });
      if (listing.createdById !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const mime = req.file.mimetype;
      let mediaType = 'PHOTO';
      if (mime.startsWith('video/')) mediaType = 'VIDEO';
      else if (mime === 'model/gltf-binary') mediaType = 'MODEL_3D';

      const fileUrl = `/uploads/${mime.startsWith('video/') ? 'videos' : mime === 'model/gltf-binary' ? 'models' : 'photos'}/${req.file.filename}`;
      let thumbnailUrl = null;

      // Generate thumbnail for photos
      if (mime.startsWith('image/')) {
        const thumbName = `thumb-${req.file.filename.replace(/\.[^.]+$/, '')}.webp`;
        const thumbPath = path.join(UPLOAD_DIR, 'thumbnails', thumbName);
        await sharp(req.file.path).resize(400, 300, { fit: 'cover' }).webp({ quality: 75 }).toFile(thumbPath);
        thumbnailUrl = `/uploads/thumbnails/${thumbName}`;
      }

      const media = await prisma.propertyMedia.create({
        data: {
          listingId: listing.id,
          type: mediaType,
          storageKey: req.file.path,
          url: fileUrl,
          thumbnailUrl,
          mimeType: mime,
          fileSize: req.file.size,
          status: 'READY',
          sortOrder: 0,
        },
      });

      res.status(201).json(media);
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LEADS ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  // POST /api/leads — buyer submits inquiry (requires auth)
  app.post('/api/leads', requireAuth(['CUSTOMER', 'AGENT', 'OWNER', 'ADMIN']), validate(leadSchema), async (req, res) => {
    try {
      const { listingId, message, source } = req.validated;

      const listing = await prisma.listing.findUnique({ where: { id: listingId } });
      if (!listing) return res.status(404).json({ error: 'Listing not found' });

      const lead = await prisma.lead.create({
        data: {
          listingId,
          buyerId: req.user.id,
          agentId: listing.createdById,
          message,
          source,
          status: 'NEW',
        },
        include: { buyer: { select: { name: true, email: true } }, listing: { select: { name: true } } },
      });

      // 🚀 PRODUCTION: trigger email here to listing.createdById agent email
      // await sendEmail({ to: agentEmail, subject: `New lead on ${listing.name}`, ... });

      res.status(201).json(lead);
    } catch (err) {
      console.error('Lead error:', err);
      res.status(500).json({ error: 'Failed to submit inquiry' });
    }
  });

  // GET /api/leads — agent sees own leads; admin sees all
  app.get('/api/leads', requireAuth(['AGENT', 'OWNER', 'ADMIN']), async (req, res) => {
    try {
      const where = req.user.role === 'ADMIN' ? {} : { agentId: req.user.id };
      const leads = await prisma.lead.findMany({
        where,
        include: {
          buyer: { select: { name: true, email: true, phone: true } },
          listing: { select: { name: true, address: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(leads);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch leads' });
    }
  });

  // PATCH /api/leads/:id/status — agent updates lead status
  app.patch('/api/leads/:id/status', requireAuth(['AGENT', 'OWNER', 'ADMIN']), async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ['NEW', 'CONTACTED', 'VIEWING_REQUESTED', 'CLOSED'];
      if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

      const lead = await prisma.lead.update({
        where: { id: req.params.id },
        data: { status },
      });
      res.json(lead);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update lead status' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVED PROPERTIES ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  // GET /api/saved
  app.get('/api/saved', requireAuth(), async (req, res) => {
    try {
      const saved = await prisma.savedProperty.findMany({
        where: { userId: req.user.id },
        select: { listingId: true },
      });
      res.json(saved.map(s => s.listingId));
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch saved properties' });
    }
  });

  // POST /api/saved — toggle
  app.post('/api/saved', requireAuth(), async (req, res) => {
    try {
      const { listingId } = req.body;
      if (!listingId) return res.status(400).json({ error: 'listingId required' });

      const existing = await prisma.savedProperty.findUnique({
        where: { userId_listingId: { userId: req.user.id, listingId } },
      });

      if (existing) {
        await prisma.savedProperty.delete({ where: { userId_listingId: { userId: req.user.id, listingId } } });
        return res.json({ saved: false });
      } else {
        await prisma.savedProperty.create({ data: { userId: req.user.id, listingId } });
        return res.json({ saved: true });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to update saved state' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  // GET /api/admin/stats
  app.get('/api/admin/stats', requireAuth(['ADMIN']), async (req, res) => {
    try {
      const [totalListings, publishedListings, totalUsers, totalLeads, newLeads, totalSaved] = await Promise.all([
        prisma.listing.count(),
        prisma.listing.count({ where: { status: 'PUBLISHED' } }),
        prisma.user.count(),
        prisma.lead.count(),
        prisma.lead.count({ where: { status: 'NEW' } }),
        prisma.savedProperty.count(),
      ]);
      res.json({ totalListings, publishedListings, totalUsers, totalLeads, newLeads, totalSaved });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
  });

  // GET /api/admin/users
  app.get('/api/admin/users', requireAuth(['ADMIN']), async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // PATCH /api/admin/users/:id/role
  app.patch('/api/admin/users/:id/role', requireAuth(['ADMIN']), async (req, res) => {
    try {
      const { role } = req.body;
      const validRoles = ['CUSTOMER', 'AGENT', 'OWNER', 'ADMIN'];
      if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });
      const user = await prisma.user.update({ where: { id: req.params.id }, data: { role } });
      res.json({ id: user.id, role: user.role });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update role' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SPA FALLBACK
  // ═══════════════════════════════════════════════════════════════════════════

  if (isProd) {
    app.get('/{*path}', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    app.get('/{*path}', async (req, res, next) => {
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  // ─── Start server ────────────────────────────────────────────────────────────
  const PORT = Number(process.env.PORT) || 5173;
  const server = app.listen(PORT, () => {
    console.log(`\n🏢 EstateX server running at http://localhost:${PORT}`);
    console.log(`   Mode: ${isProd ? 'production' : 'development'}`);
    console.log(`   Database: ${process.env.DATABASE_URL?.split('@')[1] || 'configured'}\n`);
  });

  // ─── Graceful shutdown ────────────────────────────────────────────────────────
  const shutdown = async (signal) => {
    console.log(`\n${signal} received — closing server...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('✅ Prisma disconnected. Process exit.\n');
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

createServer();
