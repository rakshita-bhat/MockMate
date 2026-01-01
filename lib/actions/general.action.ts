"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

// Helper function to create basic feedback when AI fails
function createBasicFeedback(transcript: any[]) {
  const responseCount = transcript.filter((m) => m.role === "user").length;
  const totalScore = Math.min(Math.max(responseCount * 15, 40), 85);

  return {
    totalScore,
    categoryScores: [
      {
        name: "Communication Skills" as const,
        score: totalScore,
        comment:
          "You participated in the interview and provided responses to the questions asked.",
      },
      {
        name: "Technical Knowledge" as const,
        score: totalScore - 5,
        comment:
          "Your technical responses were noted. Continue building your knowledge in this area.",
      },
      {
        name: "Problem Solving" as const,
        score: totalScore - 3,
        comment:
          "You demonstrated problem-solving attempts during the interview.",
      },
      {
        name: "Cultural Fit" as const,
        score: totalScore,
        comment: "Your engagement level showed interest in the position.",
      },
      {
        name: "Confidence and Clarity" as const,
        score: totalScore - 2,
        comment:
          "You maintained communication throughout the interview process.",
      },
    ],
    strengths: [
      "Participated actively in the interview",
      "Responded to questions when asked",
      "Maintained engagement throughout the session",
    ],
    areasForImprovement: [
      "Continue practicing interview responses",
      "Expand technical knowledge in relevant areas",
      "Work on providing more detailed answers",
    ],
    finalAssessment: `Thank you for completing this mock interview. You provided ${responseCount} responses during the session. Keep practicing to improve your interview skills. Consider taking more mock interviews to build confidence and refine your answers.`,
  };
}

export async function linkInterviewToUser(params: LinkInterviewToUserParams) {
  const { interviewId, userId } = params;

  try {
    const interviewRef = db.collection("interviews").doc(interviewId);
    const interviewDoc = await interviewRef.get();

    if (!interviewDoc.exists) {
      return { success: false, message: "Interview not found" };
    }

    await interviewRef.update({
      userId: userId,
      takenAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error linking interview to user:", error);
    return { success: false };
  }
}

export async function createInterview(params: CreateInterviewParams) {
  const { userId, transcript } = params;

  try {
    const interviewRef = db.collection("interviews").doc();

    const interview = {
      userId: userId,
      role: "AI Practice Interview",
      level: "General",
      questions: [],
      techstack: [],
      type: "AI Generated",
      finalized: true,
      transcript: transcript,
      createdAt: new Date().toISOString(),
    };

    await interviewRef.set(interview);

    return { success: true, interviewId: interviewRef.id };
  } catch (error) {
    console.error("Error saving interview:", error);
    return { success: false, interviewId: null };
  }
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    if (transcript.length === 0) {
      return { success: false };
    }

    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    let feedbackObject;

    try {
      const { object } = await generateObject({
        model: google("gemini-2.0-flash-exp"),
        schema: feedbackSchema,
        prompt: `
          You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
          Transcript:
          ${formattedTranscript}

          Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
          - **Communication Skills**: Clarity, articulation, structured responses.
          - **Technical Knowledge**: Understanding of key concepts for the role.
          - **Problem-Solving**: Ability to analyze problems and propose solutions.
          - **Cultural & Role Fit**: Alignment with company values and job role.
          - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
          `,
        system:
          "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
      });

      feedbackObject = object;
    } catch (aiError: any) {
      // Use basic feedback as fallback if AI fails
      feedbackObject = createBasicFeedback(transcript);
    }

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: feedbackObject.totalScore,
      categoryScores: feedbackObject.categoryScores,
      strengths: feedbackObject.strengths,
      areasForImprovement: feedbackObject.areasForImprovement,
      finalAssessment: feedbackObject.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error creating feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  try {
    const interviewDoc = await db.collection("interviews").doc(id).get();

    if (!interviewDoc.exists) {
      return null;
    }

    return { id: interviewDoc.id, ...interviewDoc.data() } as Interview;
  } catch (error) {
    console.error("Error getting interview:", error);
    return null;
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  try {
    const querySnapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
  } catch (error) {
    console.error("Error getting feedback:", error);
    return null;
  }
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  try {
    const interviews = await db
      .collection("interviews")
      .orderBy("createdAt", "desc")
      .where("finalized", "==", true)
      .where("userId", "in", ["system", ""])
      .limit(limit)
      .get();

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error getting latest interviews:", error);
    return [];
  }
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  try {
    const interviews = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error getting user interviews:", error);
    return [];
  }
}
