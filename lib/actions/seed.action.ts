"use server";

import { db } from "@/firebase/admin";

export async function seedTemplateInterviews() {
  const templateInterviews = [
    {
      userId: "system",
      role: "Frontend Developer",
      type: "Technical",
      techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
      level: "Junior",
      questions: [
        "What is React and why is it used?",
        "Explain the virtual DOM",
        "What are React hooks?",
        "Difference between state and props",
        "What is TypeScript and its benefits?",
      ],
      finalized: true,
      createdAt: new Date().toISOString(),
    },
    {
      userId: "system",
      role: "Full Stack Developer",
      type: "Mixed",
      techstack: ["Node.js", "Express", "MongoDB", "React"],
      level: "Senior",
      questions: [
        "Explain the Node.js event loop",
        "How do you handle authentication in Express?",
        "What are indexes in MongoDB?",
        "Explain RESTful API design principles",
        "How do you optimize React performance?",
      ],
      finalized: true,
      createdAt: new Date().toISOString(),
    },
    {
      userId: "system",
      role: "Backend Developer",
      type: "Technical",
      techstack: ["Python", "Django", "PostgreSQL"],
      level: "Mid",
      questions: [
        "Explain Django ORM",
        "How do you handle database migrations?",
        "What is the difference between SQL and NoSQL?",
        "How do you implement caching strategies?",
        "Explain REST vs GraphQL",
      ],
      finalized: true,
      createdAt: new Date().toISOString(),
    },
    {
      userId: "system",
      role: "DevOps Engineer",
      type: "Technical",
      techstack: ["Docker", "Kubernetes", "AWS", "Jenkins"],
      level: "Mid",
      questions: [
        "What is containerization and why use Docker?",
        "Explain CI/CD pipeline",
        "What is Kubernetes and its key components?",
        "How do you handle infrastructure as code?",
        "Explain monitoring and logging strategies",
      ],
      finalized: true,
      createdAt: new Date().toISOString(),
    },
    {
      userId: "system",
      role: "Product Manager",
      type: "Behavioral",
      techstack: ["Agile", "Scrum", "Product Strategy"],
      level: "Senior",
      questions: [
        "How do you prioritize product features?",
        "Describe your experience with stakeholder management",
        "How do you handle conflicting requirements?",
        "What metrics do you use to measure product success?",
        "Tell me about a time you had to pivot on a product decision",
      ],
      finalized: true,
      createdAt: new Date().toISOString(),
    },
  ];

  try {
    const batch = db.batch();

    for (const interview of templateInterviews) {
      const docRef = db.collection("interviews").doc();
      batch.set(docRef, interview);
    }

    await batch.commit();

    console.log("Template interviews seeded successfully!");
    return { success: true, message: "Seeded template interviews" };
  } catch (error) {
    console.error("Error seeding interviews:", error);
    return { success: false, error };
  }
}
