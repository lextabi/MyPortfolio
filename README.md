# MyPortfolio

Personal portfolio website for Lex Joseph Tabi, focused on DevOps, CI/CD, application support, automation, and monitoring for business-critical enterprise applications.

## Overview

This is a static portfolio site designed for GitHub Pages. It highlights experience in CI/CD and release automation, L2/L3 production support, databases and integrations (Oracle, SQL Server, IBM MQ, REST APIs), monitoring and observability, incident/change/problem management, cloud and infrastructure support, and operational documentation.

The site also includes a professional Beyond Engineering section for Lex's content creator work around running, travel, and food experiences across the Philippines.

## Current Sections

- Hero with availability status, core tech strip, and profile card
- About, including the types of systems supported
- Professional highlights
- Skills (9 grouped categories, including App Development)
- Experience timeline
- What I Do (capability cards)
- Tabi Studio: Lex's independent Android app studio, with app cards for Runling and MT App (screenshots, engineering highlights, product and release-notes links)
- Projects & GitHub: featured projects with live demo links, plus other public repos loaded from the GitHub API
- Achievements, certifications, and education
- Beyond Engineering / content creator section
- Contact links

## Files

- `index.html` - main portfolio page
- `styles.css` - site styling and responsive layout
- `script.js` - mobile navigation, active-section highlighting, scroll reveal, footer year, and GitHub repository loading (cached per session to stay under the API rate limit)
- `assets/` - public-safe visual assets; `assets/apps/` holds the Tabi Studio mark, app icons, and resized app screenshots (480px JPEGs) copied from the `tabistudio` site

## Latest Session Changes

Updated September 29, 2026:

- Added a Tabi Studio section, framed as a side venture (founder and solo developer), with Runling (Godot 4, Kotlin, Supabase) and MT App (Flutter, SQLite, 188 tests) in open testing, and the engineering practices behind them.
- Added a "Tabi Studio" nav link, an App Development skills card, and a Tabi Studio mention in About and the meta description.
- The studio repos (`tabistudio`, `Runling_release`, `mt_app_release`) are excluded from the auto-loaded "More on GitHub" list since they are covered by the new section.

Updated September 27, 2026 from the latest resume:

- Redesigned the UI with a glassmorphism style: ambient gradient background, frosted glass cards, floating pill navigation, gradient headline, rounded buttons and chips, scroll-reveal animations, and active-section nav highlighting. Honors `prefers-reduced-motion`.
- Repositioned the messaging from warehouse-system specialist to enterprise application support and DevOps, keeping warehouse, shipping, and e-commerce as the most recent domain.
- Rebuilt Skills into eight grouped categories aligned with the resume, and Experience into scannable bullets.
- Replaced project themes with "What I Do" capability cards.
- Added hand-picked featured projects with live demo and source links; the remaining repos load from the GitHub API with language colors and live-demo detection.
- Removed client infrastructure details and internal project names; moved the Facebook link out of the professional contact area.
- Added Open Graph tags, a favicon, a skip link, and accessibility improvements to the mobile menu.

## Local Preview

Open `index.html` in a browser, or use the VS Code Live Server extension for a live preview.

## Deployment

This project is intended to be pushed to GitHub and published with GitHub Pages.