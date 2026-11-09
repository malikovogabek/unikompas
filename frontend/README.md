# UniKompas — frontend

React 19 + TypeScript 7 + Vite 8 SPA (Tailwind CSS 4, TanStack Query, React Router 8, i18next uz/ru/en).

```bash
npm install
npm run dev        # http://localhost:5173 (proxies /api to http://localhost:8080)
npm run typecheck && npm run lint && npm test && npm run build
```

Environment: see `.env.example` (`VITE_API_BASE_URL`, `VITE_SHOW_DEMO_HINT`).
Deployed on Vercel from `main` (root directory `frontend`). Rules and design system: [`../CLAUDE.md`](../CLAUDE.md).
