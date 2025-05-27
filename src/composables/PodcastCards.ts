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

  //Allow calendar ics downloads
  function generateICSFile() {
    // Get events from your calendar
    const events = createCalendarEvent();

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PodcastCalendar//EN',
      'CALSCALE:GREGORIAN',
    ];

    // Add each event to the ICS file
    events.forEach((event) => {
      const startDate = event.start.toISOString().replace(/-|:|\.\d+/g, '');
      const endDate = event.end.toISOString().replace(/-|:|\.\d+/g, '');

      icsContent.push(
        'BEGIN:VEVENT',
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description}`,
        `UID:${Math.random().toString(36).substring(2)}`, // Unique ID for each event
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    return icsContent.join('\n');
  }

  function downloadICSFile() {
    const icsContent = generateICSFile();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'podcast_schedule.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return {
    searchQuery,
    podcasts,
    selectedPodcasts,
    episodeSchedules,
    createCalendarEvent,
    toggleSelection,
    updateSearch,
    downloadICSFile,
  };
}
