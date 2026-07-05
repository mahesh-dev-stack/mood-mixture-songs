/**
 * player.js — Audio Player Logic
 * Controls the HTML5 <audio> element and exposes a clean interface.
 * No DOM rendering here — only playback state management.
 */

const Player = (() => {
  const audio = new Audio();
  audio.preload = 'metadata';

  let playlist = [];
  let currentIndex = -1;
  let onTrackChange = null;   // callback(track, index)
  let onStateChange = null;   // callback('playing' | 'paused' | 'ended' | 'loading')
  let onTimeUpdate = null;    // callback(currentTime, duration)
  let onEnded = null;         // internal — auto-next

  // ── Helpers ──────────────────────────────────────────────────────────────

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // ── Audio Event Wiring ────────────────────────────────────────────────────

  audio.addEventListener('play', () => onStateChange?.('playing'));
  audio.addEventListener('pause', () => {
    if (!audio.ended) onStateChange?.('paused');
  });
  audio.addEventListener('waiting', () => onStateChange?.('loading'));
  audio.addEventListener('canplay', () => {
    if (!audio.paused) onStateChange?.('playing');
  });
  audio.addEventListener('timeupdate', () => {
    onTimeUpdate?.(audio.currentTime, audio.duration);
  });
  audio.addEventListener('ended', () => {
    onStateChange?.('ended');
    playNext();
  });
  audio.addEventListener('error', () => {
    onStateChange?.('error');
    // Try next track on error
    setTimeout(playNext, 800);
  });

  // ── Public API ────────────────────────────────────────────────────────────

  function loadPlaylist(tracks, startIndex = 0) {
    playlist = tracks;
    playAt(startIndex);
  }

  function playAt(index) {
    if (index < 0 || index >= playlist.length) return;
    currentIndex = index;
    const track = playlist[currentIndex];
    audio.src = track.audio;
    audio.load();
    audio.play().catch(() => {/* autoplay policy — user must interact */});
    onTrackChange?.(track, currentIndex);
    onStateChange?.('loading');
  }

  function playNext() {
    if (playlist.length === 0) return;
    const next = (currentIndex + 1) % playlist.length;
    playAt(next);
  }

  function playPrev() {
    if (playlist.length === 0) return;
    // If more than 3s in, restart current track; else go to previous
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
    } else {
      const prev = (currentIndex - 1 + playlist.length) % playlist.length;
      playAt(prev);
    }
  }

  function togglePlayPause() {
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  function seek(seconds) {
    if (isFinite(audio.duration)) {
      audio.currentTime = Math.max(0, Math.min(seconds, audio.duration));
    }
  }

  function seekByFraction(fraction) {
    if (isFinite(audio.duration)) {
      audio.currentTime = fraction * audio.duration;
    }
  }

  function setVolume(v) {
    audio.volume = Math.max(0, Math.min(1, v));
    audio.muted = (v === 0);
  }

  function stop() {
    audio.pause();
    audio.src = '';
    playlist = [];
    currentIndex = -1;
    onStateChange?.('paused');
  }

  function getState() {
    return {
      paused: audio.paused,
      currentTime: audio.currentTime,
      duration: audio.duration,
      volume: audio.volume,
      currentIndex,
      track: playlist[currentIndex] || null,
    };
  }

  // ── Callback Registration ─────────────────────────────────────────────────

  function on(event, cb) {
    if (event === 'trackchange') onTrackChange = cb;
    if (event === 'statechange') onStateChange = cb;
    if (event === 'timeupdate') onTimeUpdate = cb;
  }

  return {
    loadPlaylist,
    playAt,
    playNext,
    playPrev,
    togglePlayPause,
    seek,
    seekByFraction,
    setVolume,
    stop,
    getState,
    on,
    formatTime,
  };
})();
