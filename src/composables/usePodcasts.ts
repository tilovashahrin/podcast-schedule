import { ref, watch, computed } from 'vue';
import axios from 'axios';

export function usePodcasts() {
  const query = ref("");
  const podcasts = ref([]);
  const accessToken = ref("");
  const colorMap = ref<{ [key: string]: string }>({});
  const selectedPodcasts = ref<string[]>([]);
  const episodeSchedules = ref<{ id: string; date: string; title: string, description: string }[]>([]);

  function generateColor(id: string) {
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360; // Cycle through 360° in HSL for distinct colors
    return `hsl(${hue}, 70%, 50%)`; 
  }
  
  function assignColor(id: string) {
    if (!colorMap.value[id]) {
      colorMap.value[id] = generateColor(id);
    }
  }
  
  async function fetchSpotifyToken() {
    try {
      const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({ grant_type: "client_credentials" }),
        {
          headers: {
            Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      accessToken.value = response.data.access_token;
    } catch (error) {
      console.error("Error fetching Spotify token:", error);
    }
  }

  async function fetchPodcasts() {
    if (!query.value) {
      podcasts.value = [];
      return;
    }
    if (!accessToken.value) await fetchSpotifyToken();

    try {
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${accessToken.value}` },
        params: { q: query.value, type: "show", limit: 20 },
      });
      podcasts.value = response.data.shows.items;
    } catch (error) {
      console.error("Error fetching podcasts:", error);
    }
  }

  async function fetchEpisodes(podcastId: string) {
    if (!accessToken.value) await fetchSpotifyToken();
  
    try {
      const response = await axios.get(`https://api.spotify.com/v1/shows/${podcastId}/episodes`, {
        headers: { Authorization: `Bearer ${accessToken.value}` },
        params: { limit: 20 },
      });
      
      const episodes = response.data.items.map((episode: any) => ({
        id: podcastId,
        date: episode.release_date,
        title: episode.name,
        description: episode.description || "No description available.",
      }));
  
      episodeSchedules.value = [...episodeSchedules.value, ...episodes];
    } catch (error) {
      console.error("Error fetching episodes:", error);
    }
  }  

  function toggleSelection(id: string) {
    if (selectedPodcasts.value.includes(id)) {
      selectedPodcasts.value = selectedPodcasts.value.filter(podcastId => podcastId !== id);
      episodeSchedules.value = episodeSchedules.value.filter(schedule => schedule.id !== id);
      delete colorMap.value[id];
    } else {
      assignColor(id);
      selectedPodcasts.value.push(id);
      fetchEpisodes(id);
    }
  }

  const calendarEvents = computed(() => {
    return episodeSchedules.value.map((schedule) => ({
      start: new Date(schedule.date),
      end: new Date(schedule.date),
      title: schedule.title,
      description: schedule.description || "No description available.",
      class: 'podcast-event',
      backgroundColor: colorMap.value[schedule.id] || "#000000",
      textColor: "#ffffff",
    }));
  });  

  watch(episodeSchedules, (newSchedules) => {
    console.log("Updated episode schedules:", newSchedules);
  }, { deep: true });

  watch(query, fetchPodcasts);

  return {
    query,
    podcasts,
    selectedPodcasts,
    episodeSchedules,
    calendarEvents,
    toggleSelection,
  };
}
