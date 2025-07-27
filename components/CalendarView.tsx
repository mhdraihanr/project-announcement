"use client";

import { useState } from "react";
import type { User, Event } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Users,
  Video,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { defaultEvents } from "@/types/data";

interface CalendarViewProps {
  currentUser: User;
}

export default function CalendarView({ currentUser }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventDialog, setEventDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    type: "meeting",
    attendees: [],
    isPrivate: false,
  });

  const [events, setEvents] = useState<Event[]>(defaultEvents);

  const canViewEvent = (event: Event) => {
    if (!event.isPrivate) return true;
    if (event.department === currentUser.department) return true;
    if (["Administrator", "Senior VP"].includes(currentUser.role?.name || "")) return true;
    return false;
  };

  const canCreateEvent = [
    "Administrator",
    "Senior VP",
    "VP",
    "Officer",
    "Employee",
  ].includes(currentUser.role?.name || "");

  const visibleEvents = events.filter(canViewEvent);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const handleCreateEvent = () => {
    if (newEvent.title && selectedDate) {
      const eventType: Event["type"] = newEvent.type || "meeting";

      const event: Event = {
        id: (events.length + 1).toString(),
        title: newEvent.title,
        description: newEvent.description || "",
        date: selectedDate.toISOString().split("T")[0],
        startTime: newEvent.startTime || "",
        endTime: newEvent.endTime || "",
        location: newEvent.location || "",
        type: eventType,
        organizer: currentUser.name,
        attendees: newEvent.attendees || [],
        department: currentUser.department,
        isPrivate: newEvent.isPrivate || false,
        color: "blue",
      };

      setEvents([...events, event]);
      setNewEvent({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        location: "",
        type: "meeting",
        attendees: [],
        isPrivate: false,
      });
      setEventDialog(false);
      setSelectedDate(null);
    }
  };

  const getEventsForDate = (date: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    return visibleEvents.filter((event) => event.date === dateStr);
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)
    );
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return Users;
      case "presentation":
        return Video;
      case "maintenance":
        return Clock;
      default:
        return Calendar;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800";
      case "presentation":
        return "bg-purple-100 text-purple-800";
      case "maintenance":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const todaysEvents = visibleEvents.filter((event) => {
    const today = new Date().toISOString().split("T")[0];
    return event.date === today;
  });

  const upcomingEvents = visibleEvents
    .filter((event) => new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">
            Manage your schedule and upcoming events
          </p>
        </div>
        {canCreateEvent && (
          <Dialog open={eventDialog} onOpenChange={setEventDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Schedule a new meeting or event
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Event description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="time"
                    placeholder="Start time"
                    value={newEvent.startTime}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, startTime: e.target.value })
                    }
                  />
                  <Input
                    type="time"
                    placeholder="End time"
                    value={newEvent.endTime}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, endTime: e.target.value })
                    }
                  />
                </div>
                <Input
                  placeholder="Location"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={newEvent.type}
                    onValueChange={(value) =>
                      setNewEvent({
                        ...newEvent,
                        type: value as Event["type"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={selectedDate?.toISOString().split("T")[0] || ""}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  />
                </div>
                <Input
                  placeholder="Attendees (comma separated)"
                  value={newEvent.attendees}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      attendees: e.target.value
                        .split(",")
                        .map((name) => name.trim()),
                    })
                  }
                />
              </div>
              <DialogFooter>
                <Button onClick={handleCreateEvent}>Create Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth(-1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth(1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-2 text-center font-medium text-muted-foreground"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                  <div key={`empty-${i}`} className="p-2 h-24"></div>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const date = i + 1;
                  const dateEvents = getEventsForDate(date);
                  const isToday =
                    new Date().getDate() === date &&
                    new Date().getMonth() === currentDate.getMonth() &&
                    new Date().getFullYear() === currentDate.getFullYear();

                  return (
                    <div
                      key={date}
                      className={`p-2 h-24 border rounded-lg cursor-pointer hover:bg-accent ${
                        isToday
                          ? "bg-primary/10 border-primary"
                          : "border-border"
                      }`}
                      onClick={() => {
                        setSelectedDate(
                          new Date(
                            currentDate.getFullYear(),
                            currentDate.getMonth(),
                            date
                          )
                        );
                        if (canCreateEvent) setEventDialog(true);
                      }}
                    >
                      <div
                        className={`font-medium ${
                          isToday ? "text-primary" : ""
                        }`}
                      >
                        {date}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dateEvents.slice(0, 2).map((event) => {
                          const EventIcon = getEventTypeIcon(event.type);
                          return (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded truncate ${getEventTypeColor(
                                event.type
                              )}`}
                              title={`${event.title} - ${event.startTime}`}
                            >
                              <EventIcon className="inline h-3 w-3 mr-1" />
                              {event.title}
                            </div>
                          );
                        })}
                        {dateEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dateEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s Events</CardTitle>
            </CardHeader>
            <CardContent>
              {todaysEvents.length > 0 ? (
                <div className="space-y-3">
                  {todaysEvents.map((event) => {
                    const EventIcon = getEventTypeIcon(event.type);
                    return (
                      <div key={event.id} className="p-3 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <EventIcon className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium text-sm">
                                {event.title}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {event.startTime} - {event.endTime}
                                </span>
                              </div>
                              {event.location && (
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No events scheduled for today
                </p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const EventIcon = getEventTypeIcon(event.type);
                    return (
                      <div key={event.id} className="p-3 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <EventIcon className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium text-sm">
                                {event.title}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(event.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{event.startTime}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No upcoming events
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
