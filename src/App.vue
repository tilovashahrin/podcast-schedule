<template>
  <div class="app-container">
    <div class="left-panel">
      <h1>Podcast Releases</h1>
      <div class="search-section">
        <h2>Search</h2>
        <input v-model="searchQuery" @input="updateSearch" placeholder="Search podcasts..." class="search-bar" />
      </div>
      <div class="podcast-grid" v-if="podcasts.length">
        <div class="podcast-card" v-for="podcast in podcasts" :key="podcast.id" tabindex="0"
          :class="{ 'selected': selectedPodcasts.includes(String(podcast.id)) }"
          @keydown.enter="toggleSelection(podcast.id)" @click="toggleSelection(podcast.id)">
          <img :src=podcast.images?.[0]?.url alt="Podcast Image" />
          <div class="podcast-card-content">
            <p class="podcast-card-title">{{ podcast.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="right-panel" ref="calendarRef" tabindex="0">
      <FullCalendar ref="calendar" :options="calendarOptions" />
    </div>
      <div v-if="modalVisible" class="modal-overlay" @click="closeModal" tabindex="0">
        <div class="modal-content" @click.stop >
          <h2>{{ selectedEvent.title }}</h2>
          <p>{{ selectedEvent.description.length > 1500 ? selectedEvent.description.substring(0, 1500) + '...' :
            selectedEvent.description }}</p>
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
  updatePodcastCards();
});
</script>
