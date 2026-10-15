# ZB Design website

Two-page static site for ZB Design Sdn. Bhd., an interior design and renovation company in Taman Melawati, Kuala Lumpur. It is built with Astro and TypeScript (strict). The approved design is in `design-reference/` and the copy source is `docs/zb-design-copy-deck.md`.

- `/`: Home
- `/projects/`: Projects

Projects have no pages of their own. Clicking a project (the Home hero, a Selected work row, or a project card) opens it in an image viewer with a **Design stage | Completion** toggle.

## Run locally

Requires Node 22.12 or newer (see `.nvmrc`).

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # type-checks (astro check), then builds to dist/
npm run preview    # serves the built site
npm run format     # Prettier
```

## Edit copy and company details

All copy lives in `src/data/site.ts`: the intro, marquee, about text (the landing section), facts, philosophy, services, approach (six core concepts), credentials, smart home questions, contact details, and the Projects page intro.

Anything in `[square brackets]` is still waiting on the client. Search for `[` to find them.

## Projects

Each project is one Markdown file plus a folder of images.

### Content model

`src/content/projects/<slug>.md`:

```md
---
title: Federal Hill Superlink House
code: ZB15
year: 2023
type: residential # residential | commercial
featured: true # show on the Home page (Selected work)
typeConfirmed: true # false shows the type in [brackets] until the client confirms it
---
```

The body is not used.

Projects are listed newest first: by year, then by code. The Home page shows the featured projects, and the hero is the first featured project in that order.

### Images

Images are found by folder, so you never list them in the Markdown file:

```
src/assets/projects/<slug>/design/       3D design-stage renders
src/assets/projects/<slug>/completion/   completion photos
```

- Use JPG, PNG, WebP or AVIF files. Large originals are fine, since Astro generates the responsive sizes.
- Files are shown in filename order (`01.jpg`, `02.jpg`, …).
- The cover (card, hero and preview image) is the first completion photo, or the first design render if there are no completion photos yet.
- If a project only has one kind of image, the viewer hides the Design stage | Completion toggle.

### Add a project

1. Create `src/content/projects/<slug>.md` (copy an existing file).
2. Put its images in `src/assets/projects/<slug>/design/` and/or `src/assets/projects/<slug>/completion/`.

The `<slug>` must be the same in both places.

### Replacing the placeholders

The current images are neutral generated placeholders.

- When real images arrive, delete a project's placeholder files and drop the real ones in.
- `npm run placeholders` recreates any missing placeholders (pass `-- --force` to overwrite). It also creates `public/og-default.png`, the default social-sharing image.
- Once all placeholders are replaced, set `showPlaceholderLabels: false` in `src/data/site.ts`.

### Adding a project type

To add a type (for example `education` if the client confirms it for INTI), add it to `projectTypes` in `src/content.config.ts` and its label to `typeLabels` in `src/data/projects.ts`. A filter button for it appears automatically on the Projects page.

## Replace the logo

TODO: get the official logo SVG from the client.

The logo mark in `src/components/Logo.astro` and the favicons in `public/` are cut from `docs/ZBD_logo full color.jpg`. If a vector (SVG) logo arrives, swap it in there.

## Deploy

The site builds to static files in `dist/`, so no server is needed.

**Vercel:** import the Git repository. The Astro preset is detected automatically (build `npm run build`, output `dist`).

**Netlify:** import the repository and set the build command to `npm run build` and the publish directory to `dist`.

Environment variables:

| Variable           | Purpose                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SITE_URL`         | Final address, e.g. `https://www.zbdesign.com.my`. Used for canonical URLs, Open Graph, the sitemap and robots.txt. Defaults to the placeholder `https://zbdesign.example`. |
| `PUBLIC_INDEXABLE` | Leave unset while the site is in review. Set to `true` only at launch (see below).                                                                                          |

## Launch: switch off noindex

By default every build is hidden from search engines:

- Every page has `<meta name="robots" content="noindex, nofollow">`.
- `robots.txt` contains `Disallow: /`.

Only after the client has approved the site:

1. Set `PUBLIC_INDEXABLE=true` in the Vercel or Netlify environment variables for **production only** (keep preview deployments hidden).
2. Make sure `SITE_URL` is the final domain.
3. Redeploy. The noindex tag disappears, and robots.txt allows crawling and points to the sitemap.

## Connect the client's domain

Do this only after the client has approved the preview URL.

1. In the Vercel or Netlify project, open **Domains** and add the client's domain (apex and `www`).
2. At the client's DNS provider, add the records the host shows you (usually an A/ALIAS record for the apex and a CNAME for `www`).
3. Wait for HTTPS to be issued, set `SITE_URL` to the final domain, and redeploy.

## Structure

```
src/
  components/       Header, Footer, Logo, Motif, SelectedWork, ProjectViewer
  content/          projects/*.md
  content.config.ts project schema
  data/             site.ts (copy), projects.ts (image discovery, sorting, viewer data)
  layouts/          BaseLayout (SEO, noindex switch, fonts, skip link)
  pages/            index, projects/index, robots.txt
  scripts/          header, mobile-menu, index-preview, filter, project-viewer (TypeScript)
  styles/           global.css (tokens + shared styles)
scripts/generate-placeholders.mjs
docs/zb-design-copy-deck.md
```
