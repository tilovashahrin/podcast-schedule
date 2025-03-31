import { ref } from 'vue';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

export function useCalendar(events: any) {
  const modalVisible = ref(false);
  const selectedEvent = ref<{ title: string; description: string }>({ title: '', description: '' });

  //creating calendar
  const calendarOptions = ref({
    plugins: [dayGridPlugin, timeGridPlugin],
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek",
    },
    height: "auto",
    slotMinTime: "12:00:00",
    slotMaxTime: "23:00:00",
    events,
    eventClick: handleEventClick,
    editable: false,
    selectable: true,
    allDaySlot: false,
  });

  //opening modal when event is clicked
  function handleEventClick(info: any) {
    const description = info.event.extendedProps?.description || "No description available.";
    selectedEvent.value = { title: info.event.title, description };
    modalVisible.value = true;
  }

  function closeModal() {
    modalVisible.value = false;
  }

  return {
    calendarOptions,
    modalVisible,
    selectedEvent,
    closeModal,
  };
}
