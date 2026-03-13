# UX/UI Redesign Prompt — RodBus NFC Tracker (English Version)

> Use this prompt with AI Design Tools (Figma AI, v0.dev, Claude, GPT) to redesign the entire UX/UI system.

---

## 1. Project Overview

**RodBus NFC Tracker** is a shared transportation cost-splitting application for Thai van/bus drivers and their regular passengers. The system works via NFC tap or QR code scan to log trips, then automatically calculates and fairly splits costs among all riders.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Clerk Auth, PostgreSQL (Neon), Prisma ORM
**Languages:** Bilingual (Thai / English) with Buddhist Era calendar support
**Target Users:** Thai van drivers and regular commuter passengers (primarily mobile usage)

---

## 2. User Roles

| Role | Permissions |
|------|------------|
| **PENDING** | Newly registered user awaiting admin approval — can only see the waiting screen |
| **USER (Passenger)** | Tap NFC/QR to check in, view pending debts, view trip/payment history |
| **ADMIN (Driver/Car Owner)** | Everything USER can do + record gas/parking costs, manage debts, manage users, manage cars, generate QR codes |

---

## 3. Data Models

```
User {
  id, clerkId, name, email, image, role (PENDING/USER/ADMIN)
  → ownedCars[], trips[], payments[]
}

Car {
  id, name, licensePlate, defaultGasCost, ownerId
  → owner(User), trips[], tripCosts[], payments[]
}

Trip {                          // 1 record = 1 NFC tap by 1 passenger
  id, userId, carId, tripCostId?, date, tappedAt
}

TripCost {                      // Aggregated daily costs per car
  id, carId, date, gasCost, parkingCost, label
  → trips[]
}

Payment {                       // Debt settlement record
  id, userId, carId, amount, note, date
}

```

---

## 4. Calculation Logic — Design UI to display every step clearly

### 4.1 Per-Person Cost Calculation

```
Core Formula:
─────────────────────────────────────────────────
headcount = unique passengers + 1 driver (if driver is not already in passengers list)

total per person   = (gasCost + parkingCost) / headcount
gas per person     = gasCost / headcount
parking per person = parkingCost / headcount
─────────────────────────────────────────────────

Exception: Driver (car owner) does NOT owe debt — driver's share is absorbed by passengers
Rounding: All values rounded to 2 decimal places → Math.round(value * 100) / 100
```

### 4.2 Payment Application — FIFO (First In, First Out)

```
Debt Settlement Order:
─────────────────────────────────────────────────
1. Sort debts by date (oldest first)
2. Apply payment amount to the oldest debt first
3. If payment exceeds that debt → carry over remainder to next debt
4. If payment doesn't fully cover a debt → remaining debt stays unpaid

Partial payment ratio calculation:
  adjusted_share = entry.share × (1 - remaining_payment / entry.share)
─────────────────────────────────────────────────
```

### 4.3 Calculation Example (Use for design mockup data)

```
Example: March 10, 2026 (B.E. 2569)
─────────────────────────────────────────────────
Car: Toyota HiAce (กก-1234)
Passengers: Somchai, Somying, Somsri (3 people)
Driver (car owner): Sombat

headcount = 3 passengers + 1 driver = 4 people

Gas cost:     ฿200
Parking cost: ฿100
Total:        ฿300

Per person:         300 / 4 = ฿75.00
  ├─ Gas:           200 / 4 = ฿50.00
  └─ Parking:       100 / 4 = ฿25.00

Sombat (driver): Owes nothing ✓
Somchai:  Debt ฿75.00
Somying:  Debt ฿75.00
Somsri:   Debt ฿75.00
─────────────────────────────────────────────────

Partial payment example:
Somchai pays ฿100 → March 10 debt (฿75) cleared, ฿25 remaining → applied to next day's debt
```

---

## 5. All Screens to Design

### 5.1 Dashboard (Home)

