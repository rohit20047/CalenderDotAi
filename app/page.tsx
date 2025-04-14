import Calendar from "@/components/Calender";

async function getInitialEvents() {
  try {
    console.log("Attempting to fetch events from /api/events...");
    const response = await fetch("http://localhost:3000/api/events", { cache: "no-store" }); // Use absolute URL for debugging
    console.log("Fetch response status:", response.status);
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Fetched data:", data);
    return data.map((e: any) => ({
      id: `${e.start}-${e.title}`,
      title: e.title,
      start: e.start,
      end: e.end,
      allDay: e.allDay,
    }));
  } catch (error) {
    console.error("Error fetching initial events:", error);
    return [];
  }
}

export default async function Home() {
  const initialEvents = await getInitialEvents();
  console.log("Initial events for Calendar:", initialEvents);
  return <Calendar initialEvents={initialEvents} />;
}