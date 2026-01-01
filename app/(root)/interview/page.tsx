"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Page = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: "",
    level: "Mid",
    type: "Mixed",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.role.trim()) {
      toast.error("Please enter a job role");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/interview/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success && data.interviewId) {
        toast.success("Interview created! Starting now...");
        router.push(`/interview/${data.interviewId}`);
      } else {
        toast.error("Failed to create interview");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error("Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="mb-8">Start a New Interview</h3>

      <div className="card-border">
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-light-100">
                Job Role *
              </Label>
              <Input
                id="role"
                type="text"
                placeholder="e.g., Software Developer, AI Engineer, Product Manager"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="bg-dark-200 rounded-full min-h-12 px-5"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level" className="text-light-100">
                Experience Level
              </Label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
                className="w-full bg-dark-200 rounded-full min-h-12 px-5 text-white border border-input outline-none focus:border-ring"
                disabled={isLoading}
              >
                <option value="Junior">Junior (0-2 years)</option>
                <option value="Mid">Mid-level (2-5 years)</option>
                <option value="Senior">Senior (5+ years)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-light-100">
                Interview Type
              </Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full bg-dark-200 rounded-full min-h-12 px-5 text-white border border-input outline-none focus:border-ring"
                disabled={isLoading}
              >
                <option value="Mixed">Mixed (Behavioral + Technical)</option>
                <option value="Technical">Technical</option>
                <option value="Behavioral">Behavioral</option>
              </select>
            </div>

            <Button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating Interview..." : "Start Interview"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
