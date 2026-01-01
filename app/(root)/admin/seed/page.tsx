"use client";

import { useState } from "react";
import { seedTemplateInterviews } from "@/lib/actions/seed.action";
import { Button } from "@/components/ui/button";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeed = async () => {
    setLoading(true);
    const result = await seedTemplateInterviews();
    
    if (result.success) {
      setMessage("✅ Template interviews seeded successfully!");
    } else {
      setMessage("❌ Error seeding interviews");
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-3xl font-bold">Seed Template Interviews</h1>
      <p className="text-center max-w-md">
        Click the button below to add practice interview templates to the database.
        These will appear in the "Take Interviews" section.
      </p>
      
      <Button 
        onClick={handleSeed} 
        disabled={loading}
        className="btn-primary"
      >
        {loading ? "Seeding..." : "Seed Interviews"}
      </Button>

      {message && (
        <p className="text-lg font-semibold">{message}</p>
      )}
    </div>
  );
}