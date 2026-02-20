# St·Surfers — Official Site

**Street Surfers South-Side Shuttles**
Scheduled staff & scholar shuttle transport · Johannesburg South Side, South Africa

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS custom properties
- **Animations:** Framer Motion
- **Maps:** Leaflet + react-leaflet@4 (CartoDB dark tiles, Nominatim geocoding, OSRM routing)
- **Forms:** react-hook-form + Zod → Google Apps Script → Google Sheets
- **Deployment:** Netlify

---

## Getting Started

```bash
npm install
npm run dev       # → http://localhost:3000
npm run build     # production build check
npm run lint
```

---

## Project Structure

```
site/
├── app/
│   ├── globals.css          # Tailwind layers + utility classes
│   ├── layout.tsx           # Fonts, metadata, OG tags
│   └── page.tsx             # Home page
├── components/              # All page sections + UI components
├── lib/
│   └── constants.ts         # All business data (pricing, contact, copy)
├── styles/
│   ├── tokens.css           # CSS custom properties
│   └── base.css             # Reset + base typography
└── public/
    ├── assets/
    │   ├── logo/            # Brand logo files
    │   └── video/           # Hero background video
    └── thank-you.html       # Post-waitlist confirmation page
```

---

## Forms Backend

All 3 forms (Waitlist, Driver Application, Coverage Interest) submit to a single Google Apps Script deployment, routing to separate sheet tabs via `sheetName` in the JSON payload.

---

## Contact

**info@streetsurfers.com** · +27 69 164 3842
Reg No: 2024/681346/07
