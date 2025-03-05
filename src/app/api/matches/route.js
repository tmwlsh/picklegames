import { NextResponse } from "next/server";

let matchDataStore = {}; // Temporary in-memory storage (restarts when server restarts)

// Handle saving match data
export async function POST(req) {
  const { id, games } = await req.json();
  matchDataStore[id] = games;
  return NextResponse.json({ success: true, id });
}

// Handle fetching match data
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || !matchDataStore[id]) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  return NextResponse.json(matchDataStore[id]);
}
