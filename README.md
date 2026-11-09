# EstateX — Next-Gen 3D & Spatial Real Estate Marketplace

<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Three.js](https://img.shields.io/badge/Three.js-3D_Virtual_Tours-000000?logo=three.js)
![Leaflet](https://img.shields.io/badge/Leaflet-GIS_Maps-199900?logo=leaflet)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql)
![Sharp](https://img.shields.io/badge/Sharp-Media_Pipeline-99CC00)
![pnpm](https://img.shields.io/badge/Maintained_with-pnpm-F69220?logo=pnpm)

**A high-fidelity spatial real estate marketplace featuring 3D virtual walkthroughs, 360° panorama viewing, GIS interactive map exploration, and asynchronous media processing pipelines.**

[System Architecture](#-system-architecture) • [Database ERD](#-database-entity-relationship-diagram) • [3D Tour Sequence](#-spatial-property-exploration-flow) • [Quick Start](#-quick-start)

</div>

---

## ⚡ Overview

**EstateX** bridges physical property inspections and digital buying experiences. Built with **Three.js** and **WebGL**, prospective buyers can step inside 3D property models and 360° panoramic spaces directly inside their web browser, filter listings via interactive **Leaflet GIS** geospatial pins, and instantly submit viewing leads to certified agents.

---

## 🏗 System Architecture

```mermaid
flowchart TD
    subgraph ClientApp["🌐 Frontend Client (Vite 8 + React 19)"]
        UI["Property Search & Filter Grid"]
        MapBox["Leaflet GIS Geospatial Map Engine"]
        Viewer3D["Three.js 3D Virtual Tour & Panorama Engine"]
        LeadModal["Instant Viewing Inquiry & Lead Dispatcher"]
        
        UI <--> MapBox
        UI --> Viewer3D
        UI --> LeadModal
    end

    subgraph Gateway["⚡ Express 5 API Server"]
        Express["Express Gateway & Routing"]
        AuthMid["JWT Auth & Role Guard (CUSTOMER, AGENT, OWNER, ADMIN)"]
        UploadMid["Multer Streaming Multi-File Upload"]
        RateLimit["Rate Limiting & Helmet Guard"]
        
        UI <-->|"REST API Requests"| Express
        Express --> AuthMid --> RateLimit
        Express --> UploadMid
    end

    subgraph MediaPipeline["🖼️ Async Media Optimization Pipeline"]
        Queue["Background Media Job Worker"]
        SharpEngine["Sharp Image Resizer & WebP Converter"]
        PanoGen["360 CubeMap & Equirectangular Tile Processor"]
        ModelValidator["Three.js GLTF / GLB 3D Model Validator"]
        
        UploadMid --> Queue
        Queue --> SharpEngine
        Queue --> PanoGen
        Queue --> ModelValidator
    end

    subgraph DataStore["💾 Data & Storage Layer"]
        PrismaORM["Prisma 6 ORM Client"]
        Postgres[(PostgreSQL Relational DB)]
        Storage[(Local / S3 Media Bucket)]
        
        Express <--> PrismaORM
        PrismaORM <--> Postgres
        SharpEngine --> Storage
        PanoGen --> Storage
        ModelValidator --> Storage
    end
```

---

## 📊 Database Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Listing : "owns / lists"
    User ||--o{ SavedProperty : "favorites"
    User ||--o{ Lead : "buyer inquiries"
    User ||--o{ Lead : "agent assignments"
    Listing ||--|{ PropertyMedia : "contains"
    Listing ||--o{ Lead : "receives"
    Listing ||--o{ SavedProperty : "favorited_in"
    PropertyMedia ||--o{ MediaJob : "processed_by"

    User {
        string id PK "UUID"
        string email UK
        string passwordHash
        string name
        string phone
        enum role "CUSTOMER | AGENT | OWNER | ADMIN"
        datetime createdAt
    }

    Listing {
        string id PK "UUID"
        string title
        string description
        decimal price
        enum purpose "BUY | RENT"
        enum tier "BASIC | ADVANCED | PREMIUM"
        enum status "DRAFT | PUBLISHED | ARCHIVED"
        string address
        string city
        float latitude
        float longitude
        int bedrooms
        int bathrooms
        float areaSqFt
        string ownerId FK
        datetime createdAt
        datetime updatedAt
    }

    PropertyMedia {
        string id PK "UUID"
        string listingId FK
        string url
        enum type "PHOTO | VIDEO | PANORAMA_360 | MODEL_3D | FLOOR_PLAN"
        enum status "UPLOADED | PROCESSING | READY | FAILED"
        int orderIndex
        datetime createdAt
    }

    MediaJob {
        string id PK "UUID"
        string mediaId FK
        enum type "VIDEO_TRANSCODE | IMAGE_OPTIMIZE | THUMBNAIL | MODEL_3D_VALIDATE"
        enum status "QUEUED | PROCESSING | DONE | FAILED"
        int progress
        string workerNode
        string error
        datetime createdAt
        datetime updatedAt
    }

    Lead {
        string id PK "UUID"
        string listingId FK
        string buyerId FK
        string agentId FK
        string message
        enum status "NEW | CONTACTED | VIEWING_REQUESTED | CLOSED"
        string source
        datetime createdAt
        datetime updatedAt
    }

    SavedProperty {
        string id PK "UUID"
        string userId FK
        string listingId FK
        datetime createdAt
    }
```

---

## 🔄 Spatial Property Exploration Flow

```mermaid
sequenceDiagram
    autonumber
    actor Buyer
    participant Client as EstateX React Client
    participant API as Express 5 Gateway
    participant DB as PostgreSQL (Prisma)
    participant Worker as Media Worker (Sharp/3D)
    actor Agent as Certified Agent

    Buyer->>Client: Open Map & Filter (Price, Beds, Purpose: BUY)
    Client->>API: GET /api/listings?bounds=[lat,lng]&tier=PREMIUM
    API->>DB: Query `Listing` join `PropertyMedia`
    DB-->>API: Active Listings with Coordinates & Media
    API-->>Client: Return Filtered GeoJSON & Card Deck

    Buyer->>Client: Select Property -> Launch 3D Walkthrough
    Client->>Client: Initialize Three.js WebGL Canvas
    Client->>API: GET /api/listings/:id/media (PANORAMA_360 / MODEL_3D)
    API-->>Client: Return Optimized Equirectangular Assets
    Client->>Buyer: Render Interactive 360° Panorama & Camera Orbit

    Buyer->>Client: Click "Schedule Physical Viewing"
    Client->>API: POST /api/leads (ListingID, Date, Message)
    API->>DB: Insert `Lead` (status: VIEWING_REQUESTED)
    API-->>Agent: Dispatch Instant Email / SMS Alert
    API-->>Client: Confirmation & Viewing Pass Generated
```

---

## 📦 Key Capabilities

- **3D Spatial Walkthroughs**: WebGL-powered 360° virtual tours and interactive 3D model orbit with zero plugins required.
- **Interactive GIS Map Search**: Real-time Leaflet map synchronization with bounding-box queries for neighborhood exploration.
- **Asynchronous Media Engine**: Background Sharp pipeline automatically generates WebP thumbnails, responsive viewports, and validates GLTF/GLB models.
- **Lead Pipeline CRM**: Built-in routing of buyer viewing requests directly to listing agents with status tracking.
- **Tiered Listing System**: Support for `BASIC`, `ADVANCED`, and `PREMIUM` property exposure.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.x
- PostgreSQL database
- Docker (optional for local DB)
- `pnpm` (`npm install -g pnpm`)

### Installation & Run
```bash
# 1. Clone & Install Dependencies
pnpm install

# 2. Configure Environment
cp .env.example .env
# Set DATABASE_URL, JWT_SECRET, PORT=5000

# 3. Database Migration & Seed
pnpm run db:up         # Starts PostgreSQL via Docker Compose
pnpm run db:push       # Pushes Prisma schema to DB
pnpm run db:seed       # Populates sample properties & 3D media

# 4. Start Development Server (Full Stack)
pnpm run dev
```

Open `http://localhost:5173` to explore EstateX.

---

## 📄 License
Proprietary & Confidential — Engineered by **[Ros Rendo](https://github.com/RosRendo)**