import { ref } from 'vue';
import axios from 'axios';

interface Podcast {
  id: string;
  name: string;
  images: { url: string }[];
}

export function PodcastCards() {
  const searchQuery = ref<string>("");
  const podcasts = ref<Podcast[]>([]);
  const accessToken = ref("");
  const colorMap = ref<{ [key: string]: string }>({});
  const selectedPodcasts = ref<Podcast[]>([]);
  const episodeSchedules = ref<{ id: string; date: string; title: string, description: string }[]>([]);
  let lastAssignedIndex = 0;

  //api call and fetching podcast info
  async function getAuthToken() {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({ grant_type: "client_credentials" }),
        {
          headers: {
            Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          },
        }
      );
      accessToken.value = response.data.access_token;
    } catch (error) {
      console.error(error);
    }
  }

  //fetches podcasts based on search query
  async function getPodcasts() {
    if (!searchQuery.value) {
      podcasts.value = [];
      return;
    }
    if (!accessToken.value) {
      await getAuthToken();
    }

    try {
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${accessToken.value}` },
        params: { q: searchQuery.value, type: "show", limit: 20 },
      });

      if (response.data?.shows?.items) {
        const newPodcasts = response.data.shows.items;
        podcasts.value = newPodcasts.map((p: Podcast) => {
          const selected = selectedPodcasts.value.find(sp => sp.id === p.id);
          return selected ? selected : p; 
        });
      } else {
        console.warn("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  //fetches episodes for a selected podcast
  async function getEpisodes(podcastId: string) {
    if (!accessToken.value) {
      await getAuthToken();
    }

    try {
      const response = await axios.get(`https://api.spotify.com/v1/shows/${podcastId}/episodes`, {
        headers: { Authorization: `Bearer ${accessToken.value}` },
        params: { limit: 20 },
      });

      if (!response.data || !response.data.items) {
        console.warn("unexpected api response format:", response.data);
        return;
      }
      
      const episodes = response.data.items.map((episode: any) => ({
        id: podcastId,
        date: episode.release_date,
        title: episode.name,
        description: episode.description || "No description provided.",
      }));

      episodeSchedules.value = [...episodeSchedules.value, ...episodes];

    } catch (error) {
      console.error(error);
    }
  }

  //assigns a color to each podcast (max 5 colors)
  function assignColor(id: string) {
    if (lastAssignedIndex >= 5) lastAssignedIndex = 0;
    if (!colorMap.value[id]) {
      const colors = ["#0077B6", "#5A189A", "#9D0208", "#2A6F64", "#9C4408"];
      colorMap.value[id] = colors[lastAssignedIndex];
      lastAssignedIndex += 1;
    }
  }

  //selects or deselects a podcast
  function toggleSelection(id: string) {
    const podcast = podcasts.value.find((p) => p.id === id || selectedPodcasts.value.find((p) => p.id === id));
    if (!podcast) return;
    
    //checks if podcast is already selected
    const isSelected = selectedPodcasts.value.some(p => p.id === id);
    if (isSelected) {
      //removes from selected list & episodes list
      selectedPodcasts.value = selectedPodcasts.value.filter(p => p.id !== id);
      episodeSchedules.value = episodeSchedules.value.filter(schedule => schedule.id !== id);
    } else {
      if (selectedPodcasts.value.length == 5) {
        alert("You can only select up to 5 podcasts.");
        return;
      }
  
      selectedPodcasts.value.push(podcast);
      assignColor(id);
      getEpisodes(id);
    }
  }

  //creates podcast episode events for the calendar
  function createCalendarEvent() {
    return episodeSchedules.value.map((schedule) => {
      const podcastDetails = selectedPodcasts.value.find((p) => p.id === schedule.id);
      return {
        start: new Date(schedule.date),
        end: new Date(schedule.date),
        title: `${podcastDetails?.name} - ${schedule.title}`,
        description: schedule.description || "No description available.",
        class: 'podcast-event',
        backgroundColor: colorMap.value[schedule.id] || "#000000",
        textColor: "#ffffff",
      };
    });
  }

  //updates search query when user types
  function updateSearch(event: Event) {
    const target = event.target as HTMLInputElement; 
    searchQuery.value = target.value; 
    getPodcasts();
  }

  return {
    searchQuery,
    podcasts,
    selectedPodcasts,
    episodeSchedules,
    createCalendarEvent,
    toggleSelection,
    updateSearch,
  };
}
