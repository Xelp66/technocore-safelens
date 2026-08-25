import { NextRequest, NextResponse } from "next/server";

const ROOM_NAME_PATTERN = /^[a-z0-9][a-z0-9_-]{0,47}$/;

export async function GET(request: NextRequest) {
  const roomName = request.nextUrl.searchParams
    .get("name")
    ?.trim()
    .toLowerCase();

  if (!roomName || !ROOM_NAME_PATTERN.test(roomName)) {
    return NextResponse.json(
      { error: "Invalid Technocore room name." },
      { status: 400 },
    );
  }

  try {
    const technocoreResponse = await fetch(
      `https://technocore.chat/r/${encodeURIComponent(
        roomName,
      )}?format=json&limit=50`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!technocoreResponse.ok) {
      return NextResponse.json(
        {
          error: `Technocore returned status ${technocoreResponse.status}.`,
        },
        {
          status: technocoreResponse.status,
        },
      );
    }

    const roomData = await technocoreResponse.json();

    return NextResponse.json({
      room: roomName,
      data: roomData,
    });
  } catch (error) {
    console.error("Technocore request failed:", error);

    return NextResponse.json(
      { error: "Could not reach Technocore." },
      { status: 502 },
    );
  }
}