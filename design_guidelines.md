# Design Guidelines: Crypto Airdrop Claim System

## Design Approach
**Reference-Based:** Drawing from leading Web3 applications (Phantom Wallet, Uniswap, MetaMask, Binance) to create a trustworthy, modern crypto interface that instills confidence during wallet connections.

## Core Design Principles
1. **Trust & Security First:** Clean, professional aesthetics that communicate reliability
2. **Mobile-Optimized:** Touch-friendly targets, thumb-zone placement for primary actions
3. **Web3 Native:** Modern glassmorphism effects, subtle gradients, crypto-friendly visual language
4. **Clarity:** Clear status communication and straightforward user flows

---

## Typography
- **Primary Font:** Inter or DM Sans (via Google Fonts CDN)
- **Accent Font:** JetBrains Mono for wallet addresses and numerical data
- **Hierarchy:**
  - Hero/Title: text-4xl to text-6xl, font-bold
  - Section Headers: text-2xl to text-3xl, font-semibold
  - Body: text-base to text-lg, font-normal
  - Wallet Addresses: text-sm, font-mono
  - Small Labels: text-xs to text-sm, font-medium

## Layout System
**Spacing Units:** Tailwind units 4, 6, 8, 12, 16 for consistency
- Component padding: p-6 to p-8
- Section spacing: py-12 to py-20
- Card gaps: gap-6
- Button padding: px-8 py-4

---

## User Panel Layout

### Hero Section (Mobile-First)
- **Height:** min-h-screen with centered content
- **Structure:** Single-column vertical stack
- **Elements:**
  - App logo/icon (w-16 h-16 to w-24 h-24)
  - Headline: "Claim Your Airdrop" (text-4xl font-bold)
  - Subtext: Brief security message (text-lg opacity-80)
  - Primary CTA: Large "Claim Airdrop" button (w-full max-w-md, h-14)
  - Trust indicators below: Supported wallet icons (MetaMask, Trust, Binance)

### Wallet Connection Modal
- **Backdrop:** Semi-transparent overlay (bg-black/60) with backdrop-blur
- **Modal:** Centered card (max-w-md) with glassmorphism effect
- **Content:**
  - Header: "Connect Wallet" (text-2xl font-semibold)
  - Wallet options grid: 3 clickable cards with wallet icons and names
  - Each card: h-20, rounded-xl, hover state with subtle glow
  - Footer: Small security badge text

### Connected State Panel
- **Container:** Card-based layout (rounded-2xl, backdrop-blur)
- **Sections:**
  - Wallet address display with copy button
  - Balance cards grid (2 columns on mobile, 3-4 on desktop)
  - Each coin card: Icon, symbol, balance amount
  - Device info collapsed accordion (expandable)

### Airdrop Finished Popup
- **Style:** Success-themed modal with celebration micro-animation
- **Content:** Checkmark icon, "Airdrop Claimed!" headline, next airdrop timing message
- **Action:** Single "Close" button

---

## Admin Panel Layout

### Dashboard Header
- **Layout:** Fixed top bar with admin branding
- **Elements:** Logo, "Admin Dashboard" title, user count badge, logout button (right-aligned)

### Main Content Area
- **Structure:** Full-width data table with responsive cards on mobile
- **Table Columns:**
  - User # (auto-increment)
  - Wallet Address (truncated with expand icon)
  - Total Balance (sum of all coins)
  - Device Info (icon-based summary)
  - Connected At (timestamp)
  - Actions (View Details button)

### User Detail Modal
- **Layout:** Large modal (max-w-4xl) with tabbed sections
- **Tabs:**
  - Wallet Balances (all coins in grid)
  - Device Details (specs list)
  - Connection History (timeline)

---

## Component Library

### Buttons
- **Primary (Claim/Connect):** Large, rounded-xl, font-semibold, with subtle shadow and glow on hover
- **Secondary (View Details):** Outlined style, rounded-lg
- **Icon Buttons:** Square (w-10 h-10), rounded-lg for copy/expand actions

### Cards
- **Wallet Option Cards:** Bordered, rounded-xl, p-6, with hover lift effect
- **Balance Cards:** Minimal borders, rounded-lg, p-4, coin icon top-left
- **Data Cards (Admin):** Clean white/bordered, rounded-lg, shadow-sm

### Inputs
- **Not applicable** (no form inputs in main flow)

### Modals
- **All modals:** Centered, max-w-md to max-w-4xl depending on content, rounded-2xl, with backdrop-blur overlay
- **Close mechanism:** X button (top-right) or primary action button

### Icons
- **Library:** Heroicons via CDN
- **Usage:** 
  - Wallet icons: w-8 h-8 to w-12 h-12
  - UI icons: w-5 h-5 to w-6 h-6
  - Status icons: w-16 h-16 (success checkmark)

### Status Indicators
- **Connected Badge:** Small pill with green dot, "Connected" text
- **Loading State:** Spinner with "Connecting..." text
- **Error State:** Red accent with alert icon, "Wallet Not Found" message

---

## Animations
**Minimal and Purposeful:**
- Modal entrance: Fade + scale (duration-200)
- Button hover: Subtle scale (scale-105)
- Success popup: Single celebratory bounce on entry
- Wallet connection: Progress dots animation

---

## Mobile Optimizations
- Sticky bottom positioning for primary CTA when scrolled
- Touch targets minimum 44px height
- Swipe-friendly card layouts
- Simplified table to stacked cards on mobile for admin panel
- Bottom sheet style for modals on small screens

---

## Key UX Patterns
1. **One-tap claim flow:** Claim button → Wallet popup → Auto-connect → Success
2. **Persistent state:** Session storage maintains connection status
3. **Error prevention:** Clear "Wallet Not Found" with installation guidance
4. **No disconnect:** Simplified experience without logout complexity
5. **Admin clarity:** Quick-scan table with drill-down details on demand