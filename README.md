# AI Engineer Portfolio

A production-ready personal portfolio website using a realistic space/solar-system metaphor as the main navigation and visual identity. Built with Next.js, React Three Fiber, and Decap CMS.

![Space Portfolio](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)

## ✨ Features

- **3D Solar System Navigation** - Interactive space scene with planets as navigation nodes
- **Realistic Orbital Mechanics** - Keplerian orbits with inclinations and variable velocities
- **Git-based CMS** - Decap CMS for easy content management without code changes
- **Responsive Design** - Works beautifully on desktop and mobile
- **Accessibility** - Keyboard navigation, ARIA labels, reduced motion support
- **WebGL Fallback** - Graceful degradation for unsupported browsers
- **Ambient Audio** - Optional background audio with mute toggle

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/portfolio-site.git
cd portfolio-site

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## 📁 Project Structure

```
portfolio-site/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home (3D solar system)
│   │   ├── about/              # About page
│   │   ├── projects/           # Projects listing
│   │   ├── blog/               # Blog listing & posts
│   │   └── contact/            # Contact form
│   ├── components/
│   │   ├── three/              # React Three Fiber components
│   │   ├── layout/             # Header, navigation
│   │   └── AudioPlayer.tsx     # Audio toggle
│   ├── lib/
│   │   ├── content.ts          # Markdown content utilities
│   │   └── orbital-mechanics.ts # Keplerian orbital calculations
│   └── content/                # Markdown content
│       ├── blog/               # Blog posts (.md)
│       └── projects/           # Project entries (.md)
├── public/
│   ├── admin/                  # Decap CMS admin panel
│   ├── audio/                  # Audio assets
│   └── uploads/                # Uploaded images
└── package.json
```

## 🎨 Customization

### Updating Personal Info

1. Edit `src/app/layout.tsx` for site title and metadata
2. Edit `src/app/page.tsx` for hero section content
3. Edit `src/app/about/page.tsx` for biography and skills
4. Edit `src/app/contact/page.tsx` for contact links

### Adding Content

See [AUTHOR_GUIDE.md](./AUTHOR_GUIDE.md) for detailed instructions on:
- Writing blog posts
- Adding projects
- Uploading images
- Using the CMS admin panel

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
# Optional: Analytics
NEXT_PUBLIC_GA_ID=UA-XXXXXXXXX-X

# Optional: Contact form (Formspree)
NEXT_PUBLIC_FORMSPREE_ID=your-form-id
```

### CMS Authentication

For Decap CMS with Git Gateway (Netlify):

1. Enable Netlify Identity on your Netlify site
2. Enable Git Gateway in Netlify Identity settings
3. Invite yourself as a user

For other backends, see [Decap CMS documentation](https://decapcms.org/docs/backends-overview/).

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Build

```bash
# Production build
npm run build

# Start production server
npm start
```

## ⚙️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **3D Graphics**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **CMS**: [Decap CMS](https://decapcms.org/)
- **Deployment**: [Vercel](https://vercel.com/)

## 📝 Content Management

Content is managed through Markdown files with YAML frontmatter:

### Blog Post Example

```markdown
---
title: "My First Post"
date: "2024-01-15"
excerpt: "A brief description of the post"
draft: false
---

Your content here...
```

### Project Example

```markdown
---
title: "Project Name"
description: "What the project does"
tags: ["Python", "ML"]
github: "https://github.com/..."
featured: true
---
```

## 🔒 Security

- Admin panel is not indexed by search engines
- Draft content hidden in production
- No exposed secrets in client code
- Form submissions handled securely

## 📄 License

MIT License - feel free to use this for your own portfolio!

## 🙏 Acknowledgments

- Three.js and React Three Fiber communities
- Decap CMS (formerly Netlify CMS)
- Tailwind CSS team
