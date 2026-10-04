# CuraStyl (Mumbai GlamHub) — Complete Technical, Architectural & Business Master Documentation

> **Team AgniDev’s (FRCRCE Bandra, Mumbai)**  
> **Founders:** Akshat Churi (CEO), Shreyas Mahajan (CTO), Sania Dcunha (COO), Daksh Ghatal (CPO)  
> **Live Production App:** [https://curastyl.agnidev.me](https://curastyl.agnidev.me)  
> **Event:** PitchX 2026 | Jio World Centre, BKC, Mumbai  

---

## 1. Executive Summary & Problem Statement

### 1.1 What is CuraStyl?
**CuraStyl** is India’s first **AI-enabled Hyperlocal Physical Salon Marketplace & In-Browser 3D WebAR Try-On Platform**. It bridges the massive disconnect between consumers looking for reliable personal styling and offline neighborhood salons operating with high unmonetized idle capacity.

### 1.2 The Core Problem
1. **Consumer Styling Anxiety & Regret:** 68% of consumers dread trying new hairstyles because they cannot visualize how a cut will suit their face shape, jawline, or hair texture before the scissor cuts their hair.
2. **Offline Salon Inefficiency & Idle Capacity:** Neighborhood salons operate at only **58% chair utilization Monday to Thursday**. They rely on manual paper registers, experience a **42% blind-wait/no-show rate**, and suffer revenue loss during off-peak hours.
3. **The Discovery Void:** Google Maps only provides an unverified phone number and static reviews with zero slot booking; Urban Company refuses to partner with physical salons because it cannibalizes their at-home freelance model.

### 1.3 The CuraStyl Solution
* **Zero-Download 3D WebAR Try-On:** Real-time 3D hairstyle visualization running directly inside mobile Chrome/Safari using MediaPipe FaceMesh (468 landmarks) via WebAssembly.
* **Gemini 1.5 Multimodal Beauty Strategist:** AI Style DNA diagnostics analyzing face shape, skin undertone, and hair density.
* **Hyperlocal Real-Time Booking & Slot Locking:** Instant digital slot confirmation with specific stylists, reducing wait time to zero.
* **AI Government Premise Verification:** Zero-fraud onboarding that inspects BMC Gumasta licenses, electricity bills, or commercial rent agreements via Gemini 1.5 Vision OCR in under 60 seconds.
* **GlamPoints Loyalty Economy:** Closed-loop cashback that eliminates platform disintermediation and keeps both salon and consumer transacting on-platform.

---

## 2. Complete Technology Stack

| Layer | Technologies Used | Purpose / Implementation |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router), React 19, TypeScript** | Server Components, dynamic streaming, SEO optimization, and API route handling. |
| **Styling & Animation** | **Tailwind CSS v4, Framer Motion, Radix UI primitives, Lucide Icons** | Ultra-modern glassmorphism UI, fluid drawer transitions, accessible UI tokens, and mobile-first micro-animations. |
| **3D Rendering & WebAR** | **Three.js, @react-three/fiber, @react-three/drei, WebGL** | Real-time 3D hair rendering, cranial anchor matrices, lighting shaders, and material customization. |
| **Facial Tracking** | **@mediapipe/face_mesh (Wasm), @mediapipe/tasks-vision, Kalman Filter** | 468 3D facial landmark detection running client-side at 60 FPS with zero jitter. |
| **Machine Learning / Segmentation** | **@tensorflow/tfjs, @tensorflow-models/blazeface, BodyPix** | Real-time hair strand segmentation and biometric bounding box calculation. |
| **Artificial Intelligence** | **Google Gemini 1.5 Flash / Pro (`@google/generative-ai`)** | Multimodal OCR document verification, AI Style DNA diagnostic recommendations, and conversational beauty consultation. |
| **API Resilience** | **Custom 10-Key Auto-Rotation Client (`gemini-client.ts`)** | Cycles across 10 API keys with exponential backoff to completely eliminate 429 Rate Limit bottlenecks. |
| **Backend & Database** | **Supabase (PostgreSQL, Row Level Security, Auth, Realtime)** | User identity, salon listings, stylist schedules, dynamic slot allocation, and reviews. |
| **Maps & Geocoding** | **Leaflet, OpenStreetMap Nominatim API** | Interactive salon map, distance radius calculations, and instant Map Auto-Fill onboarding. |
| **Payments** | **Razorpay SDK, UPI Integration, In-App Escrow Wallet** | Tokenized slot booking, digital refunds, and automated merchant commission deductions. |
| **State & Client Storage** | **Zustand, LocalStorage, React Hot Toast** | Lightweight global state for active try-on styles, cart items, user profile, and notifications. |
| **PDF Generation** | **jsPDF, html2canvas** | Automated generation of downloadable personal AI style consultation reports. |

