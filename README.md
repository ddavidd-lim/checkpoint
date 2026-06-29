# 📍 Waypoint

A rich text note-taking app that lets you tag locations inline and visualize them on a map to keep notes and maps together.

---

## ✨ Features

- 📝 **Rich text editing** via TipTap — headings, tasks, code blocks, and more
- 📍 **Location tagging** — attach a place to any note and view a map of the location
- 🗺️ **Live overview map** — all places in a note appear as pins on a live side panel map
- ⚡ **Optimistic updates** — instant UI feedback with TanStack Query mutation caching
- 💾 **Auto-save** — debounced saves
- 🔐 **Auth & row-level security** — per-user data isolation enforced at the database layer via Supabase RLS

---

## 🔧 Technologies

| Layer | Stack |
| --- | --- |
| Frontend | React, TypeScript, Vite, MUI v6 |
| Editor | TipTap (SimpleEditor) |
| Maps | Google Maps JavaScript API / Places API |
| Data fetching | TanStack Query |
| Backend / Auth | Supabase (PostgreSQL + RLS) |

---

## 💡 Motivations

I would call myself an avid notetaker and I'm usually the one delegated to planning the itinerary and deciding the best route.

Some of the biggest pain points have been in bridging notes and maps.
Every destination I consider requires a separate Google Maps tab to look up where I would need to either embed or paste a link, which are both slow.

I wanted to create a way I could visualize everything at once while being conservative with space, so I came up with a rich text editor that allows autocomplete using the Google Maps API as well as a popup map on hover. The side panel contains an overview map to view all locations relative to each other as well as a table containing details on each location referenced in the note.

It was cool building this up since it fills the gaps I’ve faced in other note apps and resulted in having something cool to share with my friends when I’m in my planning phases.

---

## 🚀 Deployments

| Environment | URL |
| --- | --- |
| Production | https://waypoint-notes.vercel.app/ |

---

## 🎥 Preview

*Screenshots / GIF demo coming soon*

---

## ⚙️ Setup

```bash
# 1. Clone the repo
git clone <https://github.com/yourusername/waypoint.git>
cd waypoint/client

# 2. Install dependencies
npm install

# 3. Configure environment
# Ensure environment variables for supabase and Google Maps API are in .env

# 4. Run locally
npm run dev
```
