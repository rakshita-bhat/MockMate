import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, auth } from "@/firebase/admin";

export async function DELETE(request: NextRequest) {
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

    const { interviewId } = await request.json();

    if (!interviewId) {
      return NextResponse.json(
        { success: false, message: "Interview ID is required" },
        { status: 400 }
      );
    }

    const interviewDoc = await db
      .collection("interviews")
      .doc(interviewId)
      .get();

    if (!interviewDoc.exists) {
      return NextResponse.json(
        { success: false, message: "Interview not found" },
        { status: 404 }
      );
    }

    const interviewData = interviewDoc.data();

    if (interviewData?.userId !== decodedClaims.uid) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete this interview" },
        { status: 403 }
      );
    }

    const feedbackSnapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", decodedClaims.uid)
      .get();

    const batch = db.batch();

    feedbackSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.delete(db.collection("interviews").doc(interviewId));

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting interview:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
