"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatDate, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

interface CalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  allDay?: boolean;
}

interface CalendarProps {
  initialEvents: CalendarEvent[];
}

const Calendar: React.FC<CalendarProps> = ({ initialEvents }) => {
  const [currentEvents, setCurrentEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const [aiInput, setAiInput] = useState<string>("");
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().removeAllEvents();
      currentEvents.forEach(event => {
        calendarRef.current?.getApi().addEvent(event);
      });
    }
  }, [currentEvents]);

  const handleDateClick = (selected: DateSelectArg) => {
    setSelectedDate(selected);
    setIsDialogOpen(true);
  };

  const handleEventClick = async (selected: EventClickArg) => {
    if (window.confirm(`Delete "${selected.event.title}"?`)) {
      try {
        await axios.delete("/api/events", { data: { id: selected.event.id } });
        setCurrentEvents(prev => prev.filter(event => event.id !== selected.event.id));
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventTitle && selectedDate && calendarRef.current) {
      const newEvent: CalendarEvent = {
        id: uuidv4(),
        title: newEventTitle,
        start: selectedDate.start,
        end: selectedDate.end,
        allDay: selectedDate.allDay,
      };

      try {
        const response = await axios.post("/api/events", newEvent);
        setCurrentEvents(prev => [...prev, response.data]);
        setNewEventTitle("");
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Error saving event:", error);
      }
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiFeedback(""); // Clear previous feedback
    if (!aiInput) {
      setAiFeedback("⚠️ Please describe your event.");
      return;
    }

    try {
      const response = await axios.post("/api/parse", {
        text: aiInput,
        events: currentEvents,
      });

      const newEvent = {
        ...response.data.event,
        id: response.data.event.id || uuidv4(),
      };

      setCurrentEvents(prev => [...prev, newEvent]);
      setAiFeedback(response.data.message || "✅ Event added successfully!");
      setAiInput("");
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const { message, suggestedEvent } = error.response.data;
        setAiFeedback(`⛔ Conflict: ${message}\nSuggested: "${suggestedEvent.title}"`);
      } else {
        setAiFeedback("❌ Failed to create event. Please try again.");
      }
      console.error("AI error:", error);
    }
  };

  return (
    <div className="flex w-full px-10 justify-start items-start gap-8">
      {/* Left sidebar */}
      <div className="w-3/12">
        <div className="py-10 text-2xl font-extrabold px-7">Calendar Events</div>
        <form onSubmit={handleAiSubmit} className="mb-4">
          <input
            type="text"
            placeholder="e.g., Schedule a meeting next Tuesday at 3 PM"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            className="border border-gray-200 p-3 rounded-md text-lg w-full"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-3 mt-2 rounded-md w-full"
          >
            Add with AI
          </button>
        </form>
        {aiFeedback && (
          <div className="text-sm text-gray-800 whitespace-pre-line p-2 border rounded bg-gray-100">
            {aiFeedback}
          </div>
        )}
        <ul className="space-y-4 mt-4">
          {currentEvents.length === 0 ? (
            <div className="italic text-center text-gray-400">No Events Present</div>
          ) : (
            currentEvents.map((event) => (
              <li
                className="border border-gray-200 shadow px-4 py-2 rounded-md text-blue-800"
                key={event.id}
              >
                {event.title}
                <br />
                <label className="text-slate-950">
                  {formatDate(event.start, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </label>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Calendar */}
      <div className="w-9/12 mt-8">
        <FullCalendar
          ref={calendarRef}
          height={"85vh"}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          select={handleDateClick}
          eventClick={handleEventClick}
          events={currentEvents}
        />
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event Details</DialogTitle>
          </DialogHeader>
          <form className="space-x-5 mb-4" onSubmit={handleAddEvent}>
            <input
              type="text"
              placeholder="Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-md text-lg"
            />
            <button
              className="bg-green-500 text-white p-3 mt-5 rounded-md"
              type="submit"
            >
              Add
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
