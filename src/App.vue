<template>
  <div class="app-container">
    <!-- Left Panel (Search Podcasts)-->
    <div class="left-panel">
      <h1>Podcast Releases</h1>
      <div class="search-section">
        <h2>Search</h2>
        <input v-model="query" placeholder="Search podcasts..." class="search-bar" />
      </div>
      <div class="podcast-grid" v-if="podcasts.length">
        <div class="podcast-card" v-for="podcast in podcasts" :key="podcast.id" tabindex="0"
          :class="{ 'selected': selectedPodcasts.includes(String(podcast.id)) }"
          @keydown.enter="toggleSelection(podcast.id)" @click="toggleSelection(podcast.id)"
          ref="podcastCard">
          <img :src="podcast.images[0]?.url" alt="Podcast Image" />
          <div class="podcast-card-content">
            <p class="podcast-card-title">{{ podcast.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel (Calendar) -->
    <div class="right-panel" ref="calendarRef" tabindex="0">
      <FullCalendar ref="calendar" :options="calendarOptions" />
    </div>

    <!-- Modal for Podcast Details -->
    <transition name="fade">
      <div v-if="modalVisible" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h2>{{ selectedEvent.title }}</h2>
          <p>{{ selectedEvent.description }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction';
import { usePodcasts } from './composables/usePodcasts';
import './style.css';

const { query, podcasts, selectedPodcasts, calendarEvents, toggleSelection } = usePodcasts();
const modalVisible = ref(false);
const selectedEvent = ref<{ title: string; description: string }>({ title: '', description: '' });
const podcastCards = ref<HTMLElement[]>([]);
const calendarRef = ref<HTMLElement | null>(null);

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek",
  },
  height: "auto",
  slotMinTime: "12:00:00",
  slotMaxTime: "23:00:00",
  events: calendarEvents,
  eventClick: handleEventClick,
  editable: false,
  selectable: true,
  eventDidMount: (info) => {
    info.el.setAttribute("tabindex", "0");
  },
});

function handleEventClick(info: any) {
  selectedEvent.value = { title: info.event.title, description: info.event.extendedProps.description };
  modalVisible.value = true;
}

function closeModal() {
  modalVisible.value = false;
}

function handleKeydown(event: KeyboardEvent) {
  const focusedElement = document.activeElement as HTMLElement;
  const podcastIndex = podcastCards.value.indexOf(focusedElement);
  const focusableElements = calendarRef.value?.querySelectorAll<HTMLElement>(
    'button, [tabindex]:not([tabindex="-1"])'
  );
  const calendarElements = focusableElements ? Array.from(focusableElements) : [];
  const calendarIndex = calendarElements.indexOf(focusedElement);

  console.log("Focused Element:", focusedElement);
  console.log("Podcast Index:", podcastIndex);
  console.log("Calendar Index:", calendarIndex);

  if (event.key === "Escape") {
    modalVisible.value = false;
  } else if (event.key === "ArrowRight") {
    if (podcastIndex !== -1 && podcastIndex < podcastCards.value.length - 1) {
      podcastCards.value[podcastIndex + 1].focus();
    } else if (podcastIndex === podcastCards.value.length - 1 && calendarElements.length > 0) {
      // Move focus to the first focusable element in the calendar
      calendarElements[0].focus();
    } else if (calendarIndex !== -1 && calendarIndex < calendarElements.length - 1) {
      // Move focus within calendar elements
      calendarElements[calendarIndex + 1].focus();
    }
  } else if (event.key === "ArrowLeft") {
    if (calendarIndex > 0) {
      // Move back within the calendar
      calendarElements[calendarIndex - 1].focus();
    } else if (calendarIndex === 0 && podcastCards.value.length > 0) {
      // Move focus back to the last podcast card
      podcastCards.value[podcastCards.value.length - 1].focus();
    } else if (podcastIndex > 0) {
      podcastCards.value[podcastIndex - 1].focus();
    }
  }
}

function updatePodcastCards() {
  podcastCards.value = Array.from(document.querySelectorAll(".podcast-card"));
}

onMounted(() => {
  updatePodcastCards();
  document.addEventListener("keydown", handleKeydown);
});

watch(podcasts, async () => {
  await nextTick();
  updatePodcastCards();
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>
