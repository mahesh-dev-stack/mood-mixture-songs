/**
 * main.js — App Initialization & Event Wiring
 * Ties together API, Player, and UI modules.
 */

(function () {
  'use strict';

  // ── State ─────────────────────────────────────────────────────────────────

  let currentTracks = [];
  let currentMood = null;
  let isDraggingProgress = false;

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    UI.renderMoodGrid(handleMoodSelect);
    wirePlayerControls();
    wirePlayerCallbacks();
    wireThemeToggle();
    wireVolumeSlider();
    wireProgressBar();
    wireKeyboard();

    // Default volume
    Player.setVolume(0.8);
    document.getElementById('volume-slider').value = 80;
  }

  // ── Mood Selection ────────────────────────────────────────────────────────

  async function handleMoodSelect(mood) {
    if (currentMood?.id === mood.id) return; // Already selected
    currentMood = mood;

    // Stop current playback immediately
    Player.stop();
    UI.updatePlayPauseBtn(false);
    resetProgress();

    UI.showLoading();

    try {
      const tracks = await API.fetchTracksByMood(mood.tag);
      currentTracks = tracks;
      UI.showTracks(tracks, mood.label, handleTrackClick, -1);

      // Auto-play first track
      if (tracks.length > 0) {
        Player.loadPlaylist(tracks, 0);
      }
    } catch (err) {
      console.error('[MoodMixer] API error:', err);
      currentTracks = [];
      const msg = CONFIG.JAMENDO_CLIENT_ID === 'YOUR_CLIENT_ID_HERE'
        ? '⚠️ Please add your Jamendo Client ID to <code>config.js</code> to load tracks.'
        : `Failed to load tracks: ${err.message}. Please check your connection and try again.`;
      UI.showError(msg);
    }
  }

  function handleTrackClick(index) {
    if (index === Player.getState().currentIndex) {
      Player.togglePlayPause();
    } else {
      Player.playAt(index);
    }
  }

  // ── Player Callbacks ──────────────────────────────────────────────────────

  function wirePlayerCallbacks() {
    Player.on('trackchange', (track, index) => {
      UI.updatePlayerTrack(track);
      UI.highlightTrack(index);
    });

    Player.on('statechange', state => {
      if (state === 'loading') {
        UI.setLoadingState(true);
        UI.updatePlayPauseBtn(false);
      } else if (state === 'playing') {
        UI.setLoadingState(false);
        UI.updatePlayPauseBtn(true);
      } else if (state === 'paused' || state === 'ended' || state === 'error') {
        UI.setLoadingState(false);
        UI.updatePlayPauseBtn(false);
      }
    });

    Player.on('timeupdate', (currentTime, duration) => {
      if (!isDraggingProgress) {
        UI.updateProgress(currentTime, duration);
      }
    });
  }

  // ── Player Controls ───────────────────────────────────────────────────────

  function wirePlayerControls() {
    document.getElementById('btn-play-pause').addEventListener('click', () => {
      if (Player.getState().track) {
        Player.togglePlayPause();
      }
    });

    document.getElementById('btn-next').addEventListener('click', () => {
      Player.playNext();
    });

    document.getElementById('btn-prev').addEventListener('click', () => {
      Player.playPrev();
    });
  }

  // ── Progress Bar ──────────────────────────────────────────────────────────

  function wireProgressBar() {
    const bar = document.getElementById('progress-bar');

    function seekFromEvent(e) {
      const rect = bar.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      Player.seekByFraction(fraction);
      // Update UI immediately
      const { duration } = Player.getState();
      if (isFinite(duration)) UI.updateProgress(fraction * duration, duration);
    }

    bar.addEventListener('mousedown', e => {
      isDraggingProgress = true;
      seekFromEvent(e);
    });
    bar.addEventListener('touchstart', e => {
      isDraggingProgress = true;
      seekFromEvent(e);
    }, { passive: true });

    document.addEventListener('mousemove', e => {
      if (isDraggingProgress) seekFromEvent(e);
    });
    document.addEventListener('touchmove', e => {
      if (isDraggingProgress) seekFromEvent(e);
    }, { passive: true });

    document.addEventListener('mouseup', () => { isDraggingProgress = false; });
    document.addEventListener('touchend', () => { isDraggingProgress = false; });
  }

  // ── Volume ────────────────────────────────────────────────────────────────

  function wireVolumeSlider() {
    const slider = document.getElementById('volume-slider');
    const icon = document.getElementById('volume-icon');

    slider.addEventListener('input', () => {
      const v = slider.value / 100;
      Player.setVolume(v);
      updateVolumeIcon(v);
    });

    icon.addEventListener('click', () => {
      const state = Player.getState();
      if (state.volume > 0) {
        Player.setVolume(0);
        slider.value = 0;
        updateVolumeIcon(0);
      } else {
        Player.setVolume(0.8);
        slider.value = 80;
        updateVolumeIcon(0.8);
      }
    });
  }

  function updateVolumeIcon(v) {
    const icon = document.getElementById('volume-icon');
    if (v === 0) icon.textContent = '🔇';
    else if (v < 0.4) icon.textContent = '🔈';
    else if (v < 0.7) icon.textContent = '🔉';
    else icon.textContent = '🔊';
  }

  // ── Theme Toggle ──────────────────────────────────────────────────────────

  function wireThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const root = document.documentElement;
    let dark = true;

    btn.addEventListener('click', () => {
      dark = !dark;
      root.setAttribute('data-theme', dark ? 'dark' : 'light');
      btn.textContent = dark ? '☀️' : '🌙';
    });
  }

  // ── Keyboard Shortcuts ────────────────────────────────────────────────────

  function wireKeyboard() {
    document.addEventListener('keydown', e => {
      // Don't intercept when typing in inputs
      if (e.target.tagName === 'INPUT') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (Player.getState().track) Player.togglePlayPause();
          break;
        case 'ArrowRight':
          Player.playNext();
          break;
        case 'ArrowLeft':
          Player.playPrev();
          break;
      }
    });
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  function resetProgress() {
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-thumb').style.left = '0%';
    document.getElementById('time-current').textContent = '0:00';
    document.getElementById('time-total').textContent = '0:00';
  }

  // ── Boot ──────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
