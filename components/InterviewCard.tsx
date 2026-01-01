"use client";

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "./ui/button";

import { cn, getRandomInterviewCover } from "@/lib/utils";

interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
  feedback?: {
    id: string;
    totalScore: number;
    finalAssessment: string;
    createdAt: string;
  } | null;
  showDelete?: boolean;
}

const InterviewCard = ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
  feedback,
  showDelete = false,
}: InterviewCardProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  const hasCompletedInterview = !!feedback;
  const buttonText = hasCompletedInterview
    ? "Check Feedback"
    : "View Interview";
  const buttonLink = hasCompletedInterview
    ? `/interview/${interviewId}/feedback`
    : `/interview/${interviewId}`;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!interviewId) return;

    const confirmed = confirm(
      "Are you sure you want to delete this interview? This action cannot be undone."
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/interview/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Interview deleted successfully");
        router.refresh();
      } else {
        toast.error(data.message || "Failed to delete interview");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Something went wrong");
      setIsDeleting(false);
    }
  };

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
              badgeColor
            )}
          >
            <p className="badge-text ">{normalizedType}</p>
          </div>

          {showDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="absolute top-2 left-2 p-2 bg-destructive-100 hover:bg-destructive-200 rounded-full transition-colors disabled:opacity-50 z-10"
              title="Delete interview"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          )}

          <Image
            src={getRandomInterviewCover()}
            alt="cover-image"
            width={90}
            height={90}
            className="rounded-full object-fit size-[90px]"
          />

          <h3 className="mt-5 capitalize">{role} Interview</h3>

          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image
                src="/calendar.svg"
                width={22}
                height={22}
                alt="calendar"
              />
              <p>{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p>{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>

          <p className="line-clamp-2 mt-5">
            {feedback?.finalAssessment ||
              "You haven't taken this interview yet. Take it now to improve your skills."}
          </p>
        </div>

        <div className="flex flex-row justify-between items-center">
          {/* Tech Stack Icons - Create a simple wrapper */}
          <div className="flex flex-row">
            {techstack.slice(0, 3).map((tech, index) => (
              <div
                key={tech}
                className={cn(
                  "relative bg-dark-300 rounded-full p-2 flex items-center justify-center",
                  index >= 1 && "-ml-3"
                )}
              >
                <span className="text-xs">
                  {tech.slice(0, 2).toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          <Button className="btn-primary">
            <Link href={buttonLink}>{buttonText}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
