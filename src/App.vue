<template>
  <div class="app-container">
    <div class="left-panel">
      <h1>Podcast Releases</h1>
      <div class="search-section">
        <h2 id="search-label">Search</h2>
        <p id="search-desc" class="sr-only">Type to search for podcasts. Results will update as you type.</p>
        <input v-model="searchQuery" @input="updateSearch" placeholder="Search podcasts..." class="search-bar"
          aria-labelledby="search-label" aria-describedby="search-desc" />
      </div>

      <div class="podcast-grid" v-if="podcasts.length || selectedPodcasts.length">
        <!-- Showing selected podcasts first -->
        <div class="podcast-card selected" role="button" v-for="podcast in selectedPodcasts"
          :key="'selected-' + podcast.id" tabindex="0" @click="toggleSelection(podcast.id)"
          @keydown.enter="toggleSelection(podcast.id)" @keydown.space.prevent="toggleSelection(podcast.id)"
          aria-selected="true" aria-pressed="true">
          <img :src="podcast.images?.[0]?.url" :alt="podcast.name + ' podcast cover'" role="img" />
          <div class="podcast-card-content">
            <p class="podcast-card-title">{{ podcast.name }}</p>
          </div>
        </div>

        <!-- Search results -->
        <div class="podcast-card" role="button"
          v-for="podcast in podcasts.filter(p => !selectedPodcasts.some(sp => sp.id === p.id))" :key="podcast.id"
          tabindex="0" @click="toggleSelection(podcast.id)" @keydown.enter="toggleSelection(podcast.id)"
          @keydown.space.prevent="toggleSelection(podcast.id)"
          :aria-selected="selectedPodcasts.some(p => p.id === podcast.id) ? 'true' : 'false'"
          :aria-pressed="selectedPodcasts.some(p => p.id === podcast.id) ? 'true' : 'false'">
          <img :src="podcast.images?.[0]?.url" :alt="podcast.name + ' podcast cover'" role="img" />
          <div class="podcast-card-content">
            <p class="podcast-card-title">{{ podcast.name }}</p>
          </div>
        </div>
      </div>

    </div>
    <div class="right-panel-container">

      <div class="right-panel" ref="calendarRef" tabindex="0" aria-label="Podcast Release Calendar" role="grid"
        aria-live="polite">
        <FullCalendar :options="calendarOptions" />
      </div>

      <button @click="downloadICSFile" class="export-button" :disabled="selectedPodcasts.length === 0"
        aria-label="Export podcast schedule to calendar">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Export to Calendar (.ICS)
      </button>

      <div v-if="modalVisible" class="modal-overlay" @click="closeModal" role="dialog" aria-modal="true" tabindex="0">
        <div class="modal-content" @click.stop>
          <h2>{{ selectedEvent.title }}</h2>
          <p>{{ selectedEvent.description.length > 1500 ? selectedEvent.description.substring(0, 1500) + '...' :
            selectedEvent.description }}</p>
          <button @click="closeModal" aria-label="Close modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import { useCalendar } from './composables/fullCalendar';
import { PodcastCards } from './composables/PodcastCards';
import './style.css';

const { searchQuery, podcasts, selectedPodcasts, createCalendarEvent, toggleSelection, updateSearch, downloadICSFile } = PodcastCards();
const podcastCards = ref<HTMLElement[]>([]);
const calendarRef = ref<HTMLElement | null>(null);
//used for more optimized rendering, runs when any of its values changes
const calendarEvents = computed(() => createCalendarEvent());
const { calendarOptions, modalVisible, selectedEvent, closeModal } = useCalendar(calendarEvents);

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    modalVisible.value = false;
  }
}

function updatePodcastCards() {
  podcastCards.value = Array.from(document.querySelectorAll(".podcast-card"));
}

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

watch(podcasts, async () => {
  //renders a new list of podcasts every time when searchQuery is changed
  updatePodcastCards();
});
</script>
