import { ArrowLeft, Briefcase, Bookmark, Clock, UserRound, Headphones, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { VoiceApplicationUI } from '@/components/VoiceApplicationUI';

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  job_type: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

const jobCategories = [
  { name: "Software Development", color: "bg-[#E5DEFF]" },
  { name: "Customer Service", color: "bg-[#FEF7CD]" },
  { name: "Marketing", color: "bg-[#F2FCE2]" },
  { name: "Design", color: "bg-[#FFDEE2]" },
  { name: "Sales", color: "bg-[#D3E4FD]" },
  { name: "All Remote", color: "bg-[#FDE1D3]" },
];

const stripHtmlTags = (html: string) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const fetchJobs = async () => {
  const response = await fetch('https://remotive.com/api/remote-jobs');
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  const data = await response.json();
  return data.jobs as RemotiveJob[];
};

export default function Jobs() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visibleJobs, setVisibleJobs] = useState(10);
  const [isVoiceApplicationActive, setIsVoiceApplicationActive] = useState(false);
  const voiceApplicationRef = useRef<HTMLDivElement>(null);

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleVoiceApplicationStart = () => {
      setIsVoiceApplicationActive(true);
      
      if (voiceApplicationRef.current) {
        voiceApplicationRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const handleVoiceApplicationEnd = () => {
      setIsVoiceApplicationActive(false);
    };

    window.addEventListener('voiceApplicationStart', handleVoiceApplicationStart);
    window.addEventListener('voiceApplicationEnd', handleVoiceApplicationEnd);

    return () => {
      window.removeEventListener('voiceApplicationStart', handleVoiceApplicationStart);
      window.removeEventListener('voiceApplicationEnd', handleVoiceApplicationEnd);
    };
  }, []);

  const readJobDescription = (job: RemotiveJob) => {
    try {
      window.speechSynthesis.cancel();
      
      const cleanDescription = stripHtmlTags(job.description);
      const jobText = `${job.title}. Position at ${job.company_name}. ${job.job_type} role${job.candidate_required_location ? `, ${job.candidate_required_location}` : ''}. ${job.salary ? `Salary: ${job.salary}.` : ''} ${cleanDescription.slice(0, 200)}...`;
      
      console.log("Reading job description using browser speech synthesis:", job.title);
      
      if ('speechSynthesis' in window) {
        setIsPlaying(true);
        toast.info("Reading job description...");
        
        const utterance = new SpeechSynthesisUtterance(jobText);
        
        utterance.onend = () => {
          console.log("Browser speech synthesis ended");
          setIsPlaying(false);
        };
        
        utterance.onerror = (event) => {
          console.error("Browser speech synthesis error:", event);
          setIsPlaying(false);
          toast.error("Failed to read job description");
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        toast.error("Your browser does not support text-to-speech");
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(false);
      toast.error("Failed to read job description");
    }
  };

  const toggleScreenReader = () => {
    setScreenReaderEnabled(!screenReaderEnabled);
    if (!screenReaderEnabled) {
      toast.success("Screen reader enabled");
    } else {
      setIsPlaying(false);
      window.speechSynthesis.cancel();
      toast.success("Screen reader disabled");
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    setVisibleJobs(10);
  };

  const loadMore = () => {
    setVisibleJobs(prev => prev + 10);
  };

  const filteredJobs = jobs?.filter(job => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      job.title.toLowerCase().includes(searchLower) ||
      job.company_name.toLowerCase().includes(searchLower) ||
      job.candidate_required_location.toLowerCase().includes(searchLower) ||
      stripHtmlTags(job.description).toLowerCase().includes(searchLower);

    const matchesCategory = !selectedCategory || 
      job.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  }) || [];

  const visibleFilteredJobs = filteredJobs.slice(0, visibleJobs);
  const hasMoreJobs = filteredJobs.length > visibleJobs;

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="border-b px-4 sm:px-6 py-3 sm:py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={toggleScreenReader}
              aria-label={screenReaderEnabled ? "Disable screen reader" : "Enable screen reader"}
              className={cn(
                "flex items-center gap-2 px-6 py-6 text-base font-medium transition-all duration-200",
                screenReaderEnabled 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 border-4 border-primary" 
                  : "hover:bg-accent hover:text-accent-foreground border-2"
              )}
            >
              <Headphones className="w-6 h-6" />
              <span className="hidden sm:inline">
                {screenReaderEnabled ? "Screen Reader On" : "Screen Reader Off"}
              </span>
            </Button>
            {user && (
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div 
        className={cn(
          "flex-1 container px-4 sm:px-6 py-4 sm:py-6 mx-auto space-y-6 sm:space-y-8 animate-fade-in max-w-[100%] sm:max-w-xl lg:max-w-2xl",
          isVoiceApplicationActive && "overflow-hidden h-screen"
        )}
      >
        <h1 className="text-xl sm:text-2xl font-semibold">Remote Job Listings</h1>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleJobs(10);
              }}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {jobCategories.map((category) => (
              <Button
                key={category.name}
                variant="outline"
                size="sm"
                onClick={() => handleCategoryClick(category.name)}
                className={cn(
                  "rounded-full transition-all duration-200 border-2",
                  category.color,
                  selectedCategory === category.name ? "ring-2 ring-primary ring-offset-2" : ""
                )}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <Card className="w-full">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Remote Job Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <h3 className="font-semibold text-base sm:text-lg">Latest Remote Jobs</h3>
            <p className="text-sm text-muted-foreground">
              Explore the latest remote job opportunities from companies worldwide.
            </p>
          </CardContent>
        </Card>

        <div ref={voiceApplicationRef}>
          <VoiceApplicationUI />
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Available Positions</h2>
          <div className="space-y-3 sm:space-y-4">
            {isLoading ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">Loading jobs...</p>
              </Card>
            ) : error ? (
              <Card className="p-6 text-center">
                <p className="text-red-500">Error loading jobs. Please try again later.</p>
              </Card>
            ) : visibleFilteredJobs.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                <p>No jobs found matching your search criteria</p>
              </Card>
            ) : (
              <>
                {visibleFilteredJobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <CardTitle className="text-base sm:text-lg mb-1">{job.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm mb-2">
                        {job.company_name} • {job.job_type || 'Full Time'}
                        {job.candidate_required_location && ` • ${job.candidate_required_location}`}
                      </CardDescription>
                      {job.salary && (
                        <p className="text-xs sm:text-sm text-primary mb-2">{job.salary}</p>
                      )}
                      <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                        {stripHtmlTags(job.description).slice(0, 200)}...
                      </p>
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs sm:text-sm"
                          onClick={() => window.open(job.url, '_blank')}
                        >
                          View Job Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {hasMoreJobs && (
                  <Button 
                    onClick={loadMore}
                    className="w-full bg-muted text-muted-foreground hover:bg-muted/80 text-xs sm:text-sm py-5 sm:py-6"
                  >
                    Load More Jobs
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <Button 
          className="w-full bg-muted text-muted-foreground hover:bg-muted/80 text-xs sm:text-sm py-5 sm:py-6"
          onClick={() => window.location.reload()}
        >
          Refresh Jobs
        </Button>
      </div>

      <nav className="border-t px-4 sm:px-6 py-3 sm:py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10">
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
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => navigate('/profile')}
          >
            <UserRound className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
