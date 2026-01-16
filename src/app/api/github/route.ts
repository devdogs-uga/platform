import { NextResponse } from "next/server";
import syncLeaderboard from "~/server/github/syncLeaderboard";

export async function GET() {
  try {
    await syncLeaderboard();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return new NextResponse("An unknown error occurred.", { status: 500 });
  }
}
