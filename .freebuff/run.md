# Run Doc — Freebuff Desktop Preview

## Reproduce Uncommitted Artifacts

Copy `.env.local` from the main checkout if not present:
```
copy .env.local .env.local
```

Dependencies are already installed. If starting fresh:
```
pnpm install
```

## Run the Dev Server

Start the Next.js dev server:
```
npm run dev
```

Next.js will automatically pick a free port (currently 56708). Check the terminal output for the exact URL. The server uses Turbopack and is ready in ~1 second.
