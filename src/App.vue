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

      <div class="podcast-grid" v-if="podcasts.length">
        <div class="podcast-card" role="button" v-for="podcast in podcasts" :key="podcast.id" tabindex="0"
          :class="{ 'selected': selectedPodcasts.some(p => p.id === podcast.id) }"
          @keydown.enter="toggleSelection(podcast.id)" @keydown.space.prevent="toggleSelection(podcast.id)"
          @click="toggleSelection(podcast.id)"
          :aria-selected="selectedPodcasts.some(p => p.id === podcast.id) ? 'true' : 'false'"
          :aria-pressed="selectedPodcasts.some(p => p.id === podcast.id) ? 'true' : 'false'">
          <img :src="podcast.images?.[0]?.url" :alt="podcast.name + ' podcast cover'" role="img" />
          <div class="podcast-card-content">
            <p class="podcast-card-title">{{ podcast.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="right-panel" ref="calendarRef" tabindex="0" aria-label="Podcast Release Calendar" role="grid" aria-live="polite">
      <FullCalendar :options="calendarOptions" />
    </div>
    <div v-if="modalVisible" class="modal-overlay" @click="closeModal" role="dialog" aria-modal="true" tabindex="0" >
      <div class="modal-content" @click.stop>
        <h2>{{ selectedEvent.title }}</h2>
        <p>{{ selectedEvent.description.length > 1500 ? selectedEvent.description.substring(0, 1500) + '...' :
          selectedEvent.description }}</p>
        <button @click="closeModal" aria-label="Close modal">Close</button>
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

const { searchQuery, podcasts, selectedPodcasts, createCalendarEvent, toggleSelection, updateSearch } = PodcastCards();
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