---

## 3. Detailed Architecture & File Structure

```
CuraStyl-main/
├── src/
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── page.tsx                     # Consumer Landing Page & Hero Discovery
│   │   │   ├── virtual-tryon/page.tsx       # Real-Time 3D WebAR Hairstyle Fitting Room
│   │   │   ├── ai-assistant/page.tsx        # Gemini Multimodal Beauty Strategist Consultation
│   │   │   ├── salons/                      # Salon Search, Area Filtering & Distance Grid
│   │   │   ├── checkout/page.tsx            # Slot Booking, UPI Payment & GlamPoints Redemption
│   │   │   ├── dashboard/page.tsx           # Customer Account, Active Bookings & History
│   │   │   ├── salon-owner/
│   │   │   │   ├── register/page.tsx        # 5-Step Onboarding with Map Auto-Fill & AI Verification
│   │   │   │   ├── dashboard/page.tsx       # Salon ERP (Appointments, Staff, Pricing, Earnings)
│   │   │   ├── admin/page.tsx               # Platform Admin (Salon Verification Approvals, Metrics)
│   │   │   └── rewards/page.tsx             # GlamPoints Balance & Redemption Offers
│   │   ├── api/
│   │   │   ├── salon/verify-document/       # Gemini 1.5 Vision OCR Document Verification Endpoint
│   │   │   ├── salons/                      # Salon CRUD & Spatial Queries
│   │   │   ├── bookings/                    # Slot Reservation & Status Lifecycle
│   │   │   ├── payment/razorpay/            # Payment Order Creation & Webhook Verification
│   │   │   ├── glam-points/                 # Cashback Calculation & Wallet Ledger
│   │   │   └── ai/chat/                     # Beauty Strategist Multi-Turn Dialogue
│   ├── components/
│   │   ├── ai-beauty/
│   │   │   ├── RealTime3DAR.tsx             # Live Camera WebAR Engine using MediaPipe & Three.js
│   │   │   ├── VirtualTryOn.tsx             # Hairstyle Selector, Color Customizer, Photo Upload
│   │   │   ├── DigitalTwinViewer.tsx        # 360-Degree Interactive 3D Head Model Viewer
│   │   │   └── AIBeautyEngine.tsx           # Comprehensive Diagnostic Orchestrator
│   │   ├── salon/
│   │   │   ├── SalonVerificationStep.tsx    # Document Upload, Real-Time OCR Analysis & Scoring
│   │   │   └── SalonRegistrationForm.tsx    # Dynamic Multi-Step Onboarding Wizard
│   │   ├── booking/                         # Date Picker, Stylist Selector, Slot Matrix
│   │   └── auth/RouteGuard.tsx              # Multi-Role Access Control (Customer/Owner/Admin)
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── gemini-client.ts             # 10-Key Auto-Rotation Client with Quota Protection
│   │   │   ├── beauty-strategist-system.ts  # Intent Detection, Memory, & Structured Prompting
│   │   │   └── domain-validator.ts          # Guardrails against Off-Topic Queries & Hallucinations
│   │   ├── ai-beauty/
│   │   │   ├── mediapipe-face-engine.ts     # Client-Side Wasm 468-Landmark Pipeline
│   │   │   ├── ar-hair-renderer.ts          # Three.js Dynamic Mesh Deformation & Anchoring
│   │   │   ├── compatibility-scoring.ts     # Geometric Face Shape vs Hairstyle Rule Engine
│   │   │   └── salon-matcher.ts             # Direct Link from Recommended Style to Local Salons
│   │   └── supabase/                        # Database Client & SSR Auth Session Managers
```

---

## 4. Key Workflows & Breakthrough Features (What is Happening)

### Feature 1: In-Browser 3D WebAR Hairstyle Try-On
* **Zero App Download Friction:** Users click a link or scan a QR code; it runs immediately inside mobile Chrome or Safari.
* **468-Point Cranial Tracking:** Uses `@mediapipe/face_mesh` running via WebAssembly on the device GPU.
* **Kalman Filter Smoothing:** Filters out micro-jitters, ensuring the 3D hairstyle model stays rigidly anchored to the user's skull even when moving or turning their head up to 60 degrees.
* **Sub-1.8 MB 3D Assets:** All 3D `.glb` hairstyle models use Draco mesh compression and compressed PBR textures, loading in under 1.2 seconds over 4G connections.
* **Direct Booking Handoff:** Once a user likes a hairstyle (e.g. *"Textured Quiff Fade"*), clicking *"Book This Look"* filters nearby salons that specialize in that exact cut with pre-populated service tags.

