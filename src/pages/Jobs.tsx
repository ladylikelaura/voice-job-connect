
import { ArrowLeft, Briefcase, Bookmark, Clock, UserRound, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const jobListings = [
  {
    title: "Software Engineer",
    type: "Full-time",
    location: "San Francisco",
    description: "Join a leading tech company in the heart of Silicon Valley.",
  },
  {
    title: "Marketing Specialist",
    type: "Remote, Flexible",
    location: "",
    description: "Utilize your creative skills to drive marketing initiatives.",
  },
  {
    title: "Data Analyst",
    type: "Part-time",
    location: "New York City",
    description: "Analyze data trends for a dynamic startup.",
  },
];

export default function Jobs() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const readJobDescription = async (job: typeof jobListings[0]) => {
    const jobText = `${job.title}. ${job.type}${job.location ? `, located in ${job.location}` : ''}. ${job.description}`;
    
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: jobText
        }
      });

      if (error) throw error;

      if (data.audio) {
        if (audioElement) {
          audioElement.pause();
        }
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        setAudioElement(audio);
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setIsPlaying(false);
          toast.error("Error playing audio");
        };
        await audio.play();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to convert text to speech");
    }
  };

  const toggleScreenReader = () => {
    setScreenReaderEnabled(!screenReaderEnabled);
    if (!screenReaderEnabled) {
      toast.success("Screen reader enabled");
    } else {
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }
      setIsPlaying(false);
      toast.success("Screen reader disabled");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="border-b px-4 sm:px-6 py-3 sm:py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleScreenReader}
              aria-label={screenReaderEnabled ? "Disable screen reader" : "Enable screen reader"}
              className={cn(
                "flex items-center gap-2",
                screenReaderEnabled && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Headphones className="w-4 h-4" />
              <span className="sr-only">{screenReaderEnabled ? "Disable" : "Enable"} screen reader</span>
            </Button>
            {user && (
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="flex-1 container px-4 sm:px-6 py-4 sm:py-6 mx-auto space-y-6 sm:space-y-8 animate-fade-in max-w-[100%] sm:max-w-xl lg:max-w-2xl">
        <h1 className="text-xl sm:text-2xl font-semibold">Job Listings</h1>

        <Card className="w-full">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Job Listings Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <h3 className="font-semibold text-base sm:text-lg">Latest Job Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Explore the latest job opportunities tailored to your preferences.
            </p>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Job Recommendations</h2>
          <div className="space-y-3 sm:space-y-4">
            {jobListings.map((job, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg mb-1">{job.title}</CardTitle>
                  <CardDescription className={cn(
                    "text-xs sm:text-sm mb-2",
                    job.location ? "text-muted-foreground" : "text-primary/80"
                  )}>
                    {job.type}
                    {job.location && `, ${job.location}`}
                  </CardDescription>
                  <p className="text-xs sm:text-sm mb-3 sm:mb-4">{job.description}</p>
                  <div className="flex justify-end gap-2">
                    {screenReaderEnabled && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => readJobDescription(job)}
                        disabled={isPlaying}
                        className="text-xs sm:text-sm"
                      >
                        {isPlaying ? "Playing..." : "Read Description"}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                      Read Job Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Button className="w-full bg-muted text-muted-foreground hover:bg-muted/80 text-xs sm:text-sm py-5 sm:py-6">
          More Jobs
        </Button>
      </div>

      <nav className="border-t px-4 sm:px-6 py-3 sm:py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-between max-w-md mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')} className="flex flex-col items-center gap-1 h-auto py-2 text-primary">
            <Briefcase className="w-5 h-5" />
            <span className="text-xs">Jobs</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
            <Bookmark className="w-5 h-5" />
            <span className="text-xs">Saved</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
            <Clock className="w-5 h-5" />
            <span className="text-xs">Status</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
            <UserRound className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
