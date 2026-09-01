# Synced — MVP Planning Document

## Product Vision
A collaborative code editor that enables teams to build together in real-time with live cursors, chat, and instant preview. Available as a web app (free trial) and desktop app (full features).

## Architecture
- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Editor**: CodeMirror 6 with custom extensions
- **Database**: Supabase (PostgreSQL + Realtime + Auth)
- **Desktop**: Electron 33 with custom titlebar
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (web) + electron-builder (desktop)

---

## MVP Priorities

### 🔴 P0 — Critical (Must ship)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | CI/CD pipeline passes | ❌ | Fix lint script, pnpm config |
| 2 | README with setup instructions | ❌ | Required for open source |
| 3 | NSIS installer for Windows | ❌ | Required for distribution |
| 4 | Supabase migration scripts | ❌ | Required for fresh installs |
| 5 | Environment variable docs | ❌ | Required for setup |

### 🟡 P1 — High (Should ship)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 6 | CONTRIBUTING.md | ❌ | Required for open source |
| 7 | GitHub issue templates | ❌ | Required for bug reports |
| 8 | MIT License | ❌ | Required for open source |
| 9 | Git commit hooks (husky) | ❌ | Code quality |
| 10 | Pre-commit linting | ❌ | Code quality |

### 🟢 P2 — Medium (Nice to have)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 11 | macOS build | ❌ | Cross-platform support |
| 12 | Linux build | ❌ | Cross-platform support |
| 13 | Auto-update server | ❌ | Electron auto-updates |
| 14 | Analytics integration | ❌ | Usage tracking |
| 15 | Error reporting (Sentry) | ❌ | Bug tracking |

### ⚪ P3 — Low (Future)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 16 | Plugin system | ❌ | Extensibility |
| 17 | VS Code extension | ❌ | IDE integration |
| 18 | Mobile app | ❌ | React Native |
| 19 | AI code completion | ❌ | Intelligence |
| 20 | Team billing | ❌ | Monetization |

---

## Completed Features

### ✅ Frontend
- Full code editor with CodeMirror 6
- File tree with VS Code-style icons
- Nested folders with animations
- Split editor view
- Tabs with drag-and-drop
- Find & Replace (Ctrl+F)
- Keyboard shortcuts (Ctrl+W, Ctrl+N, Ctrl+S, etc.)
- Command palette (Ctrl+K)
- Quick file picker (Ctrl+P)
- Theme toggle (light/dark)
- Settings modal

### ✅ Collaboration
- Real-time presence
- Live cursors
- Chat panel
- Invite collaborators
- Activity feed

### ✅ Database
- Supabase connection
- File CRUD operations
- Workspace management
- Version history
- Collaborator management
- Real-time subscriptions

### ✅ Desktop
- Electron wrapper
- System tray with minimize-to-tray
- Auto-updates (electron-updater)
- Native file dialogs
- Custom frameless titlebar
- Real Git integration

### ✅ Tools
- Terminal emulator
- Git panel (status, branches, log, diff)
- Version history with diff viewer
- Notifications
- Onboarding tour
- Empty workspace state
- Error handling with retry

### ✅ Infrastructure
- CI/CD pipeline (GitHub Actions)
- E2E tests (Playwright)
- Unit tests (Vitest - 308 tests)
- Error boundaries
- Loading skeletons
- SEO metadata

### ✅ Auth & Dashboard
- Sign-up/Sign-in with email
- OAuth (GitHub, Google)
- Dashboard with workspace list
- Create/delete workspaces
- Starter files seeding
- Route protection

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.3.0 |
| Language | TypeScript 5.7 |
| UI | shadcn/ui + Tailwind CSS 4 |
| Editor | CodeMirror 6 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Desktop | Electron 33 |
| Testing | Vitest + Playwright |
| CI/CD | GitHub Actions |
| Deployment | Vercel + electron-builder |
