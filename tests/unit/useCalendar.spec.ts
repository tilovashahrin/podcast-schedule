import { describe, it, expect, vi } from 'vitest';
import { useCalendar } from '../../src/composables/fullCalendar'
import { ref } from 'vue';

describe('useCalendar composable', () => {
  it('should initialize with default values', () => {
    const { calendarOptions, modalVisible, selectedEvent } = useCalendar([]);

    expect(modalVisible.value).toBe(false);
    expect(selectedEvent.value).toEqual({ title: '', description: '' });
    expect(calendarOptions.value.initialView).toBe('dayGridMonth');
  });

  it('should handle event click and show modal with event details', () => {
    const { modalVisible, selectedEvent, calendarOptions } = useCalendar([]);

    //simulate event click
    const event = {
      event: {
        title: 'Test Event',
        extendedProps: {
          description: 'This is a test event',
        },
      },
    };
    // Call handleEventClick directly
    calendarOptions.value.eventClick(event);

    //modal check
    expect(modalVisible.value).toBe(true);

    //event check
    expect(selectedEvent.value).toEqual({
      title: 'Test Event',
      description: 'This is a test event',
    });
  });

  it('should close modal when closeModal is called', () => {
    const { modalVisible, closeModal } = useCalendar([]);

    //simulate event clicks
    modalVisible.value = true;
    closeModal();
    expect(modalVisible.value).toBe(false);
  });
});
