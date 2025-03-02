import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Video, Check, CheckCircle, XCircle, Upload, Trash2, Award } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

interface SkillDemo {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  status: 'draft' | 'recorded' | 'submitted' | 'verified';
  rating?: number;
  feedback?: string;
}

export default function ProfileCreation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
  });
  
  const [skills, setSkills] = useState<SkillDemo[]>([
    { id: '1', title: 'Accessibility Knowledge', description: 'Demonstrate your understanding of web accessibility standards', status: 'draft' },
    { id: '2', title: 'Screen Reader Usage', description: 'Show how you test websites with screen readers', status: 'draft' },
    { id: '3', title: 'Keyboard Navigation', description: 'Demonstrate keyboard-only navigation techniques', status: 'draft' },
  ]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
    
    return () => {
      // Clean up media streams when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          firstname: personalInfo.firstName,
          lastname: personalInfo.lastName,
          email: personalInfo.email || user.email,
          bio: personalInfo.bio,
        });
      
      if (error) throw error;
      
      toast.success("Profile saved successfully!");
      setActiveTab("skills");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async (skillId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Mute to avoid feedback
        videoRef.current.play();
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        
        // Upload video to Supabase Storage
        if (user) {
          setIsLoading(true);
          try {
            const fileName = `skill-demo-${skillId}-${Date.now()}.webm`;
            const { data, error } = await supabase.storage
              .from('skill-demos')
              .upload(`${user.id}/${fileName}`, blob);
              
            if (error) throw error;
            
            // Get public URL
            const { data: publicUrlData } = supabase.storage
              .from('skill-demos')
              .getPublicUrl(`${user.id}/${fileName}`);
              
            // Update skill with video URL
            setSkills(skills.map(skill => 
              skill.id === skillId 
                ? { ...skill, videoUrl: publicUrlData.publicUrl, status: 'recorded' } 
                : skill
            ));
            
            toast.success("Video recorded and saved successfully!");
          } catch (error) {
            console.error("Error saving video:", error);
            toast.error("Failed to save video. Please try again.");
          } finally {
            setIsLoading(false);
          }
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Set up timer
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
        
        // Auto-stop after 2 minutes
        if (seconds >= 120) {
          stopRecording();
        }
      }, 1000);
      
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Failed to access camera or microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    setIsRecording(false);
    setRecordingTime(0);
  };

  const submitForVerification = (skillId: string) => {
    // Update skill status to submitted
    setSkills(skills.map(skill => 
      skill.id === skillId ? { ...skill, status: 'submitted' } : skill
    ));
    
    toast.success("Skill demonstration submitted for verification!");
    
    // In a real app, this would trigger a notification to reviewers
    // For demo purposes, we'll simulate a verification after 3 seconds
    setTimeout(() => {
      setSkills(skills.map(skill => 
        skill.id === skillId 
          ? { 
              ...skill, 
              status: 'verified',
              rating: Math.floor(Math.random() * 3) + 3, // Random rating between 3-5
              feedback: "Great demonstration of this skill. Your expertise is evident."
            } 
          : skill
      ));
      toast.success("Skill has been verified!");
    }, 3000);
  };

  const deleteRecording = async (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    
    if (skill?.videoUrl && user) {
      try {
        // Extract file path from URL
        const urlParts = skill.videoUrl.split('/');
        const filePath = `${user.id}/${urlParts[urlParts.length - 1]}`;
        
        // Delete from Supabase storage
        const { error } = await supabase.storage
          .from('skill-demos')
          .remove([filePath]);
          
        if (error) throw error;
        
        // Update skill state
        setSkills(skills.map(s => 
          s.id === skillId ? { ...s, videoUrl: undefined, status: 'draft' } : s
        ));
        
        toast.success("Recording deleted successfully");
      } catch (error) {
        console.error("Error deleting recording:", error);
        toast.error("Failed to delete recording");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-4 py-3 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Profile & Skills</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto py-6 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="personal">Basic Info</TabsTrigger>
            <TabsTrigger value="skills">Skill Demos</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your profile information here. This will be visible to potential employers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      value={personalInfo.firstName} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      value={personalInfo.lastName} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={personalInfo.email} 
                    onChange={handleInputChange} 
                    placeholder={user?.email || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    value={personalInfo.phone} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea 
                    id="bio" 
                    name="bio" 
                    rows={4} 
                    value={personalInfo.bio} 
                    onChange={handleInputChange} 
                    placeholder="Tell us about your professional experience, skills, and career goals..."
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Profile"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skill Demonstration Recordings</CardTitle>
                <CardDescription>
                  Record short videos demonstrating your skills. These will help potential employers see your abilities in action.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {isRecording && (
                    <div className="mb-6 space-y-2">
                      <div className="border border-red-500 rounded-lg overflow-hidden">
                        <video 
                          ref={videoRef} 
                          className="w-full aspect-video bg-muted" 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="animate-pulse">Recording</Badge>
                          <span>{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <Button 
                          variant="destructive" 
                          onClick={stopRecording}
                        >
                          Stop Recording
                        </Button>
                      </div>
                    </div>
                  )}
                
                  {skills.map((skill) => (
                    <div key={skill.id} className="border rounded-lg p-4 space-y-3">
                      <div>
                        <h3 className="text-lg font-medium">{skill.title}</h3>
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                      </div>
                      
                      {skill.videoUrl && (
                        <div className="space-y-2">
                          <video 
                            src={skill.videoUrl} 
                            controls 
                            className="w-full rounded-md aspect-video bg-muted" 
                          />
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteRecording(skill.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                            {skill.status === 'recorded' && (
                              <Button 
                                size="sm"
                                onClick={() => submitForVerification(skill.id)}
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Submit for Verification
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {!skill.videoUrl && !isRecording && (
                        <Button 
                          variant="secondary" 
                          onClick={() => startRecording(skill.id)}
                          disabled={isRecording}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Record Demonstration
                        </Button>
                      )}
                      
                      <div className="flex items-center text-xs gap-2">
                        <span>Status:</span>
                        {skill.status === 'draft' && <Badge variant="outline">Not Started</Badge>}
                        {skill.status === 'recorded' && <Badge variant="secondary">Recorded</Badge>}
                        {skill.status === 'submitted' && <Badge variant="default">Under Review</Badge>}
                        {skill.status === 'verified' && <Badge className="bg-green-500">Verified</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skill Verification Status</CardTitle>
                <CardDescription>
                  Track the verification status of your submitted skill demonstrations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {skills.filter(skill => skill.status === 'submitted' || skill.status === 'verified').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No skills have been submitted for verification yet.</p>
                      <Button 
                        variant="link" 
                        onClick={() => setActiveTab("skills")}
                      >
                        Go to Skill Demos
                      </Button>
                    </div>
                  ) : (
                    skills.filter(skill => skill.status === 'submitted' || skill.status === 'verified').map((skill) => (
                      <div key={skill.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">{skill.title}</h3>
                            <p className="text-sm text-muted-foreground">{skill.description}</p>
                          </div>
                          {skill.status === 'submitted' ? (
                            <Badge variant="default">Pending Review</Badge>
                          ) : (
                            <Badge className="bg-green-500">Verified</Badge>
                          )}
                        </div>
                        
                        {skill.status === 'submitted' && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Your submission is being reviewed by experts.</p>
                            <Progress value={45} className="h-2" />
                          </div>
                        )}
                        
                        {skill.status === 'verified' && skill.rating && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Rating:</span>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Award 
                                    key={i} 
                                    className={`h-5 w-5 ${i < skill.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            {skill.feedback && (
                              <div className="bg-muted p-3 rounded-md text-sm">
                                <p className="font-medium mb-1">Feedback:</p>
                                <p>{skill.feedback}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
