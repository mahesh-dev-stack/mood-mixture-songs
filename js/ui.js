/**
 * ui.js — DOM Rendering & UI Updates
 * Handles all rendering: mood cards, track list, player panel.
 * No API calls or audio logic here.
 */

const UI = (() => {

  // ── Mood Definitions ──────────────────────────────────────────────────────

  const MOODS = [
    { id: 'chill',        label: 'Chill',       emoji: '🌊', tag: 'chill',        gradient: 'linear-gradient(135deg, #1a6b9a, #0d4f6e)' },
    { id: 'happy',        label: 'Happy',       emoji: '☀️', tag: 'happy',        gradient: 'linear-gradient(135deg, #f7971e, #e85d04)' },
    { id: 'energetic',    label: 'Energetic',   emoji: '⚡', tag: 'energetic',    gradient: 'linear-gradient(135deg, #e63946, #c1121f)' },
    { id: 'sad',          label: 'Sad',         emoji: '🌧️', tag: 'sad',          gradient: 'linear-gradient(135deg, #4a4e69, #22223b)' },
    { id: 'focus',        label: 'Focus',       emoji: '🧠', tag: 'instrumental', gradient: 'linear-gradient(135deg, #2d6a4f, #1b4332)' },
    { id: 'party',        label: 'Party',       emoji: '🎉', tag: 'party',        gradient: 'linear-gradient(135deg, #7b2d8b, #e040fb)' },
    { id: 'romantic',     label: 'Romantic',    emoji: '💖', tag: 'romantic',     gradient: 'linear-gradient(135deg, #c9184a, #ff4d6d)' },
    { id: 'sleep',        label: 'Sleep',       emoji: '🌙', tag: 'sleep',        gradient: 'linear-gradient(135deg, #0f3460, #16213e)' },
  ];

  // ── DOM Refs ──────────────────────────────────────────────────────────────

  const $ = id => document.getElementById(id);

  // ── Mood Grid ─────────────────────────────────────────────────────────────

  function renderMoodGrid(onMoodSelect) {
    const grid = $('mood-grid');
    grid.innerHTML = '';
    MOODS.forEach(mood => {
      const card = document.createElement('button');
      card.className = 'mood-card';
      card.setAttribute('data-mood', mood.id);
      card.setAttribute('aria-label', `Select ${mood.label} mood`);
      card.style.background = mood.gradient;
      card.innerHTML = `
        <span class="mood-emoji" aria-hidden="true">${mood.emoji}</span>
        <span class="mood-label">${mood.label}</span>
      `;
      card.addEventListener('click', () => {
        setActiveMood(mood.id);
        onMoodSelect(mood);
      });
      grid.appendChild(card);
    });
  }

  function setActiveMood(moodId) {
    document.querySelectorAll('.mood-card').forEach(c => c.classList.remove('active'));
    const active = document.querySelector(`[data-mood="${moodId}"]`);
    if (active) active.classList.add('active');
  }

  // ── Sections ──────────────────────────────────────────────────────────────

  function showLoading() {
    $('track-section').classList.remove('hidden');
    $('track-list').innerHTML = '';
    $('tracks-heading').textContent = 'Fetching tracks…';

    // Skeleton loaders
    const skeletons = Array.from({ length: 6 }, () => {
      const s = document.createElement('div');
      s.className = 'track-skeleton';
      s.innerHTML = `
        <div class="skel skel-img"></div>
        <div class="skel-info">
          <div class="skel skel-title"></div>
          <div class="skel skel-artist"></div>
        </div>
        <div class="skel skel-dur"></div>
      `;
      return s;
    });
    skeletons.forEach(s => $('track-list').appendChild(s));
  }

  function showError(msg) {
    $('track-section').classList.remove('hidden');
    $('tracks-heading').textContent = 'Oops!';
    $('track-list').innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">😞</span>
        <p>${msg}</p>
      </div>`;
  }

  function showTracks(tracks, moodLabel, onTrackClick, currentIndex) {
    $('tracks-heading').textContent = `${moodLabel} Vibes`;
    const list = $('track-list');
    list.innerHTML = '';

    if (!tracks.length) {
      list.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🎵</span>
          <p>No tracks found for this mood — try another!</p>
        </div>`;
      return;
    }

    tracks.forEach((track, idx) => {
      const item = document.createElement('div');
      item.className = 'track-item';
      item.setAttribute('data-index', idx);
      item.setAttribute('aria-label', `Play ${track.name} by ${track.artist_name}`);
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      if (idx === currentIndex) item.classList.add('playing');

      const dur = Player.formatTime(track.duration);
      item.innerHTML = `
        <div class="track-num">${idx + 1}</div>
        <img class="track-art" src="${track.image || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect width=%22200%22 height=%22200%22 fill=%22%23222%22/><text x=%2250%%22 y=%2250%%22 fill=%22%23555%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-size=%2240%22>🎵</text></svg>'}" 
             alt="${track.album_name || track.name}" 
             loading="lazy"
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect width=%22200%22 height=%22200%22 fill=%22%23222%22/><text x=%2250%%22 y=%2250%%22 fill=%22%23555%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-size=%2240%22>🎵</text></svg>'">
        <div class="track-info">
          <div class="track-name">${escHtml(track.name)}</div>
          <div class="track-artist">${escHtml(track.artist_name)}</div>
        </div>
        <div class="track-duration">${dur}</div>
        <div class="eq-bars" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </div>
      `;

      const play = () => onTrackClick(idx);
      item.addEventListener('click', play);
      item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
      list.appendChild(item);
    });
  }

  function highlightTrack(index) {
    document.querySelectorAll('.track-item').forEach((el, i) => {
      el.classList.toggle('playing', i === index);
    });
    // Scroll into view
    const playing = document.querySelector('.track-item.playing');
    if (playing) playing.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ── Player Panel ──────────────────────────────────────────────────────────

  function updatePlayerTrack(track) {
    if (!track) return;
    $('player-art').src = track.image || '';
    $('player-art').alt = track.album_name || track.name;
    $('player-track-name').textContent = track.name;
    $('player-artist-name').textContent = track.artist_name;
    $('player-bar').classList.add('visible');
  }

  function updatePlayPauseBtn(playing) {
    const btn = $('btn-play-pause');
    btn.innerHTML = playing
      ? `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
    btn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  function updateProgress(currentTime, duration) {
    if (!isFinite(duration) || duration === 0) return;
    const pct = (currentTime / duration) * 100;
    $('progress-fill').style.width = `${pct}%`;
    $('progress-thumb').style.left = `${pct}%`;
    $('time-current').textContent = Player.formatTime(currentTime);
    $('time-total').textContent = Player.formatTime(duration);
  }

  function setLoadingState(isLoading) {
    const btn = $('btn-play-pause');
    btn.classList.toggle('loading', isLoading);
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function getMoods() {
    return MOODS;
  }

  return {
    renderMoodGrid,
    setActiveMood,
    showLoading,
    showError,
    showTracks,
    highlightTrack,
    updatePlayerTrack,
    updatePlayPauseBtn,
    updateProgress,
    setLoadingState,
    getMoods,
  };
})();
