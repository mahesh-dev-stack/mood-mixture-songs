# Mood Mixer — Project Requirements & Implementation Plan

## Overview
Build a static web app called **Mood Mixer**. Users select a mood, and the app fetches matching songs from the **Jamendo API** (free, royalty-free music, no login required) and plays them in-browser using a built-in audio player. No backend, no database — pure client-side app.

## Tech Stack
- HTML5, CSS3, Vanilla JavaScript (React acceptable if preferred, but not required)
- **Jamendo API** (free tier, API key only — no OAuth needed)
- HTML5 `<audio>` element for playback (no external player library needed)
- No backend, no database
- Must be deployable as a static site (Vercel, Netlify, GitHub Pages, or Cloudflare Pages)

## Jamendo API Setup (One-Time, Free)
1. Register a free account at https://developer.jamendo.com
2. Create an app to get a free **Client ID** (this acts as the API key)
3. Base endpoint for track search:
```
https://api.jamendo.com/v3.0/tracks/?client_id=YOUR_CLIENT_ID&format=json&tags=chill&limit=15
```
4. Key query parameters to use:
   - `tags` — mood/genre tag (e.g., `chill`, `happy`, `energetic`, `sad`, `party`, `relax`)
   - `limit` — number of tracks to fetch (recommend 10–15 per mood)
   - `include=musicinfo` — optional, returns extra metadata like tags/vocal instrumental info
   - `audioformat=mp32` — ensures playable audio URL is returned in response
5. Note: Client ID is safe to expose in client-side code for this use case (it's a public API key, not a secret) — no backend proxy required for this project's scope.

## Functional Requirements

### 1. Mood Selector Screen
- Display a grid/row of mood cards, each with a label and icon/emoji. Minimum moods to support:
  - Chill (`tags=chill`)
  - Happy (`tags=happy`)
  - Energetic (`tags=energetic`)
  - Sad (`tags=sad`)
  - Focus (`tags=instrumental`)
  - Party (`tags=party`)
- Clicking a mood card triggers the API fetch for that mood's tracks
- Show a loading state (spinner/skeleton) while the fetch is in progress

### 2. Track List Display
- After fetching, display a scrollable list of tracks showing:
  - Album art (`image` field from API response)
  - Track name (`name` field)
  - Artist name (`artist_name` field)
  - Duration (`duration` field, convert seconds to `MM:SS`)
- Clicking any track in the list starts playback of that track and highlights it as "currently playing"
- Handle empty results gracefully (e.g., "No tracks found for this mood, try another!")
- Handle API errors gracefully (e.g., network failure, invalid response) with a user-friendly message

### 3. Audio Player (Persistent, Bottom or Fixed Panel)
- Use the HTML5 `<audio>` element, controlled via JavaScript (not native browser controls — build custom UI)
- Required controls:
  - Play / Pause toggle
  - Progress bar (seekable — clicking/dragging jumps to that point in the track)
  - Current time / total duration display (`MM:SS / MM:SS`)
  - Volume slider
  - Next track / Previous track buttons (navigate within the currently loaded mood's track list)
- Auto-play the next track in the list when the current one ends
- Show currently playing track's name, artist, and album art in the player panel
- Highlight the currently playing track in the track list (e.g., background color or animated equalizer icon)

### 4. Mood Switching Behavior
- If a user selects a new mood while a track is playing, stop current playback and load the new mood's track list
- Optionally: show a confirmation only if desired — default behavior should just switch immediately (keep UX simple)

### 5. UI/UX Requirements
- Responsive design — must work on mobile, tablet, and desktop
- Each mood card should have a distinct color/gradient theme (e.g., Chill = blue tones, Energetic = orange/red tones, Sad = grey/blue tones) for visual variety
- Smooth transitions between mood selection and track list view (CSS transitions, no jarring reloads)
- Dark theme by default (fits a "music app" aesthetic); optional light theme toggle

## Non-Functional Requirements
- No page reload on any interaction (single-page app behavior)
- Gracefully handle slow network / API latency with loading indicators
- Do not hardcode more than one API key reference — store it in a single config variable/file for easy replacement
- Code should be modular: separate concerns for (a) API calls, (b) UI rendering, (c) audio player logic
- No unnecessary dependencies — prefer vanilla JS/fetch API over heavy libraries

## Suggested Folder Structure
```
mood-mixer/
├── index.html
├── style.css
├── /js
│   ├── api.js         (Jamendo API calls)
│   ├── player.js       (audio player logic: play/pause/seek/volume/next/prev)
│   ├── ui.js           (rendering mood cards, track list, updating DOM)
│   └── main.js         (app initialization, event wiring)
├── /assets
│   └── icons/          (mood icons if not using emoji)
└── config.js           (Jamendo Client ID stored here)
```

## API Response Reference (for the agent's context)
Example Jamendo track object structure to expect from the API response (`results` array):
```json
{
  "id": "1234567",
  "name": "Track Title",
  "duration": 210,
  "artist_name": "Artist Name",
  "album_name": "Album Name",
  "image": "https://usercontent.jamendo.com/...",
  "audio": "https://prod-1.storage.jamendo.com/...",
  "audiodownload": "https://prod-1.storage.jamendo.com/..."
}
```
- Use the `audio` field URL as the `src` for the HTML5 `<audio>` element.

## Deliverables
1. Fully working static site source code (HTML/CSS/JS)
2. `config.js` file with a placeholder for the Jamendo Client ID, clearly commented on where to insert it
3. Clean, commented, modular code as per the folder structure above
4. A short `README.md` with:
   - How to get a free Jamendo Client ID
   - How to add it to `config.js`
   - How to run locally (e.g., via `Live Server` extension or `npx serve`)
   - How to deploy to Vercel/Netlify (drag-and-drop or GitHub integration)

## Out of Scope (This Version)
- User accounts / login
- Saving playlists or favorites (no persistence needed for v1 — can be a stretch goal via localStorage later)
- Spotify integration (future v2 possibility)
- Backend/proxy server for API calls

## Stretch Goals (Optional, Only After Core Features Work)
- Save favorite tracks using `localStorage`
- Add a search bar to look up specific tracks/artists directly via Jamendo API
- Add a shuffle mode for the track list
- Add a "Surprise Me" button that picks a random mood
- Add simple visualizer bars synced to audio playback (Web Audio API + Canvas)
