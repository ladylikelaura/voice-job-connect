
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Camera, FileVideo, Mic, Medal, Share2, Upload, CheckCheck, Clock, Star } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

const ProfileCreation = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordedVideos, setRecordedVideos] = useState<{ skill: string, url: string, verified: boolean }[]>([]);
  const [verifications, setVerifications] = useState<{ skill: string, by: string, level: number }[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<BlobPart[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isAccessible, setIsAccessible] = useState(true);

  // Add a skill to the list
  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput)) {
      setSkills([...skills, skillInput]);
      setSkillInput("");
      toast({
        title: "Skill added",
        description: `${skillInput} has been added to your skills.`,
      });
    }
  };

  // Remove a skill from the list
  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Start recording a skill demonstration
  const startRecording = async (skill: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      setRecordedChunks([]);
      setCurrentSkill(skill);
      setRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, {
          type: 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        
        // Add to recorded videos
        setRecordedVideos(prev => [
          ...prev, 
          { skill, url, verified: false }
        ]);
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        
        simulateUpload(blob);
      };

      mediaRecorder.start();
      
      toast({
        title: "Recording started",
        description: `Now recording your demonstration of ${skill}.`,
      });
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Recording failed",
        description: "Could not access camera or microphone.",
        variant: "destructive"
      });
    }
  };

  // Stop the current recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast({
        title: "Recording completed",
        description: `Your ${currentSkill} demonstration has been recorded.`,
      });
    }
  };

  // Simulate uploading the video
  const simulateUpload = (blob: Blob) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 100);
  };

  // Request verification for a skill
  const requestVerification = (skill: string) => {
    // Simulating verification from peers
    setTimeout(() => {
      const level = Math.floor(Math.random() * 5) + 1; // Random level 1-5
      setVerifications(prev => [
        ...prev,
        { 
          skill, 
          by: "Expert Reviewer", 
          level 
        }
      ]);
      
      // Mark the video as verified
      setRecordedVideos(prev => 
        prev.map(v => v.skill === skill ? {...v, verified: true} : v)
      );
      
      toast({
        title: "Skill Verified!",
        description: `Your ${skill} skill has been verified at level ${level}/5.`,
      });
    }, 2000);
    
    toast({
      title: "Verification requested",
      description: `Your ${skill} demonstration is being reviewed.`,
    });
  };

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Save profile data
  const saveProfile = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (session?.session?.user?.id) {
        const userId = session.session.user.id;
        
        // Save to users table
        const { error } = await supabase
          .from('users')
          .update({
            firstname: fullName.split(' ')[0],
            lastname: fullName.split(' ').slice(1).join(' '),
            bio: bio
          })
          .eq('id', userId);
        
        if (error) throw error;
        
        toast({
          title: "Profile saved",
          description: "Your profile has been successfully created.",
        });
        
        // Navigate to home page
        navigate('/');
      } else {
        toast({
          title: "Authentication error",
          description: "Please log in to save your profile.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: "There was an error saving your profile data.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Your Profile</CardTitle>
          <CardDescription>
            Set up your professional profile, showcase your skills with video demonstrations, and get verified.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="profile">Basic Info</TabsTrigger>
              <TabsTrigger value="skills">Skill Demonstrations</TabsTrigger>
              <TabsTrigger value="verification">Skill Verification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    placeholder="Enter your full name" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    aria-required="true"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us about yourself, your experience, and your skills" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    className="h-32"
                    aria-required="true"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="skills" 
                      placeholder="Add a skill (e.g., React, Accessibility)" 
                      value={skillInput} 
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill}>Add</Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                      {skill}
                      <button 
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${skill} skill`}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                  <Switch 
                    id="accessible" 
                    checked={isAccessible} 
                    onCheckedChange={setIsAccessible}
                  />
                  <Label htmlFor="accessible">Make profile accessible to screen readers</Label>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => setActiveTab("skills")}
                  className="flex items-center gap-2"
                >
                  Next: Skill Demonstrations
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="skills" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Record Skill Demonstrations</h3>
                <p className="text-muted-foreground">
                  Create short video demonstrations of your skills to showcase your abilities.
                </p>
                
                {!recording ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {skills.map((skill, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{skill}</h4>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => startRecording(skill)}
                              className="flex items-center gap-2"
                              aria-label={`Record demonstration for ${skill}`}
                            >
                              <Camera className="h-4 w-4" />
                              Record Demo
                            </Button>
                          </div>
                          
                          {recordedVideos.find(v => v.skill === skill) && (
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <FileVideo className="h-4 w-4 text-primary" />
                                <span className="text-sm">Demonstration recorded</span>
                                {recordedVideos.find(v => v.skill === skill)?.verified && (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <CheckCheck className="h-3 w-3" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                    
                    {recordedVideos.length > 0 && (
                      <div className="pt-4">
                        <h4 className="text-md font-medium mb-2">Your Recorded Demonstrations</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {recordedVideos.map((video, index) => (
                            <Card key={index} className="overflow-hidden">
                              <video 
                                src={video.url} 
                                controls 
                                className="w-full h-48 object-cover"
                                aria-label={`${video.skill} demonstration video`}
                              />
                              <div className="p-3">
                                <div className="flex justify-between items-center">
                                  <h5 className="font-medium">{video.skill}</h5>
                                  {!video.verified && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => requestVerification(video.skill)}
                                      className="flex items-center gap-1"
                                      aria-label={`Request verification for ${video.skill}`}
                                    >
                                      <Medal className="h-3 w-3" />
                                      Verify
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="text-md font-medium mb-2">
                        Recording: {currentSkill} <span className="text-primary">{formatTime(recordingTime)}</span>
                      </h4>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        className="w-full h-64 bg-black rounded-lg" 
                      />
                      <div className="flex justify-center mt-4">
                        <Button 
                          variant="destructive" 
                          onClick={stopRecording}
                          className="flex items-center gap-2"
                          aria-label="Stop recording"
                        >
                          <Mic className="h-4 w-4" />
                          Stop Recording
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("profile")}
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setActiveTab("verification")}
                  className="flex items-center gap-2"
                >
                  Next: Skill Verification
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="verification" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Skill Verification Status</h3>
                <p className="text-muted-foreground">
                  Track the verification status of your demonstrated skills.
                </p>
                
                {uploadProgress < 100 && recordedVideos.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading demonstration videos...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} aria-label="Upload progress" />
                  </div>
                )}
                
                {verifications.length > 0 ? (
                  <div className="space-y-4">
                    {verifications.map((verification, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{verification.skill}</h4>
                            <Badge className="flex items-center gap-1 bg-green-500">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Verified by: {verification.by}</span>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < verification.level 
                                      ? "text-yellow-500 fill-yellow-500" 
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    <div className="flex justify-center">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        aria-label="Share your verified skills"
                      >
                        <Share2 className="h-4 w-4" />
                        Share Verified Skills
                      </Button>
                    </div>
                  </div>
                ) : recordedVideos.length > 0 ? (
                  <div className="p-4 border rounded-lg flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Waiting for verification</h4>
                      <p className="text-sm text-muted-foreground">
                        Your skill demonstrations are awaiting verification. 
                        This usually takes 1-2 days.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border rounded-lg flex items-center gap-3">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">No demonstrations recorded</h4>
                      <p className="text-sm text-muted-foreground">
                        Record skill demonstrations to get them verified.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("skills")}
                >
                  Back
                </Button>
                <Button 
                  onClick={saveProfile}
                  className="flex items-center gap-2"
                >
                  Complete Profile
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 border-t pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>All data is stored securely</span>
          </div>
          
          {activeTab === "profile" && (
            <div className="bg-muted p-4 rounded-lg w-full">
              <h4 className="font-medium mb-2">Profile Completion Tips</h4>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Add at least 3-5 key skills to showcase your expertise</li>
                <li>Write a concise but detailed professional bio</li>
                <li>Record short 30-60 second skill demonstrations</li>
                <li>Request verification for your most important skills</li>
              </ul>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfileCreation;
