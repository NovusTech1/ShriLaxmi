Shri Laxmi Catalogue
=====================

Overview
--------
A Next.js website for the Shri Laxmi catalogue. Built with React and TailwindCSS. Supabase is included as a dependency for possible backend/data needs.

Quick commands
--------------
- Install dependencies: npm install
- Run development server: npm run dev
- Build for production: npm run build
- Start production server: npm run start
- Lint: npm run lint

Project file structure (tree)
-----------------------------
root/
├─ .env.local                # Local environment variables (not committed)
├─ .git/                     # Git metadata (hidden)
├─ .gitignore                # Files & folders ignored by git
├─ next.config.mjs           # Next.js configuration
├─ jsconfig.json             # Editor & path alias configuration
├─ package.json              # Project manifest: scripts and dependencies
├─ package-lock.json         # Locked dependency tree
├─ postcss.config.mjs        # PostCSS (Tailwind) configuration
├─ README.md                 # This file
├─ node_modules/             # Installed dependencies (do not commit)
├─ .next/                    # Next.js build output (generated)
├─ public/                   # Static assets (images, icons, robots.txt, etc.)
│  ├─ images/                # Project images (example)
│  └─ favicon.ico            # Favicon (example)
└─ src/                      # Application source code
   ├─ app/                   # App Router routes and layouts
   │  ├─ (route folders)     # e.g. /, /about, /products (each route is a folder)
   │  ├─ layout.jsx / layout.tsx   # Shared layout for routes
   │  ├─ page.jsx / page.tsx       # Route entry files
   │  └─ head.jsx / head.tsx       # Metadata for routes
   ├─ components/           # Reusable UI components
   │  ├─ Footer.jsx          # Site footer: contact links, store directions, copyright
   │  ├─ Header.jsx          # (example) site header/navigation
   │  ├─ ProductCard.jsx     # (example) card used to display product info
   │  └─ ...                # Other UI components
   ├─ lib/                  # Utility libraries and helpers
   │  ├─ supabase.js        # (example) Supabase client initialization and helpers
   │  └─ api.js             # (example) wrapper functions for APIs
   └─ middleware.js         # Next middleware for routing/auth (runs on matching requests)

Notes on key files
------------------
- .env.local: Add required environment variables here (Supabase URL/anon key, any API keys). This file is not committed.
- package.json: Contains scripts used to run, build and lint the app. Important dependencies include next, react, react-dom, and @supabase/supabase-js.
- public/: Put static images and assets here. Files in public are served at the site root (e.g., /images/logo.png).
- src/app/: Contains route folders and layout/page files using Next.js App Router conventions. Keep route-specific components here.
- src/components/Footer.jsx: A presentational component that renders site footer content (social links, email, Google Maps directions, copyright, credit). Uses Tailwind utility classes.
- src/lib/: Put app-level helpers here (e.g., Supabase client setup, formatters, fetch wrappers).
- src/middleware.js: If present, middleware runs on the edge for requests matching its configuration — be careful when changing.

How to read the tree
--------------------
- Indentation shows folder nesting. Files under a folder are indented beneath it.
- Comments after file names (prefixed with #) briefly describe purpose and important notes.

If you want the tree expanded further (list every file in src/app, or exact components in src/components), say which folder to expand and an updated tree will be added.
