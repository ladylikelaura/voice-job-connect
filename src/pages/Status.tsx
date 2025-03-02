
import { ArrowLeft, Briefcase, Bookmark, Clock, UserRound, Plus, Calendar, CheckCircle, XCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ApplicationStatus {
  id: string;
  jobTitle: string;
  company: string;
  status: "applied" | "interview" | "rejected" | "offered" | "accepted";
  applicationDate: string;
  nextStep?: string;
  nextStepDate?: string;
  notes?: string;
  externalUrl?: string;
}

export default function Status() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationStatus[]>([]);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [nextStepDate, setNextStepDate] = useState<Date | undefined>();
  const [newApplication, setNewApplication] = useState<Omit<ApplicationStatus, "id">>({
    jobTitle: "",
    company: "",
    status: "applied",
    applicationDate: new Date().toISOString(),
  });
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Load applications from localStorage
    const storedApplications = localStorage.getItem('applications');
    if (storedApplications) {
      try {
        setApplications(JSON.parse(storedApplications));
      } catch (error) {
        console.error('Error parsing applications:', error);
        localStorage.removeItem('applications');
      }
    }
  }, []);

  const saveApplications = (updatedApplications: ApplicationStatus[]) => {
    localStorage.setItem('applications', JSON.stringify(updatedApplications));
    setApplications(updatedApplications);
  };

  const handleAddApplication = () => {
    if (!newApplication.jobTitle || !newApplication.company) {
      toast.error("Job title and company are required");
      return;
    }
    
    const application: ApplicationStatus = {
      ...newApplication,
      id: Date.now().toString(),
      applicationDate: date ? date.toISOString() : new Date().toISOString(),
      nextStepDate: nextStepDate ? nextStepDate.toISOString() : undefined
    };
    
    const updatedApplications = [...applications, application];
    saveApplications(updatedApplications);
    toast.success("Application added successfully");
    setOpen(false);
    resetForm();
  };

  const handleUpdateStatus = (id: string, status: ApplicationStatus["status"]) => {
    const updatedApplications = applications.map(app => 
      app.id === id ? { ...app, status } : app
    );
    saveApplications(updatedApplications);
    toast.success(`Application status updated to ${status}`);
  };

  const handleDeleteApplication = (id: string) => {
    const updatedApplications = applications.filter(app => app.id !== id);
    saveApplications(updatedApplications);
    toast.success("Application removed");
  };

  const resetForm = () => {
    setNewApplication({
      jobTitle: "",
      company: "",
      status: "applied",
      applicationDate: new Date().toISOString(),
    });
    setDate(undefined);
    setNextStepDate(undefined);
  };

  const filteredApplications = applications.filter(app => {
    // Filter by search query
    const matchesSearch = 
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter by tab
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "active" && ["applied", "interview"].includes(app.status)) ||
      (activeTab === "completed" && ["rejected", "offered", "accepted"].includes(app.status));

    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: ApplicationStatus["status"]) => {
    switch (status) {
      case "applied":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Applied</Badge>;
      case "interview":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Interview</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case "offered":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Offered</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Accepted</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="border-b px-4 sm:px-6 py-3 sm:py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Application Status</h1>
          <div className="w-10"></div> {/* Spacer to center the title */}
        </div>
      </nav>

      <div className="flex-1 container px-4 sm:px-6 py-4 sm:py-6 mx-auto space-y-6 sm:space-y-8 animate-fade-in max-w-[100%] sm:max-w-xl lg:max-w-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-semibold">My Applications</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Application</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Application</DialogTitle>
                <DialogDescription>
                  Track a job you've applied to externally
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={newApplication.jobTitle}
                    onChange={(e) => setNewApplication({...newApplication, jobTitle: e.target.value})}
                    placeholder="Software Developer"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={newApplication.company}
                    onChange={(e) => setNewApplication({...newApplication, company: e.target.value})}
                    placeholder="Acme Inc."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Application Status</Label>
                  <Select
                    value={newApplication.status}
                    onValueChange={(value: any) => setNewApplication({...newApplication, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="interview">Interview Scheduled</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="offered">Offer Received</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Application Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="externalUrl">Job Listing URL (Optional)</Label>
                  <Input
                    id="externalUrl"
                    value={newApplication.externalUrl || ""}
                    onChange={(e) => setNewApplication({...newApplication, externalUrl: e.target.value})}
                    placeholder="https://example.com/job/123"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nextStep">Next Step (Optional)</Label>
                  <Input
                    id="nextStep"
                    value={newApplication.nextStep || ""}
                    onChange={(e) => setNewApplication({...newApplication, nextStep: e.target.value})}
                    placeholder="Phone interview"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Next Step Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !nextStepDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {nextStepDate ? format(nextStepDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={nextStepDate}
                        onSelect={setNextStepDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newApplication.notes || ""}
                    onChange={(e) => setNewApplication({...newApplication, notes: e.target.value})}
                    placeholder="Any additional notes about this application"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleAddApplication}>Add Application</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No applications match your search" : "No applications yet"}
              </p>
              <Button 
                onClick={() => setOpen(true)}
                className="mx-auto"
              >
                Add Your First Application
              </Button>
            </Card>
          ) : (
            filteredApplications.map((app) => (
              <Card key={app.id} className="overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <CardTitle className="text-base sm:text-lg mb-1">{app.jobTitle}</CardTitle>
                      <CardDescription>{app.company}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(app.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateStatus(app.id, "applied")}>
                            Mark as Applied
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(app.id, "interview")}>
                            Mark as Interview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(app.id, "offered")}>
                            Mark as Offered
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(app.id, "accepted")}>
                            Mark as Accepted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(app.id, "rejected")}>
                            Mark as Rejected
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteApplication(app.id)} className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Applied on:</p>
                      <p>{format(new Date(app.applicationDate), 'PP')}</p>
                    </div>
                    {app.nextStep && (
                      <div>
                        <p className="text-muted-foreground">Next step:</p>
                        <p>{app.nextStep}</p>
                      </div>
                    )}
                    {app.nextStepDate && (
                      <div>
                        <p className="text-muted-foreground">Next step date:</p>
                        <p>{format(new Date(app.nextStepDate), 'PP')}</p>
                      </div>
                    )}
                  </div>

                  {app.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-muted-foreground text-sm mb-1">Notes:</p>
                      <p className="text-sm">{app.notes}</p>
                    </div>
                  )}

                  {app.externalUrl && (
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs sm:text-sm"
                        onClick={() => window.open(app.externalUrl, '_blank')}
                      >
                        View Job Listing
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <nav className="border-t px-4 sm:px-6 py-3 sm:py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10">
        <div className="flex justify-between max-w-md mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')} className="flex flex-col items-center gap-1 h-auto py-2">
            <Briefcase className="w-5 h-5" />
            <span className="text-xs">Jobs</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => navigate('/saved')}
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-xs">Saved</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2 text-primary"
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
