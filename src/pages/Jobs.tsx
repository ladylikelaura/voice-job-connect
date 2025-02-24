
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  return (
    <div className="container px-4 sm:px-6 py-4 sm:py-6 mx-auto space-y-6 sm:space-y-8 animate-fade-in max-w-[100%] sm:max-w-xl lg:max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" className="shrink-0">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-semibold">Job Listings</h1>
      </div>

      {/* Summary Card */}
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

      {/* Job Recommendations */}
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
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    Read Job Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* More Jobs Button */}
      <Button className="w-full bg-muted text-muted-foreground hover:bg-muted/80 text-xs sm:text-sm py-5 sm:py-6">
        More Jobs
      </Button>
    </div>
  );
}
