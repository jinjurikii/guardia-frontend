# Guardia Web — Frontend

Next.js frontend for Guardia Content platform.

## Stack
- Next.js 14+, React 18+, TypeScript
- Tailwind CSS + Framer Motion
- App router (src/app/)

## Design Language (Desert Mirage)
- Dark themes with warm accents
- Colors: violet (#a78bfa), surface (#0d0d0e), background (#050506)
- Soft glows, not harsh borders
- Breathing animations (subtle pulse)
- Mobile-first, generous whitespace

## Key Directories
- src/app/ — Pages and routes
- src/app/intake/ — Spark/Pro/Unleashed signup forms
- src/app/dashboard/ — Client dashboard
- src/components/ — Shared components
- public/demo/ — Demo landing pages for prospects

## Build & Test
```bash
cd /root/guardia-web && npm run build
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000
```

## API
Backend at http://localhost:8000.
DB symlinked: ./guardia_spire.db -> /root/guardia-core/guardia_spire.db
