// src/components/Calendar.tsx

import { Heading, Box } from "@chakra-ui/react";
import { GenericPage } from "../../components/ui/generic-page";
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAuth } from "@/context";

import { API_BASE_URL, ENDPOINTS } from "@/api/config"; // Import updated endpoints
import io from "socket.io-client"; // Import Socket.IO client
import api from "@/api";

// Initialize Socket.IO client
const socket = io(API_BASE_URL, {
  auth: {
    token: sessionStorage.getItem("token"), // Pass token for authentication
  },
});

export const Calendar = () => {
  const { state, fetchQueueStatus } = useAuth();
  const [events, setEvents] = useState([]);

  // Fetch events from the API with match count data
  const fetchEvents = async () => {
    try {
      const response = await api.get(ENDPOINTS.CALENDAR.EVENTS);
      const data = response.data;
      const enrichedEvents = data.events.map((event) => ({
        ...event,
        matchCount: state.user?.matchCount?.[event.participantId] || 0,
      }));
      setEvents(enrichedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Handle real-time updates via Socket.IO
  useEffect(() => {
    // Listen for event updates
    socket.on("eventCreated", (newEvent) => {
      setEvents((prev) => [
        ...prev,
        {
          ...newEvent,
          matchCount: state.user?.matchCount?.[newEvent.participantId] || 0,
        },
      ]);
    });

    socket.on("eventUpdated", (updatedEvent) => {
      setEvents((prev) =>
        prev.map((event) =>
          event._id === updatedEvent._id ? updatedEvent : event
        )
      );
    });

    socket.on("eventCanceled", (canceledEventId) => {
      setEvents((prev) =>
        prev.filter((event) => event._id !== canceledEventId)
      );
    });

    socket.on("eventConfirmed", (confirmedEvent) => {
      setEvents((prev) =>
        prev.map((event) =>
          event._id === confirmedEvent._id ? confirmedEvent : event
        )
      );
    });

    // Cleanup on unmount
    return () => {
      socket.off("eventCreated");
      socket.off("eventUpdated");
      socket.off("eventCanceled");
      socket.off("eventConfirmed");
    };
  }, [state.user?.matchCount]);

  // Handle date click with match validation
  const handleDateClick = async (arg) => {
    try {
      // Get current queue status
      await fetchQueueStatus();

      if (state.queueStatus !== "matched" || !state.user?.matches?.length) {
        console.log("No available match or not in matched state");
        return;
      }

      // Get the most recent match (last in matches array)
      const latestMatchId = state.user.matches[state.user.matches.length - 1];

      const response = await api.post(ENDPOINTS.CALENDAR.EVENTS, {
        scheduledTime: arg.dateStr,
        participantId: latestMatchId,
      });

      const newEvent = response.data;
      setEvents((prev) => [
        ...prev,
        {
          ...newEvent,
          matchCount: (state.user?.matchCount?.[latestMatchId] || 0) + 1,
        },
      ]);

      // Refresh user data to get updated matchCount
      await fetchQueueStatus();
    } catch (error) {
      console.error("Booking error:", error);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (state.isAuthenticated) {
      fetchEvents();
      fetchQueueStatus();
    }
  }, [state.isAuthenticated]);

  return (
    <GenericPage>
      <>
        <Heading mb={6}>Schedule a Call</Heading>
        <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events.map((event) => ({
              title: `Meeting (${event.matchCount}x)`,
              start: event.scheduledTime,
              end: new Date(
                new Date(event.scheduledTime).getTime() + 60 * 60 * 1000
              ), // Assuming 1-hour meetings
            }))}
            dateClick={handleDateClick}
            selectable={true}
            editable={true}
            eventColor="#3182CE"
            height="auto"
          />
        </Box>
      </>
    </GenericPage>
  );
};
