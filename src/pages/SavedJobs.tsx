import { useState } from "react";
import { ArrowLeft, Briefcase, Bookmark, Clock, UserRound, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useSavedJobs, SavedJob } from "@/hooks/useSavedJobs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const stripHtmlTags = (html: string) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export default function SavedJobs() {
  const navigate = useNavigate();
  const { savedJobs, removeJob } = useSavedJobs();
  const [searchQuery, setSearchQuery] = useState("");

  const handleRemove = (job: SavedJob) => {
    removeJob(job.id);
    toast.success(`Removed "${job.title}" from saved jobs`);
  };

  const filteredJobs = savedJobs.filter(job => {
    const searchLower = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(searchLower) ||
      job.company_name.toLowerCase().includes(searchLower) ||
      job.candidate_required_location.toLowerCase().includes(searchLower) ||
      stripHtmlTags(job.description).toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="border-b px-4 sm:px-6 py-3 sm:py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Saved Jobs</h1>
          <div className="w-10"></div> {/* Spacer to center the title */}
        </div>
      </nav>

      <div className="flex-1 container px-4 sm:px-6 py-4 sm:py-6 mx-auto space-y-6 sm:space-y-8 animate-fade-in max-w-[100%] sm:max-w-xl lg:max-w-2xl">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search saved jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <div className="space-y-3 sm:space-y-4">
            {filteredJobs.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "No saved jobs match your search" : "No saved jobs yet"}
                </p>
                <Button 
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/jobs')}
                >
                  Browse Jobs
                </Button>
              </Card>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-base sm:text-lg">{job.title}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleRemove(job)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove from saved</span>
                      </Button>
                    </div>
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
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Saved on {new Date(job.saved_at).toLocaleDateString()}
                      </span>
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
              ))
            )}
          </div>
        </div>
      </div>

      <nav className="border-t px-4 sm:px-6 py-3 sm:py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10">
        <div className="flex justify-between max-w-md mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')} className="flex flex-col items-center gap-1 h-auto py-2">
            <Briefcase className="w-5 h-5" />
            <span className="text-xs">Jobs</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 text-primary" onClick={() => navigate('/saved')}>
            <Bookmark className="w-5 h-5" />
            <span className="text-xs">Saved</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => navigate('/status')}
          >
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
