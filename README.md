# Orbit Social — Complete Next.js Starter

An original Reddit-inspired community social app built with Next.js App Router, React, TypeScript, and CSS.

## Included
- Responsive desktop, tablet, and mobile layouts
- Search posts, filter communities and saved posts
- For you / Latest / Top sorting
- Create posts, upvote/downvote, comments
- Save posts, share links, join communities
- Profile preview and light/dark themes
- Local browser persistence with localStorage
- No API keys or extra UI libraries required

## Run on macOS
1. Extract this ZIP.
2. Open Terminal in the extracted `orbit-social-complete` folder.
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. Open http://localhost:3000
5. Keep the terminal running. Stop with Control+C.

Use VS Code → File → Open Folder → select `orbit-social-complete` itself.

## Build
```bash
npm run build
npm start
```

## Important scope
This is a complete runnable **local MVP/frontend prototype**, not a production multi-user network. Posts, votes, comments, saved items, joined communities and theme settings persist in this browser using localStorage. Different devices/users do not share data. Real accounts, shared database, uploads, messaging, moderation and production security require a backend such as Supabase or a custom API. Never expose service-role secrets in browser code.

The design is an original Orbit interface inspired by community-platform conventions; it does not use another platform's branding or proprietary assets.

## Troubleshooting
- If port 3000 is occupied: `npm run dev -- -p 3001`, then open http://localhost:3001.
- If unstyled: confirm `app/layout.tsx` contains `import "./globals.css";`, restart dev server, then hard refresh.
- Reset local demo data in browser console: `localStorage.removeItem("orbit-social-v1"); location.reload();`
- Sample post images use remote Unsplash URLs; app functionality works if they do not load.
