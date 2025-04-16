import { NextResponse } from "next/server";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join } from "path";
import { promises as fs } from "fs";
import * as chrono from "chrono-node";
import nlp from "compromise";

// Define interfaces
interface Event {
  title: string;
  start: string;
  end: string;
  allDay: boolean;
}

interface Database {
  events: Event[];
}

// Initialize LowDB
const filePath = join(process.cwd(), "public/db.json");
const adapter = new JSONFile<Database>(filePath);
const defaultData: Database = { events: [] };
const db = new Low<Database>(adapter, defaultData);

export async function POST(request: Request) {
  try {
    // Ensure database file exists
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
    await db.read();

    // Parse request body
    const { text }: { text: string; events?: Event[] } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Invalid input: text is required" },
        { status: 400 }
      );
    }

    // Parse date using chrono-node
    const results = chrono.parse(text);
    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: "Could not determine date from your input" },
        { status: 400 }
      );
    }

    const firstResult = results[0];
    const start = firstResult.start?.date();
    let end = firstResult.end?.date();

    if (!start || isNaN(start.getTime())) {
      return NextResponse.json(
        { error: "Invalid start date" },
        { status: 400 }
      );
    }

    // Set default end time (1 hour after start if not specified)
    if (!end || isNaN(end.getTime())) {
      end = new Date(start.getTime() + 3600000);
    }

    const allDay = !firstResult.start?.isCertain("hour");

    // Extract title using NLP
    const doc = nlp(text);
    let title = "New Event";

    const actionPhrase = doc.match("#Verb+ #Noun+").text();
    const nouns = doc.nouns().out("text");

    if (actionPhrase) {
      title = actionPhrase;
    } else if (nouns) {
      title = nouns.split(/\s*,\s*/).find(n => n.length > 1) || nouns;
    } else {
      title = text.split(/\s+/).slice(0, 3).join(" ");
    }

    title = title.trim();
    if (title.length > 50) title = title.substring(0, 47) + "...";

    // Create the new event
    const newEvent: Event = {
      title,
      start: start.toISOString(),
      end: end.toISOString(),
      allDay,
    };

    // 🛠️ Conflict detection (time-based only)
    const conflicts = db.data.events.filter((existingEvent) => {
      const existingStart = new Date(existingEvent.start);
      const existingEnd = new Date(existingEvent.end || existingEvent.start);
      const newStart = new Date(newEvent.start);
      const newEnd = new Date(newEvent.end || newEvent.start);

      return newStart < existingEnd && newEnd > existingStart;
    });

    // Log for debugging
    if (conflicts.length > 0) {
      console.log("Conflict detected:", conflicts);
      return NextResponse.json({
        message: `Time conflict with "${conflicts[0].title}" from ${new Date(conflicts[0].start).toLocaleTimeString()}`,
        conflicts,
        suggestedEvent: newEvent,
      }, { status: 409 });
    }

    // Save event
    db.data.events.push(newEvent);
    await db.write();

    return NextResponse.json({
      event: newEvent,
      message: `Added "${title}" on ${start.toLocaleDateString()}`,
    });

  } catch (error: unknown) {
    console.error("Error in POST:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({
      error: errorMessage,
      suggestion: "Try being more specific (e.g., 'Team meeting Thursday at 2pm')"
    }, { status: 500 });
  }
}
