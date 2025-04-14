import { NextResponse } from "next/server";
import { Low } from "lowdb"; // Main database class
import { JSONFile } from "lowdb/node"; // File system adapter
import { join } from "path";
import { promises as fs } from "fs"; // Asynchronous file system methods

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

// Initialize LowDB with a file in the public directory
const filePath = join(process.cwd(), "public/db.json");
const adapter = new JSONFile<Database>(filePath);
const defaultData: Database = { events: [] }; // Default data
const db = new Low<Database>(adapter, defaultData); // Provide defaultData

export async function GET() {
  try {
    // Check if db.json exists asynchronously
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
    await db.read(); // Load data from db.json
    return NextResponse.json(db.data.events);
  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
    await db.read();
    const { title, start, end, allDay }: { title: string; start: string; end: string; allDay: boolean } = await request.json();
    const newEvent: Event = { title, start, end, allDay };
    db.data.events.push(newEvent);
    await db.write();
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
    await db.read();
    const { id }: { id: string } = await request.json();
    db.data.events = db.data.events.filter((e) => `${e.start}-${e.title}` !== id);
    await db.write();
    return NextResponse.json({ message: "Event deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}