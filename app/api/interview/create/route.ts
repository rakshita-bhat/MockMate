import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, auth } from "@/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    if (!decodedClaims) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { role, level, type } = await request.json();

    if (!role) {
      return NextResponse.json(
        { success: false, message: "Role is required" },
        { status: 400 }
      );
    }

    const interviewRef = db.collection("interviews").doc();

    const interview = {
      userId: decodedClaims.uid,
      role: role,
      level: level || "Mid",
      type: type || "Mixed",
      techstack: [],
      questions: [],
      finalized: true,
      createdAt: new Date().toISOString(),
    };

    await interviewRef.set(interview);

    return NextResponse.json({
      success: true,
      interviewId: interviewRef.id,
    });
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