**For USER (Passenger):**
- **Total Debt Card** — Shows current month's pending debt as a large, prominent red number (฿XXX.XX)
- **Expandable Debt Breakdown** — Tap to view details:
  - Each item shows: car name, date, debt amount
  - Expandable sub-details:
    - `Gas ฿200 / 4 people = ฿50.00`
    - `Parking ฿100 / 4 people = ฿25.00`
  - Shows 5 items at a time + "Load More" button
- **Recent Trips** — Last 5 trips showing: date, tap time, car name, trip number

**Additional for ADMIN (Driver):**
- **Cost Entry Form:**
  - Dropdown to select car (if multiple cars owned)
  - Gas cost input field (pre-filled from car's defaultGasCost)
  - Parking cost input field (default 0)
  - "Save" button with loading state
- **Debt Settlement Section:**
  - List of users with pending debt, sorted highest to lowest
  - Each user shows: name, pending debt amount, "Mark as Settled" button
  - Expandable per-user breakdown
  - Confirmation dialog before settlement

---

### 5.2 History — 3 Tabs

**Tab 1: Trips**
- Date range filter (start — end)
- Infinite scroll (10 items per page)
- Grouped by date with trip numbering
- Shows: date, tap time, car name, trip number
- Admin: can edit/delete timestamps

**Tab 2: Payments**
- Date range filter
- Infinite scroll
- Shows: car name, payment date, amount, note
- Expandable details

**Tab 3: Summary**
- Period selector: Day / Month / Year
- Groups data by selected period
- Each group shows:
  - Status: Settled / Pending
  - Accrued / Paid / Pending per user
  - Total gas / total parking
- **Hierarchical drill-down:** Year → Month → Day → Per-car details
- Each level shows calculation formulas:
  - `Gas ฿XXX / X people = ฿XX.XX`
  - `Parking ฿XXX / X people = ฿XX.XX`

---

### 5.3 Tap Confirmation & Success

**Tap Confirm Screen:**
- Shows the car being tapped
- Confirm / Cancel buttons

**Tap Success Screen — 4 states to design:**
- **Check-in successful** — "Recorded successfully! Trip #X"
- **Already recorded** — "You already checked in today" (anti-fraud 2-hour debounce)
- **No open trip** — "No trip available for today"
- **Owner self-tap** — "Car owner does not need to tap"

---

### 5.4 Admin Panel

**5.4.1 User Management:**
- Full user list
- Role badges: PENDING (yellow) / USER (green) / ADMIN (red)
- Actions: Approve / Change role / Remove access
- PENDING users show prominent "Approve" button

**5.4.2 Car Management:**
- Car list: name, license plate, default gas cost
- Add new car / Delete car
- Set default gas cost

**5.4.3 QR Code:**
- Display QR code for each car
- Show linked URL for tap page
- Download/share QR

---

### 5.5 Auth & Status Pages

- **Sign In / Sign Up** (via Clerk)
- **Pending Approval** — Waiting screen with explanation of the approval process

---

## 6. UI Design Requirements

### 6.1 Design System

```
Primary Color:    Blue (#2563EB / blue-600) — primary buttons, links
Success Color:    Green (#16A34A / green-600) — settled, success states
Danger Color:     Red (#DC2626 / red-600) — debts, errors, delete actions
Warning Color:    Yellow/Amber (#D97706) — pending states, warnings
Neutral:          Slate/Gray — secondary text, backgrounds

Background:       Gradient (slate-50 → white → blue-50/40)
Cards:            White, rounded-xl (12px) to rounded-2xl (16px), subtle shadow
Font:             Inter (sans-serif)
Currency Format:  ฿XXX.XX (Thai Baht)
Calendar:         Buddhist Era (B.E.) for Thai locale, Gregorian for English
```

### 6.2 Responsive Design

```
Mobile First (highest priority):
  - Most users tap NFC on their phones
  - Card-based layout
  - Touch-friendly targets (min 44px)
  - Bottom navigation or hamburger menu

Tablet:
  - 2-column layout for Admin panel
  - Side panel for detail views

Desktop:
  - Full dashboard layout
  - Tables instead of cards for data-heavy views
  - Side-by-side comparison views
```

### 6.3 Interaction Patterns

```
Expandable/Collapsible:  Debt details, calculation formulas
Infinite Scroll:          Trip history, payment history
Load More Button:         Breakdown items (5 at a time)
Confirmation Dialog:      Before Mark as Settled, delete car, remove user
Loading States:           Buttons show "..." while loading + disabled state
Animations:               fade-in, scale-in for cards
Pull to Refresh:          For mobile dashboard
```

### 6.4 Data Visualization Requirements

```
Main Debt Amount:     Large, prominent red number with ฿ symbol
Calculation Formula:  Sub-line display e.g. "฿200 / 4 people = ฿50.00"
Headcount:            Show number of riders "4 people"
Payment Status:       Color-coded badges (green=settled, red=pending, yellow=waiting)
Progress Bar:         % paid vs % pending (optional)
Timeline:             History sorted by date
Drill-down:           Year → Month → Day → per-car details
```

---

## 7. Calculation Display Components — Design in detail

### 7.1 Breakdown Card (Debt Detail Card)

```
┌──────────────────────────────────────────┐
│  Mar 10, 2026 — Toyota HiAce            │
│  Your debt: ฿75.00                       │
│                                          │
│  ▼ Calculation Details                   │
│  ┌────────────────────────────────────┐   │
│  │ Riders: 4 people                   │   │
│  │   (Somchai, Somying, Somsri        │   │
│  │    + Driver)                       │   │
│  │                                    │   │
│  │ Gas                                │   │
│  │   ฿200.00 / 4 people = ฿50.00     │   │
│  │                                    │   │
│  │ Parking                            │   │
│  │   ฿100.00 / 4 people = ฿25.00     │   │
│  │                                    │   │
│  │ ────────────────────────────────── │   │
│  │ Total: ฿300.00 / 4 = ฿75.00       │   │
│  └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### 7.2 Debt Settlement Card (Admin View)

```
┌──────────────────────────────────────────┐
│  Somchai                                 │
│  Pending debt: ฿150.00                   │
│                                          │
│  ▼ Breakdown                             │
│  ┌────────────────────────────────────┐   │
│  │ Mar 10 — ฿75.00                    │   │
│  │   Gas ฿200 / 4 = ฿50              │   │
│  │   Parking ฿100 / 4 = ฿25          │   │
│  │                                    │   │
│  │ Mar 11 — ฿75.00                    │   │
│  │   Gas ฿150 / 3 = ฿50              │   │
│  │   Parking ฿75 / 3 = ฿25           │   │
│  └────────────────────────────────────┘   │
│                                          │
│  [ Confirm Settlement ]                  │
└──────────────────────────────────────────┘
```

### 7.3 Summary Drill-Down

```
┌──────────────────────────────────────────┐
│  March 2026                    Pending   │
│  Total: ฿3,200  |  Pending: ฿1,500      │
│                                          │
│  ▼ Week 1 (Mar 1-7)                     │
│    ▼ Mar 3, 2026                         │
│      Toyota HiAce (กก-1234)             │
│      Gas ฿200 / 4 = ฿50/person          │
│      Parking ฿100 / 4 = ฿25/person      │
│      4 riders | Total ฿300              │
│                                          │
│      ├─ Somchai:  ฿75 → Settled         │
│      ├─ Somying:  ฿75 → Pending         │
│      └─ Somsri:   ฿75 → Pending         │
│                                          │
│  ▶ Week 2 (Mar 8-14)                    │
│  ▶ Week 3 (Mar 15-21)                   │
└──────────────────────────────────────────┘
```

### 7.4 Payment FIFO Visualization (Debt Settlement Flow)

```
┌──────────────────────────────────────────┐
│  Somchai paid ฿100.00                    │
│                                          │
│  Payment applied:                        │
│  ┌────────────────────────────────────┐   │
│  │ 1. Mar 10 — Debt ฿75.00           │   │
│  │    Deducted ฿75.00 → Balance ฿0   │   │
│  │    Remaining payment: ฿25.00       │   │
│  │                                    │   │
│  │ 2. Mar 11 — Debt ฿75.00           │   │
│  │    Deducted ฿25.00 → Balance ฿50  │   │
│  │    Remaining payment: ฿0           │   │
│  └────────────────────────────────────┘   │
│                                          │
│  Summary: Paid ฿100 / Outstanding ฿50   │
└──────────────────────────────────────────┘
```

---

## 8. Nice-to-Have Screens

### 8.1 Dashboard Widgets (Optional)
- **Trend Chart:** Line graph showing monthly expenses
- **Pie Chart:** Gas vs Parking cost proportion
- **Heatmap Calendar:** Days with trips (darker = more trips)
- **Leaderboard:** Most frequent riders

### 8.2 Quick Actions
- **Floating Action Button (FAB):** Quick NFC Tap/QR Scan from home
- **Swipe Actions:** Swipe left for details, right for Mark as Settled
- **PWA Widget:** Show debt balance on Home Screen

### 8.3 Notification UI
- **Push Notification Card:** Notify when new debt is recorded
- **In-App Banner:** Notify when admin records daily costs

---

## 9. Anti-Fraud & Edge Cases (Design UI to handle)

```
- 2-hour debounce:      Show "You already tapped. Please wait 2 hours."
- Owner self-tap:       Show "Car owner does not need to tap."
- No TripCost yet:      Show "No costs recorded for today yet."
- Zero debt:            Show positive message: "No pending debts!"
- New PENDING user:     Waiting screen with step-by-step explanation
```

---

## 10. Deliverables Checklist

- [ ] **Mobile Dashboard** — USER view (debt card + breakdown + recent trips)
- [ ] **Mobile Dashboard** — ADMIN view (+ cost entry form + debt settlement)
- [ ] **History — Trips Tab** (date filter + infinite scroll + grouped by date)
- [ ] **History — Payments Tab** (date filter + infinite scroll)
- [ ] **History — Summary Tab** (drill-down year/month/day + calculation formulas)
- [ ] **Tap Confirm & Success** (4 status states)
- [ ] **Admin — User Management** (approve/change role/remove)
- [ ] **Admin — Car Management** (add/delete/configure)
- [ ] **Admin — QR Code** (display/download)
- [ ] **Pending Approval** (waiting screen)
- [ ] **Sign In / Sign Up**
- [ ] **Design System** (Colors, Typography, Components, Icons)
- [ ] **Calculation Display Components** (Breakdown card, FIFO visualization, Summary drill-down)

---

## 11. How to Use This Prompt

### With v0.dev (Vercel):
```
Copy content from Sections 5-7 and paste into v0.dev with:
"Design a mobile-first Thai bus cost-splitting app dashboard with these specifications.
Use React + Tailwind CSS. Show detailed calculation breakdowns at every level."
```

### With Figma AI:
```
Use Section 7 wireframes as reference, then have AI generate high-fidelity mockups.
```

### With Claude/GPT:
```
Paste this entire prompt and say:
"Design all UI components according to this spec using React + Tailwind CSS.
Show detailed calculations at every step. Mobile-first responsive design."
```

### Quick One-Shot Prompt (for any AI tool):
```
Design a mobile-first cost-splitting app for Thai shared van rides.

Key features:
- NFC/QR tap check-in for passengers
- Fair cost splitting: (gas + parking) / headcount
- Driver (car owner) doesn't pay — only passengers owe
- FIFO payment system (oldest debts first)
- Expandable calculation breakdowns showing "฿200 / 4 people = ฿50.00"
- Admin dashboard for recording costs and settling debts
- Bilingual Thai/English with Buddhist calendar

Design system: Blue primary, Red for debts, Green for settled,
White cards with rounded corners, Inter font, ฿ currency format.

Screens needed: Dashboard, History (3 tabs), Tap flow, Admin panel, Auth pages.
```
