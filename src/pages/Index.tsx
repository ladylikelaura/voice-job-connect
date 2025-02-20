
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
}

const sampleJobs: Job[] = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechCorp",
    location: "Remote",
    type: "Full-time",
  },
  {
    id: 2,
    title: "UX Designer",
    company: "DesignStudio",
    location: "New York, NY",
    type: "Contract",
  },
  {
    id: 3,
    title: "Product Manager",
    company: "StartupInc",
    location: "San Francisco, CA",
    type: "Full-time",
  },
];

const Index = () => {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
    toast(isVoiceActive ? "Voice interface disabled" : "Voice interface enabled", {
      position: "bottom-center",
    });
  };

  const filteredJobs = sampleJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">VoiceJobConnect</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleVoice}
            className={`rounded-full transition-all duration-300 ${
              isVoiceActive ? "voice-active" : ""
            }`}
            aria-label={isVoiceActive ? "Disable voice interface" : "Enable voice interface"}
          >
            {isVoiceActive ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>
        </div>
        <div className="relative">
          <input
            type="search"
            placeholder="Search jobs..."
            className="w-full p-4 rounded-lg border bg-card shadow-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search jobs"
          />
        </div>
      </header>

      <main className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="job-card animate-slide-in">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
                <p className="text-muted-foreground mb-1">{job.company}</p>
                <p className="text-sm text-muted-foreground">{job.location}</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground">
                {job.type}
              </span>
            </div>
            <div className="mt-4">
              <Button variant="secondary" className="mr-2">
                Apply Now
              </Button>
              <Button variant="outline">Save Job</Button>
            </div>
          </Card>
        ))}
      </main>
    </div>
  );
};

export default Index;