### Feature 2: Gemini 1.5 Multimodal Beauty Strategist (Style DNA)
* Users can type styling questions or upload a selfie for diagnostic consultation.
* **Facial Geometry Extraction:** Calculates jawline ratio, cheekbone distance, forehead width, and chin prominence to identify the face shape (*Oval, Square, Round, Heart, Diamond*).
* **Deterministic Guardrails:** The AI does not invent unachievable styles; it classifies the user's attributes and maps them against verified, salon-executable cuts.
* **10-Key Auto-Rotation Architecture:** Avoids Google API 429 rate limit caps by round-robining requests across 10 distinct API keys with automatic failover.

### Feature 3: Automated Salon Onboarding & Fraud Verification (New Feature)
* **The Problem Solved:** Eliminates ghost listings, fake addresses, and unauthorized barbers.
* **Mandatory Government Address Proof:** Salons must submit 1 of 3 valid proofs:
  1. **BMC Gumasta License** (Maharashtra Shops & Establishments Act)
  2. **Commercial Electricity Bill** (Adani Electricity, Tata Power, BEST, or MSEDCL)
  3. **Registered Commercial Rent Agreement**
* **Instant Gemini Vision OCR:** The `/api/salon/verify-document` endpoint processes the image in under 60 seconds, extracting establishment name, consumer name, municipal ward, and full address.
* **Strict Scoring Algorithm:**
  * Out-of-city/state documents (e.g. Kolkata/Delhi instead of Mumbai): **Score defaults to 0%**.
  * Unaccepted documents (food bills, tax invoices, random receipts): **Score defaults to 0%–10%**.
  * Address match score $\ge 70\%$ required for verification.
* **Strict Blocking:** If verification fails, a prominent red alert is displayed, and the **"Continue" button is strictly disabled**, preventing unverified salons from going live.
* **Map Auto-Fill:** Salon owners enter their business name; OpenStreetMap Nominatim fetches verified street geometry, coordinates, and area details in 45 seconds.

### Feature 4: Real-Time Slot Locking & Zero No-Show Check-In
* **Live Stylist Calendars:** Customers select their preferred stylist, date, and 30-minute time window.
* **Tokenized Slot Reservation:** Customers pay a small refundable booking token (₹50–₹100) via UPI to lock the slot.
* **QR Check-In Verification:** Upon arrival at the salon, the customer presents a digital QR pass. The salon scans it to confirm attendance and credit the booking to the platform ledger.

### Feature 5: GlamPoints Tokenomics & Disintermediation Defense
* **The Risk:** Customers and barbers bypassing the platform after the first appointment.
* **The Defense:**
  * Customers earn **5% to 10% cashback in GlamPoints** on every platform booking.
  * Points are redeemable for discounts on expensive treatments (keratin, balayage, facials).
  * If a customer pays offline in cash, they forfeit their reward points, booking dispute protection, and digital hair history.
  * Salons receive automated WhatsApp reminders, calendar sync, and featured listing priority only for on-platform transactions.

---

## 5. Database Schema & Data Models

### 5.1 Primary Entities
1. **Users (`users`):** `id`, `email`, `full_name`, `phone`, `avatar_url`, `role` (`customer` | `salon_owner` | `admin`), `created_at`.
2. **Salons (`salons`):** `id`, `owner_id`, `name`, `slug`, `address`, `area`, `city`, `pincode`, `lat`, `lng`, `cover_image`, `gallery_images`, `category`, `rating`, `review_count`, `starting_price`, `is_verified`, `is_active`, `amenities`, `working_hours`.
3. **Services (`services`):** `id`, `salon_id`, `name`, `description`, `category`, `price`, `duration` (minutes), `is_active`.
4. **Staff (`staff`):** `id`, `salon_id`, `name`, `role`, `specialization`, `avatar_url`, `rating`, `experience_years`, `is_active`.
5. **Bookings (`bookings`):** `id`, `booking_id`, `user_id`, `salon_id`, `service_id`, `staff_id`, `booking_date`, `time_slot`, `status` (`pending` | `confirmed` | `completed` | `cancelled`), `total_amount`, `discount_amount`, `final_amount`, `payment_status`.
6. **Reviews (`reviews`):** `id`, `user_id`, `salon_id`, `rating`, `comment`, `is_verified`, `ai_summary`.
7. **Coupons & GlamPoints (`coupons`, `glam_points_ledger`):** Points balance, transaction history, and redemption thresholds.

