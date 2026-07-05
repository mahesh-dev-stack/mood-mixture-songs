/**
 * api.js — Jamendo API Layer
 * All network calls live here. Returns clean data objects.
 */

const API = (() => {
  /**
   * Fetch tracks from Jamendo for a given mood tag.
   * @param {string} tag  - e.g. 'chill', 'happy', 'energetic'
   * @returns {Promise<Array>} - Array of track objects
   */
  async function fetchTracksByMood(tag) {
    const params = new URLSearchParams({
      client_id: CONFIG.JAMENDO_CLIENT_ID,
      format: 'json',
      tags: tag,
      limit: CONFIG.TRACKS_PER_MOOD,
      audioformat: CONFIG.AUDIO_FORMAT,
      include: 'musicinfo',
      imagesize: 200,
    });

    const url = `${CONFIG.JAMENDO_BASE_URL}/tracks/?${params}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    if (data.headers?.status !== 'success') {
      throw new Error(data.headers?.error_message || 'Jamendo API returned an error');
    }

    return data.results || [];
  }

  return { fetchTracksByMood };
})();
