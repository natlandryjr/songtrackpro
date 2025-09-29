# SongTrackPro

A SaaS platform that bridges Meta ads with Spotify streaming analytics for music marketing.

## Architecture

### Microservices
- **API Gateway** (Port 3000): Routes requests to appropriate services
- **Auth Service** (Port 3001): User authentication and JWT management
- **Meta Service** (Port 3002): Meta Ads API integration
- **Spotify Service** (Port 3003): Spotify API integration
- **Analytics Service** (Port 3004): Data aggregation and analytics

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Router for navigation
- Zustand for state management
- React Query for data fetching

### Databases
- **PostgreSQL**: User data, campaigns, and relational data
- **MongoDB**: Time-series metrics data
- **Redis**: Session management and caching

## Getting Started

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd SongTrackPro
```

2. Copy environment files
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/gateway/.env.example backend/gateway/.env
cp backend/services/auth/.env.example backend/services/auth/.env
cp backend/services/meta/.env.example backend/services/meta/.env
cp backend/services/spotify/.env.example backend/services/spotify/.env
cp backend/services/analytics/.env.example backend/services/analytics/.env
```

3. Update environment variables with your API keys

### Development with Docker

Start all services:
```bash
docker-compose up
```

Or start services individually:
```bash
docker-compose up frontend
docker-compose up api-gateway
docker-compose up auth-service
```

### Local Development

Install dependencies:
```bash
npm run install:all
```

Start all services:
```bash
npm run dev
```

Or start frontend/backend separately:
```bash
npm run dev:frontend
npm run dev:backend
```

### Access Points

- Frontend: http://localhost:5173
- API Gateway: http://localhost:3000
- Auth Service: http://localhost:3001
- Meta Service: http://localhost:3002
- Spotify Service: http://localhost:3003
- Analytics Service: http://localhost:3004
- PostgreSQL: localhost:5432
- MongoDB: localhost:27017
- Redis: localhost:6379

## Project Structure

```
SongTrackPro/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   ├── lib/             # Utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/
│   ├── gateway/             # API Gateway
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── services/
│   │   ├── auth/           # Auth microservice
│   │   │   ├── src/
│   │   │   │   ├── config/
│   │   │   │   ├── controllers/
│   │   │   │   ├── middleware/
│   │   │   │   ├── models/
│   │   │   │   ├── routes/
│   │   │   │   └── index.ts
│   │   │   └── package.json
│   │   │
│   │   ├── meta/           # Meta Ads microservice
│   │   ├── spotify/        # Spotify microservice
│   │   └── analytics/      # Analytics microservice
│   │
│   ├── shared/             # Shared code
│   │   ├── types/
│   │   ├── utils/
│   │   └── middleware/
│   │
│   └── database/
│       ├── init/           # PostgreSQL init scripts
│       └── mongo-init/     # MongoDB init scripts
│
├── docker-compose.yml
├── package.json
└── README.md
```

## API Documentation

### Auth Endpoints
- POST `/auth/register` - Register new user
- POST `/auth/login` - Login user
- POST `/auth/logout` - Logout user
- POST `/auth/refresh` - Refresh access token
- GET `/auth/profile` - Get user profile

### Meta Ads Endpoints
- GET `/meta/accounts` - Get connected Meta ad accounts
- POST `/meta/connect` - Connect Meta ad account
- GET `/meta/campaigns` - Get Meta ad campaigns
- GET `/meta/metrics` - Get Meta ad metrics

### Spotify Endpoints
- GET `/spotify/accounts` - Get connected Spotify accounts
- POST `/spotify/connect` - Connect Spotify account
- GET `/spotify/tracks` - Get Spotify tracks
- GET `/spotify/metrics` - Get Spotify streaming metrics

### Analytics Endpoints
- GET `/analytics/campaigns` - Get campaign analytics
- GET `/analytics/overview` - Get overview metrics
- GET `/analytics/comparison` - Compare Meta ads vs Spotify streams

## Environment Variables

See `.env.example` files in each service directory for required environment variables.

Key variables:
- Database credentials (PostgreSQL, MongoDB, Redis)
- JWT secrets
- Meta App ID and Secret
- Spotify Client ID and Secret
- Service URLs

## Building for Production

Build all services:
```bash
npm run build
```

Build frontend:
```bash
npm run build:frontend
```

Build backend:
```bash
npm run build:backend
```

## License

Proprietary - All rights reserved