---

## 6. Business Model, Monetization & Unit Economics

### 6.1 Revenue Streams
1. **Marketplace Transaction Commission (10% Take Rate):** Deducted automatically from completed salon bookings.
2. **B2B Salon SaaS Subscriptions:**
   * **Starter Tier (Free):** Up to 20 bookings/month, basic calendar.
   * **Pro Tier (₹999/month):** Unlimited bookings, staff performance tracking, automated WhatsApp confirmations, QR check-in.
   * **Enterprise Tier (₹2,499/month):** Multi-chair scheduling, advanced analytics, priority search placement.
3. **Featured Sponsored Listings:** Salons pay ₹1,500/week for top-of-search placement in their postal code.
4. **Brand Partnerships & Product Sampling:** D2C grooming brands (Beardo, Minimalist, L'Oréal) paying for contextual product placement after AI hair analysis.

### 6.2 Unit Economics (The Math)
* **Average Order Value (AOV):** ₹850 blended (Men's grooming ₹350 every 3 weeks; Women's styling ₹1,800–₹4,500 every 6 weeks).
* **Average Frequency:** 8.5 visits per user per year = **₹7,225 annual GMV per transacting user**.
* **Net Platform Take (10%):** ₹722.50 net revenue per user annually.
* **Customer Acquisition Cost (CAC):** ₹180 (driven by viral 3D WebAR social sharing and college campus loops).
* **3-Year Customer Lifetime Value (LTV):** ₹2,167.
* **LTV / CAC Ratio:** **12.0x** with a **CAC Payback Period of 2.8 months**.

---

## 7. Hyperlocal Go-To-Market & Cold Start Strategy

### 7.1 The Bandra Beachhead Cluster
* Rather than spreading marketing budget across Mumbai, CuraStyl concentrates on a **4-km geographic cluster**: Bandra West, Khar, and Santacruz.
* **Supply First:** 35 top neighborhood salons onboarded on Hill Road, Linking Road, and Pali Hill with 0% commission for 60 days.
* **Demand Density:** Bandra is surrounded by 15,000+ college students across FRCRCE, MMK, National, and RD National Colleges.
* **Campus Ambassador Loops:** Student styling competitions where users try WebAR styles, share on Instagram, and earn ₹100 GlamPoints.
* **Liquidity Milestone:** 35 salons provide 85% consumer liquidity within a 10-minute walk of any Bandra resident.

---

## 8. Data Privacy & DPDP Act 2023 Compliance

* **Zero Server-Side Facial Biometrics:** All 468 landmark calculations run **100% locally on the user's device GPU** via WebAssembly. The camera stream never touches CuraStyl servers.
* **Ephemeral Memory Analysis:** Uploaded style photos are processed in an encrypted temporary RAM buffer for Gemini Vision diagnosis and immediately purged.
* **Explicit Consent:** Revocable camera permissions and transparent data policies ensure full compliance with the Digital Personal Data Protection (DPDP) Act 2023.

---

## 9. Founder Division of Responsibilities

```
                         CURASTYL EXECUTIVE TEAM
                                (FRCRCE)
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
   Akshat Churi             Shreyas Mahajan             Sania Dcunha
   Chief Executive Officer   Chief Technology Officer    Chief Operating Officer
   • Business Model & Moats  • 3D WebAR & MediaPipe      • Salon Supply Onboarding
   • Unit Economics & Math   • Three.js 60 FPS Engine    • Gumasta Verification Ops
   • Seed Ask & Runway       • Sub-1.8MB Compression     • Disintermediation Defense
   • Competition (Urban Co)  • Low-End Android Fallback  • Stylist Relations & SLA
                                   │
                              Daksh Ghatal
                          Chief Product Officer
                          • Gemini Vision OCR Algorithm
                          • 10-Key Auto-Rotation Engine
                          • AI Style DNA & Guardrails
                          • GlamPoints Loyalty Economy
                          • DPDP Act 2023 Privacy
```

---

## 10. Summary for AI Prompting & Judge Preparation

* **Core Elevator Pitch:** "CuraStyl is India's 1st AI-powered physical salon booking marketplace with zero-download 3D WebAR hairstyle try-on. We eliminate haircut styling anxiety for consumers while monetizing the 42% weekday idle chair capacity of neighborhood salons."
* **Killer Moat:** Proprietary 3D Indian facial anthropometry models + local salon density + ERP switching costs.
* **The Seed Ask:** ₹35 Lakhs seed capital over 18 months targeting **1,000 salons, 350,000 completed bookings, and ₹25 Cr GMV** ($3M) across Mumbai and Bengaluru.
