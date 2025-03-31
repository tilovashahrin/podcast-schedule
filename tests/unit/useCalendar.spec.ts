import { describe, it, expect, vi } from 'vitest';
import { useCalendar } from '../../src/composables/fullCalendar';
import { ref } from 'vue';

describe('useCalendar composable', () => {
  const mockEvent = [
    {
      start: new Date(),
      end: new Date(),
      title: 'Event',
      description: 'event description',
      backgroundColor: '#ff0000',
      textColor: '#ffffff',
    },
  ];

  it('should initialize with default values', () => {
    const { calendarOptions, modalVisible, selectedEvent } = useCalendar(mockEvent);

    expect(modalVisible.value).toBe(false);
    expect(selectedEvent.value).toEqual({ title: '', description: '' });
    expect(calendarOptions.value.initialView).toBe('dayGridMonth');
    expect(calendarOptions.value.events).toEqual(mockEvent);
  });

  it('should handle event click and show modal with event details', () => {
    const { modalVisible, selectedEvent, calendarOptions } = useCalendar(mockEvent);

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

  it('should handle event click when description is missing', () => {
    const { modalVisible, selectedEvent, calendarOptions } = useCalendar(mockEvent);

    const event = {
      event: {
        title: 'Event Without Description',
        extendedProps: {},
      },
    };

    calendarOptions.value.eventClick(event);

    expect(modalVisible.value).toBe(true);
    expect(selectedEvent.value).toEqual({
      title: 'Event Without Description',
      description: 'No description available.',
    });
  });

  it('should close modal when closeModal is called', () => {
    const { modalVisible, closeModal } = useCalendar(mockEvent);

    //simulate event clicks
    modalVisible.value = true;
    closeModal();
    expect(modalVisible.value).toBe(false);
  });
});
