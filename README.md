# ECWC ERP Frontend - Landing Page Template

A modern, responsive frontend template built with Next.js 14, TypeScript, and Tailwind CSS. This is a **frontend-only template** with no backend connections - perfect for showcasing UI/UX designs.

## Features

- 🎨 Modern UI with dark mode support
- ⚡ Built with Next.js 14 (App Router)
- 🎭 Smooth animations with Framer Motion
- 🎯 TypeScript for type safety
- 🎨 Tailwind CSS for styling
- 📱 Fully responsive design
- 🌙 Theme toggle functionality
- 🔐 Sign In / Sign Up pages (frontend-only, no backend)
- 📊 Dashboard layout with Sidebar and Header components

## Project Structure

```
ecwc-erp-frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   ├── sign-in/
│   │   └── page.tsx        # Sign in page (frontend-only)
│   ├── sign-up/
│   │   └── page.tsx        # Sign up page (frontend-only)
│   └── globals.css          # Global styles
├── components/
│   ├── Header.tsx          # Dashboard header component
│   ├── Layout.tsx          # Dashboard layout wrapper
│   ├── Sidebar.tsx         # Dashboard sidebar navigation
│   ├── theme-toggle.tsx    # Theme toggle component
│   └── ui/                 # UI components
│       ├── alert.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       └── select.tsx
├── lib/
│   └── utils.ts            # Utility functions
├── public/
│   └── logo.png            # Logo image (optional)
└── package.json            # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd ecwc-erp-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the landing page.

## Available Pages

- `/` - Landing page
- `/sign-in` - Sign in page (frontend-only, no actual authentication)
- `/sign-up` - Sign up page (frontend-only, no actual registration)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:win` - Build using a path without spaces (Windows; use if `build` fails with EPERM)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### If build fails with EPERM (operation not permitted on `.next\trace`)

On Windows this often happens when the dev server is running or the project path is locked. Try:

1. **Stop the dev server** – Press `Ctrl+C` in the terminal where `npm run dev` is running.
2. **Run build from an external terminal** – Open PowerShell or Command Prompt *outside* Cursor, go to the project folder, and run `npm run build`.
3. **Use the Windows workaround** – Run `npm run build:win` (builds via a drive letter path).
4. **Run as Administrator** – Right‑click PowerShell or CMD → “Run as administrator”, then `cd` to the project and run `npm run build`.

## Frontend-Only Template

**Important:** This is a frontend-only template. All API calls have been removed or replaced with mock functionality:

- **Sign In**: Shows an alert message instead of actual authentication
- **Sign Up**: Uses mock data for departments, positions, and locations
- **No Backend**: All forms are for UI demonstration only

To connect to a backend:
1. Create API routes in `app/api/` directory
2. Replace mock functions with actual API calls
3. Update form handlers to use real authentication

## Customization

### Logo
- Place your logo at `public/ecwc png logo.png`
- Or update the icon components in `components/Sidebar.tsx` and pages

### Colors
- Modify the color scheme in `app/globals.css` to match your brand
- Update `tailwind.config.ts` for custom colors (e.g., `ecwc-green`)

### Content
- Edit `app/page.tsx` to customize the landing page
- Update `components/Sidebar.tsx` for navigation items
- Modify `components/Header.tsx` for header content

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **shadcn/ui** - UI component library

## License

This project is a frontend template for demonstration purposes.
