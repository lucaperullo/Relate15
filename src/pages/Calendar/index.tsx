import { Heading, Box } from "@chakra-ui/react";
import { GenericPage } from "../../components/ui/generic-page";
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAuth } from "@/context";
import { API_BASE_URL, ENDPOINTS } from "@/api/config";

export const Calendar = () => {
  const { state, api, baseUrl, fetchQueueStatus } = useAuth();
  const [events, setEvents] = useState([]);

  // Fetch events from the API with match count data
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${baseUrl}${api.CALENDAR.EVENTS}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      const enrichedEvents = data.events.map((event) => ({
        ...event,
        matchCount: state.user?.matchCount?.[event.matchedUserId] || 0,
      }));

      setEvents(enrichedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Handle date click with match validation
  const handleDateClick = async (arg) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Get current queue status
      await fetchQueueStatus();

      if (state.queueStatus !== "matched" || !state.user?.matches?.length) {
        console.log("No available match or not in matched state");
        return;
      }

      // Get the most recent match (last in matches array)
      const latestMatchId = state.user.matches[state.user.matches.length - 1];

      const response = await fetch(`${baseUrl}${api.CALENDAR.BOOK}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          start: arg.dateStr,
          end: arg.dateStr,
          matchedUserId: latestMatchId,
        }),
      });

      if (!response.ok) throw new Error("Failed to book call");

      const newEvent = await response.json();
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
              start: event.start,
              end: event.end,
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
