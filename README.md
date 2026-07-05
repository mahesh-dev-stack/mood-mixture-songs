# 🎧 Mood Mixer

> Stream royalty-free music matched to your mood — powered by the [Jamendo API](https://developer.jamendo.com). No backend, no login, pure client-side.

---

## ✨ Features

- **8 mood categories**: Chill, Happy, Energetic, Sad, Focus, Party, Romantic, Sleep
- **Custom audio player**: play/pause, seek, volume, prev/next, auto-advance
- **Skeleton loading** & graceful error handling
- **Animated equalizer** bars on the playing track
- **Dark/Light theme** toggle
- **Keyboard shortcuts**: `Space` (play/pause), `←` (prev), `→` (next)
- **Fully responsive** — mobile, tablet, desktop
- Deployable as a pure static site (no server needed)

---

## 🔑 Step 1 — Get a Free Jamendo Client ID

1. Go to **[https://developer.jamendo.com](https://developer.jamendo.com)**
2. Create a free account (no credit card needed)
3. Click **"Create App"** in your dashboard
4. Copy your **Client ID**

> The Jamendo API is free for non-commercial streaming projects. The Client ID is safe to include in client-side code for this use case.

---

## ⚙️ Step 2 — Add Your Client ID

Open `config.js` in the project root and replace the placeholder:

```js
// config.js
const CONFIG = {
  JAMENDO_CLIENT_ID: 'YOUR_CLIENT_ID_HERE', // ← Paste your Client ID here
  // ...
};
```

---

## 🖥️ Step 3 — Run Locally

You need a simple static file server (opening `index.html` directly won't work due to CORS on `fetch` from `file://`).

**Option A — VS Code Live Server**
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `index.html` → **Open with Live Server**

**Option B — npx serve (Node.js required)**
```bash
npx serve .
```
Then open `http://localhost:3000`

**Option C — Python**
```bash
python -m http.server 8080
```
Then open `http://localhost:8080`

---

## 🚀 Step 4 — Deploy for Free

### Vercel (recommended — drag & drop)
1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Click **"Add New Project"** → **"Deploy from Git"** or use drag-and-drop
3. Drag the entire project folder onto the Vercel dashboard
4. Done! Your app is live at a `*.vercel.app` URL

### Netlify
1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag the project folder onto **"Deploy manually"**
3. Live in seconds at a `*.netlify.app` URL

### GitHub Pages
1. Push this folder to a GitHub repository
2. Go to **Settings → Pages → Source: main branch / root**
3. Available at `https://<username>.github.io/<repo>`

### Cloudflare Pages
1. Connect your GitHub repo at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Framework preset: **None** (static)
3. Build command: *(leave empty)*
4. Output directory: `/` (root)

---

## 📂 Project Structure

```
mood-mixer/
├── index.html          # App shell
├── style.css           # All styles (dark/light theme, responsive)
├── config.js           # ← YOUR CLIENT ID GOES HERE
├── vercel.json         # Vercel deployment config
├── README.md
└── js/
    ├── api.js          # Jamendo API calls
    ├── player.js       # HTML5 Audio wrapper (play/pause/seek/volume/next/prev)
    ├── ui.js           # DOM rendering (mood cards, track list, player panel)
    └── main.js         # App init & event wiring
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `→` | Next track |
| `←` | Previous track |

---

## 🔒 Notes on the API Key

The Jamendo Client ID is a **public API key**, not a secret. It's safe to include it in client-side JavaScript for non-commercial streaming as per Jamendo's terms. No backend proxy is needed.

---

## 📄 License

MIT — feel free to use, modify, and deploy this project.
