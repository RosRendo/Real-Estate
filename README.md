# 🏢 EstateX Premium Real Estate Portal

A premium, full-stack real estate portal featuring **SQLite database persistence**, **Prisma ORM**, a custom **Express + Vite middleware server**, an interactive **Leaflet map engine**, and **immersive Three.js 3D Walkthrough structures**.

---

## 🚀 1. Local Development Setup

Follow these steps to run the application locally on your machine:

### Step 1: Install Dependencies
Open your terminal in the project directory and run:
```bash
npm install
```

### Step 2: Initialize the SQLite Database
Synchronize your Prisma schema with the SQLite database and seed it with the mock listings:
```bash
# Generate the SQLite database and run migrations
npx prisma migrate dev --name init

# Seed the database with high-quality pre-verified listings
npx prisma db seed
```

### Step 3: Start the Development Server
Launch the unified backend and hot-reloading frontend on port `5173`:
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:5173`**.

---

## 🌐 2. Production Deployment Setup

When deploying to a staging or production server (e.g., VPS, Heroku, Render, AWS), follow this workflow:

### Step 1: Build static assets
Compile and minify the React client components into the production bundle:
```bash
npm run build
```
This outputs all optimized client files to the `dist/` directory.

### Step 2: Configure Environment Variables
Ensure the following variables are declared on your environment:
* `NODE_ENV=production`
* `PORT=5173` (or any port of your choice)

### Step 3: Start the Production Server
Run the Express server to serve both the static client files and the REST API endpoints:
```bash
# Using node directly
cross-env NODE_ENV=production node server.js

# Or if using PM2 for production process monitoring:
pm2 start server.js --name estatex-portal
```

---

## 👥 3. User Roles and Workflows

EstateX is designed around two main target audiences:

### 🏠 The Buyer / Investor
* **Aesthetic Search & Discover:** Search properties in Phnom Penh, Bangkok, or HCMC. Filter by property type, price bounds, project status, and purpose (Buy/Rent).
* **Real Interactive Map Engine:** Pan and zoom around geographical city circles. Click Zillow-style price pins to view floating preview details cards in real-time.
* **Property Compare:** Multi-select properties in the search sidebar to open side-by-side spec sheets.
* **Saved Properties:** Toggle listing bookmarks to store selections in the SQLite database for retrieval later.
* **Property details page:** Explore direct yield estimates (yield percentages, mortgage costs, down payments) and schedule structural photography capture bookings.

### 💼 The Seller / Broker / Supervisor
* **Seller Wizard:** Create a property listing step-by-step.
* **Schedule Professional Capture:** Hire EstateX photographers to scan properties for 3D walkthrough rendering.
* **Supervisor Metrics Panel:** Open the dashboard tab to view:
  * **Prisma SQLite Stats:** Totals of active listings, booked inquiries, saved properties, and transcoding logs.
  * **Live Inquiries Feed:** List of buyers who submitted inquiries on properties.
  * **Background Transcoder Monitor:** Monitor active video transcoding streams and mock background tasks updating in real-time.

---

## 🎥 4. How to List 3D Media, 3D Video, and 3D Viewers

The system dynamically upgrades listing tiers based on the media components provided.

### Media Tiers
* **Basic (0-59 Completion Score):** Standard photo galleries.
* **Advanced (60-99 Completion Score):** 2D Video player and interactive **3D Panoramic 360° Tour**.
* **Premium (100 Completion Score):** Includes everything above plus a fully interactive **Three.js 3D Building Floor Unit Builder**.

### Listing Steps (How-To):
1. Navigate to the **Sell Property** tab.
2. Fill out the property title, city location, size, and address description.
3. **Capture Scheduler:** Under the Media step, toggle *"Schedule EstateX Professional Capture"*.
4. Choose a package:
   * **Standard Package:** Unlocks basic photos.
   * **Advanced Package:** Unlocks photos, a 2D video, and a 360° interactive tour.
   * **Immersive Package:** Unlocks photos, a 2D video, a 360° tour, and a full Three.js 3D digital architectural model.
5. Click **Schedule Booking**. The scheduler will run a mock 1.5s scan simulator and automatically inject the high-fidelity mock media links into your form data.
6. Click **Publish Listing**. This triggers canvas-confetti, creates database nodes inside SQLite, and registers your new property.
7. Locate your new listing in the search view. Click **View Details** to load the rendering engine:
   * **Video Player:** Click *"Video"* under the media bar to stream the MP4 video.
   * **360° Tour (Advanced):** Click *"360° Tour"* to launch the panoramic room-navigating view.
   * **3D Viewer (Premium):** Click *"3D Model"* to launch the interactive Three.js viewport where you can inspect architectural models and select rooms.
