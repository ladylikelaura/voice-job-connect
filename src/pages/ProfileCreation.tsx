
import React, { useState, useRef, useEffect } from 'react';
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
import { CheckCircle, Camera, FileVideo, Mic, Medal, Share2, Upload, CheckCheck, Clock, Star, Accessibility, Eye, Info } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { AccessibilityControls } from '@/components/voiceApplication/AccessibilityControls';
import { useAccessibilitySettings } from '@/components/voiceApplication/useAccessibilitySettings';

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
  
  // Use accessibility hook
  const { 
    isScreenReaderMode, 
    highContrast, 
    toggleScreenReaderMode, 
    toggleHighContrast, 
    keyboardShortcuts,
    lastAnnouncement,
    announce
  } = useAccessibilitySettings();
  
  // References for accessibility focus management
  const tabRefs = {
    profile: useRef<HTMLDivElement>(null),
    skills: useRef<HTMLDivElement>(null),
    verification: useRef<HTMLDivElement>(null)
  };
  
  // Set focus when tab changes
  useEffect(() => {
    if (tabRefs[activeTab as keyof typeof tabRefs]?.current) {
      tabRefs[activeTab as keyof typeof tabRefs].current?.focus();
      
      // Announce tab change for screen readers
      if (isScreenReaderMode) {
        const tabNames = {
          profile: "Basic Information",
          skills: "Skill Demonstrations",
          verification: "Skill Verification"
        };
        announce(`Switched to ${tabNames[activeTab as keyof typeof tabNames]} tab`);
      }
    }
  }, [activeTab, isScreenReaderMode, announce]);

  // Add a skill to the list
  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput)) {
      setSkills([...skills, skillInput]);
      setSkillInput("");
      toast({
        title: "Skill added",
        description: `${skillInput} has been added to your skills.`,
      });
      
      if (isScreenReaderMode) {
        announce(`Added ${skillInput} to your skills list`);
      }
    } else if (skills.includes(skillInput)) {
      if (isScreenReaderMode) {
        announce(`${skillInput} is already in your skills list`);
      }
    }
  };

  // Remove a skill from the list
  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
    
    if (isScreenReaderMode) {
      announce(`Removed ${skillToRemove} from your skills list`);
    }
  };

  // Start recording a skill demonstration
  const startRecording = async (skill: string) => {
    if (isScreenReaderMode) {
      announce(`Starting recording for ${skill}. Please speak clearly. Press Alt+M when you're done.`);
    }
    
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
        
        // Announce time every 10 seconds for screen reader users
        if (isScreenReaderMode && (prev + 1) % 10 === 0) {
          announce(`Recording in progress. ${Math.floor((prev + 1) / 60)} minutes ${(prev + 1) % 60} seconds elapsed.`);
        }
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
        
        setRecordedVideos(prev => [
          ...prev, 
          { skill, url, verified: false }
        ]);
        
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        
        simulateUpload(blob);
        
        if (isScreenReaderMode) {
          announce(`Recording completed for ${skill}. The video has been saved.`);
        }
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
      
      if (isScreenReaderMode) {
        announce("Recording failed. Could not access camera or microphone. Please ensure you've granted permissions.");
      }
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

  // Handle keyboard shortcuts for recording
  useEffect(() => {
    if (!isScreenReaderMode) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt+S: Start recording for first available skill
      if (event.altKey && event.key === 's' && activeTab === "skills" && !recording) {
        const firstSkill = skills[0];
        if (firstSkill) {
          startRecording(firstSkill);
        } else {
          announce("No skills available to record. Please add skills in the Basic Info tab first.");
        }
      }
      
      // Alt+E: Stop recording
      if (event.altKey && event.key === 'e' && recording) {
        stopRecording();
      }
      
      // Alt+1, Alt+2, Alt+3: Switch tabs
      if (event.altKey && event.key === '1') {
        setActiveTab("profile");
      } else if (event.altKey && event.key === '2') {
        setActiveTab("skills");
      } else if (event.altKey && event.key === '3') {
        setActiveTab("verification");
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isScreenReaderMode, activeTab, recording, skills, announce]);

  // Simulate uploading the video
  const simulateUpload = (blob: Blob) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          if (isScreenReaderMode) {
            announce("Upload complete. Your video demonstration is now available for verification.");
          }
          
          return 100;
        }
        
        // Announce progress at 25%, 50%, and 75% for screen readers
        if (isScreenReaderMode && (newProgress === 25 || newProgress === 50 || newProgress === 75)) {
          announce(`Upload in progress: ${newProgress}% complete`);
        }
        
        return newProgress;
      });
    }, 100);
  };

  // Request verification for a skill
  const requestVerification = (skill: string) => {
    if (isScreenReaderMode) {
      announce(`Requesting verification for your ${skill} skill demonstration.`);
    }
    
    setTimeout(() => {
      const level = Math.floor(Math.random() * 5) + 1;
      setVerifications(prev => [
        ...prev,
        { 
          skill, 
          by: "Expert Reviewer", 
          level 
        }
      ]);
      
      setRecordedVideos(prev => 
        prev.map(v => v.skill === skill ? {...v, verified: true} : v)
      );
      
      toast({
        title: "Skill Verified!",
        description: `Your ${skill} skill has been verified at level ${level}/5.`,
      });
      
      if (isScreenReaderMode) {
        announce(`Your ${skill} skill has been verified at level ${level} out of 5 by Expert Reviewer.`);
      }
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
    if (isScreenReaderMode) {
      announce("Saving your profile information. Please wait...");
    }
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (session?.session?.user?.id) {
        const userId = session.session.user.id;
        
        const { error } = await supabase
          .from('users')
          .update({
            firstname: fullName.split(' ')[0],
            lastname: fullName.split(' ').slice(1).join(' '),
            bio: bio,
            role: 'user'
          })
          .eq('id', userId);
        
        if (error) throw error;
        
        toast({
          title: "Profile saved",
          description: "Your profile has been successfully created.",
        });
        
        if (isScreenReaderMode) {
          announce("Profile successfully saved. Redirecting to homepage.");
        }
        
        navigate('/');
      } else {
        toast({
          title: "Authentication error",
          description: "Please log in to save your profile.",
          variant: "destructive"
        });
        
        if (isScreenReaderMode) {
          announce("Authentication error. Please log in to save your profile.");
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: "There was an error saving your profile data.",
        variant: "destructive"
      });
      
      if (isScreenReaderMode) {
        announce("Error saving profile. Please try again later.");
      }
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className={highContrast ? "high-contrast-mode" : ""}>
        <h1 className="sr-only">Create Your Professional Profile</h1>
        
        {/* Accessibility Controls */}
        <div className="mb-6">
          <AccessibilityControls 
            isScreenReaderMode={isScreenReaderMode}
            highContrast={highContrast}
            toggleScreenReaderMode={toggleScreenReaderMode}
            toggleHighContrast={toggleHighContrast}
            keyboardShortcuts={[
              { key: 'Alt+1', description: 'Go to Basic Info tab' },
              { key: 'Alt+2', description: 'Go to Skills tab' },
              { key: 'Alt+3', description: 'Go to Verification tab' },
              { key: 'Alt+S', description: 'Start recording' },
              { key: 'Alt+E', description: 'End recording' },
            ]}
            lastAnnouncement={lastAnnouncement}
          />
        </div>
        
        <Card className={highContrast ? "border-4 border-black" : ""}>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Accessibility className="h-6 w-6 text-primary" aria-hidden="true" />
              Create Your Profile
            </CardTitle>
            <CardDescription className={isScreenReaderMode ? "text-lg" : ""}>
              Set up your professional profile, showcase your skills with video demonstrations, and get verified.
            </CardDescription>
            {isScreenReaderMode && (
              <div className="mt-2 p-2 bg-muted rounded-md">
                <p className="text-md font-medium">Keyboard Navigation:</p>
                <ul className="list-disc pl-5">
                  <li>Use Tab key to navigate between form elements</li>
                  <li>Use Alt+1, Alt+2, Alt+3 to switch between tabs</li>
                  <li>Press Enter or Space to activate buttons</li>
                </ul>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-8" aria-label="Profile Creation Steps">
                <TabsTrigger value="profile" aria-controls="profile-content" aria-selected={activeTab === "profile"}>
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="skills" aria-controls="skills-content" aria-selected={activeTab === "skills"}>
                  Skill Demonstrations
                </TabsTrigger>
                <TabsTrigger value="verification" aria-controls="verification-content" aria-selected={activeTab === "verification"}>
                  Skill Verification
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" id="profile-content" className="space-y-6">
                <div className="space-y-4" ref={tabRefs.profile} tabIndex={-1}>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className={isScreenReaderMode ? "text-lg" : ""}>Full Name</Label>
                    <Input 
                      id="fullName" 
                      placeholder="Enter your full name" 
                      value={fullName} 
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (isScreenReaderMode && e.target.value && e.target.value.length > 0 && fullName.length === 0) {
                          // Only announce on first input to avoid excessive announcements
                          announce("Name entered. Good start!");
                        }
                      }}
                      aria-required="true"
                      className={highContrast ? "border-2 border-black" : ""}
                    />
                    {isScreenReaderMode && (
                      <p className="text-sm text-muted-foreground mt-1">Enter your full name as you'd like it to appear on your profile</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio" className={isScreenReaderMode ? "text-lg" : ""}>Professional Bio</Label>
                    <Textarea 
                      id="bio" 
                      placeholder="Tell us about yourself, your experience, and your skills" 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)}
                      className={`h-32 ${highContrast ? "border-2 border-black" : ""}`}
                      aria-required="true"
                    />
                    {isScreenReaderMode && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Describe your professional background, experience, and qualifications. This helps employers understand your expertise.
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skills" className={isScreenReaderMode ? "text-lg" : ""}>Skills</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="skills" 
                        placeholder="Add a skill (e.g., React, Accessibility)" 
                        value={skillInput} 
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                        className={highContrast ? "border-2 border-black" : ""}
                        aria-describedby="skills-description"
                      />
                      <Button 
                        onClick={addSkill}
                        aria-label="Add skill to list"
                      >
                        Add
                      </Button>
                    </div>
                    {isScreenReaderMode && (
                      <p id="skills-description" className="text-sm text-muted-foreground mt-1">
                        Enter skills one at a time and press Enter or click Add. These are skills you'll demonstrate later.
                      </p>
                    )}
                  </div>
                  
                  {skills.length > 0 && (
                    <div 
                      className="flex flex-wrap gap-2 mt-2" 
                      aria-label={`Your skills: ${skills.join(', ')}`}
                      role="list"
                    >
                      {skills.map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant={highContrast ? "outline" : "secondary"} 
                          className="text-sm py-1 px-3"
                          role="listitem"
                        >
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
                  )}
                  
                  {isScreenReaderMode && skills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No skills added yet. Add skills to continue with skill demonstrations.</p>
                  )}
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => setActiveTab("skills")}
                    className="flex items-center gap-2"
                    aria-label="Continue to Skill Demonstrations section"
                  >
                    Next: Skill Demonstrations
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="skills" id="skills-content" className="space-y-6">
                <div className="space-y-4" ref={tabRefs.skills} tabIndex={-1}>
                  <h3 className={`text-lg font-medium flex items-center gap-2 ${isScreenReaderMode ? "text-xl" : ""}`}>
                    <Camera className="h-5 w-5 text-primary" aria-hidden="true" />
                    Record Skill Demonstrations
                  </h3>
                  <p className={`text-muted-foreground ${isScreenReaderMode ? "text-base" : "text-sm"}`}>
                    Create short video demonstrations of your skills to showcase your abilities.
                  </p>
                  
                  {isScreenReaderMode && !recording && (
                    <div className="p-3 bg-muted rounded-md mb-4">
                      <h4 className="font-medium">Screen Reader Instructions:</h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Navigate to the skill you want to demonstrate</li>
                        <li>Press the "Record Demo" button</li>
                        <li>Speak clearly about your skill and experience</li>
                        <li>Press Alt+E or use the "Stop Recording" button when finished</li>
                        <li>Request verification after recording</li>
                      </ol>
                    </div>
                  )}
                  
                  {!recording ? (
                    <div className="space-y-4">
                      {skills.length > 0 ? (
                        <div 
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          role="list"
                          aria-label="Skills available for demonstration"
                        >
                          {skills.map((skill, index) => (
                            <Card 
                              key={index} 
                              className={`p-4 ${highContrast ? "border-2 border-black" : ""}`}
                              role="listitem"
                            >
                              <div className="flex justify-between items-center">
                                <h4 className={`font-medium ${isScreenReaderMode ? "text-lg" : ""}`}>{skill}</h4>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => startRecording(skill)}
                                  className="flex items-center gap-2"
                                  aria-label={`Record demonstration for ${skill}`}
                                >
                                  <Camera className="h-4 w-4" aria-hidden="true" />
                                  Record Demo
                                </Button>
                              </div>
                              
                              {recordedVideos.find(v => v.skill === skill) && (
                                <div className="mt-4 space-y-2">
                                  <div 
                                    className="flex items-center gap-2"
                                    aria-live="polite"
                                  >
                                    <FileVideo className="h-4 w-4 text-primary" aria-hidden="true" />
                                    <span className="text-sm">Demonstration recorded</span>
                                    {recordedVideos.find(v => v.skill === skill)?.verified && (
                                      <Badge variant="outline" className="flex items-center gap-1">
                                        <CheckCheck className="h-3 w-3" aria-hidden="true" />
                                        Verified
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 border rounded-lg text-center">
                          <p className="text-muted-foreground">
                            No skills added yet. Please go back to the Basic Info tab and add some skills first.
                          </p>
                          <Button 
                            variant="outline"
                            onClick={() => setActiveTab("profile")}
                            className="mt-2"
                            aria-label="Go back to add skills"
                          >
                            Add Skills
                          </Button>
                        </div>
                      )}
                      
                      {recordedVideos.length > 0 && (
                        <div className="pt-4">
                          <h4 
                            className={`text-md font-medium mb-2 ${isScreenReaderMode ? "text-lg" : ""}`}
                            id="recorded-videos-heading"
                          >
                            Your Recorded Demonstrations
                          </h4>
                          <div 
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            role="list"
                            aria-labelledby="recorded-videos-heading"
                          >
                            {recordedVideos.map((video, index) => (
                              <Card 
                                key={index} 
                                className={`overflow-hidden ${highContrast ? "border-2 border-black" : ""}`}
                                role="listitem"
                              >
                                <video 
                                  src={video.url} 
                                  controls 
                                  className="w-full h-48 object-cover"
                                  aria-label={`${video.skill} demonstration video`}
                                />
                                <div className="p-3">
                                  <div className="flex justify-between items-center">
                                    <h5 className={`font-medium ${isScreenReaderMode ? "text-lg" : ""}`}>{video.skill}</h5>
                                    {!video.verified && (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => requestVerification(video.skill)}
                                        className="flex items-center gap-1"
                                        aria-label={`Request verification for ${video.skill}`}
                                      >
                                        <Medal className="h-3 w-3" aria-hidden="true" />
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
                      <div className={`p-4 ${highContrast ? "bg-black text-white" : "bg-muted"} rounded-lg`}>
                        <h4 
                          className={`text-md font-medium mb-2 ${isScreenReaderMode ? "text-lg" : ""}`}
                          aria-live="assertive"
                        >
                          Recording: {currentSkill} <span className="text-primary">{formatTime(recordingTime)}</span>
                        </h4>
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          muted 
                          className="w-full h-64 bg-black rounded-lg" 
                          aria-label="Live video preview"
                        />
                        {isScreenReaderMode && (
                          <p className="mt-2 text-sm">
                            Recording in progress. Speak clearly about your expertise in {currentSkill}. 
                            Describe specific projects, technologies, or methodologies you're familiar with.
                          </p>
                        )}
                        <div className="flex justify-center mt-4">
                          <Button 
                            variant="destructive" 
                            onClick={stopRecording}
                            className="flex items-center gap-2"
                            aria-label="Stop recording"
                          >
                            <Mic className="h-4 w-4" aria-hidden="true" />
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
                    aria-label="Go back to Basic Info"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("verification")}
                    className="flex items-center gap-2"
                    aria-label="Continue to Skill Verification"
                  >
                    Next: Skill Verification
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="verification" id="verification-content" className="space-y-6">
                <div className="space-y-4" ref={tabRefs.verification} tabIndex={-1}>
                  <h3 className={`text-lg font-medium flex items-center gap-2 ${isScreenReaderMode ? "text-xl" : ""}`}>
                    <Medal className="h-5 w-5 text-primary" aria-hidden="true" />
                    Skill Verification Status
                  </h3>
                  <p className={`text-muted-foreground ${isScreenReaderMode ? "text-base" : "text-sm"}`}>
                    Track the verification status of your demonstrated skills.
                  </p>
                  
                  {uploadProgress < 100 && recordedVideos.length > 0 && (
                    <div 
                      className="space-y-2" 
                      aria-live="polite"
                      aria-label={`Upload progress: ${uploadProgress}%`}
                    >
                      <div className="flex justify-between text-sm">
                        <span>Uploading demonstration videos...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} aria-label="Upload progress" />
                    </div>
                  )}
                  
                  {verifications.length > 0 ? (
                    <div 
                      className="space-y-4"
                      role="list"
                      aria-label="Verified skills"
                    >
                      {verifications.map((verification, index) => (
                        <Card 
                          key={index} 
                          className={`p-4 ${highContrast ? "border-2 border-black" : ""}`}
                          role="listitem"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <h4 className={`font-medium ${isScreenReaderMode ? "text-lg" : ""}`}>{verification.skill}</h4>
                              <Badge className="flex items-center gap-1 bg-green-500">
                                <CheckCircle className="h-3 w-3" aria-hidden="true" />
                                Verified
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Verified by: {verification.by}</span>
                              <div 
                                className="flex items-center"
                                aria-label={`Rated ${verification.level} out of 5 stars`}
                              >
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < verification.level 
                                        ? "text-yellow-500 fill-yellow-500" 
                                        : "text-muted-foreground"
                                    }`}
                                    aria-hidden="true"
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
                          aria-label="Share your verified skills with your network"
                        >
                          <Share2 className="h-4 w-4" aria-hidden="true" />
                          Share Verified Skills
                        </Button>
                      </div>
                    </div>
                  ) : recordedVideos.length > 0 ? (
                    <div 
                      className={`p-4 border rounded-lg flex items-center gap-3 ${highContrast ? "border-2 border-black" : ""}`}
                      aria-live="polite"
                    >
                      <Clock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      <div>
                        <h4 className={`font-medium ${isScreenReaderMode ? "text-lg" : ""}`}>Waiting for verification</h4>
                        <p className={`${isScreenReaderMode ? "text-base" : "text-sm"} text-muted-foreground`}>
                          Your skill demonstrations are awaiting verification. 
                          This usually takes 1-2 days.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`p-4 border rounded-lg flex items-center gap-3 ${highContrast ? "border-2 border-black" : ""}`}
                      aria-live="polite"
                    >
                      <Camera className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      <div>
                        <h4 className={`font-medium ${isScreenReaderMode ? "text-lg" : ""}`}>No demonstrations recorded</h4>
                        <p className={`${isScreenReaderMode ? "text-base" : "text-sm"} text-muted-foreground`}>
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
                    aria-label="Go back to Skill Demonstrations"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={saveProfile}
                    className="flex items-center gap-2"
                    aria-label="Save and complete your profile"
                  >
                    Complete Profile
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 border-t pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
              <span>All data is stored securely</span>
            </div>
            
            {activeTab === "profile" && (
              <div className={`bg-muted p-4 rounded-lg w-full ${highContrast ? "bg-black text-white" : ""}`}>
                <h4 className={`font-medium mb-2 flex items-center gap-2 ${isScreenReaderMode ? "text-lg" : ""}`}>
                  <Info className="h-4 w-4 text-primary" aria-hidden="true" />
                  Profile Completion Tips
                </h4>
                <ul className={`${isScreenReaderMode ? "text-base" : "text-sm"} space-y-1 list-disc pl-5`}>
                  <li>Add at least 3-5 key skills to showcase your expertise</li>
                  <li>Write a concise but detailed professional bio</li>
                  <li>Record short 30-60 second skill demonstrations</li>
                  <li>Request verification for your most important skills</li>
                </ul>
              </div>
            )}
            
            {/* Screen reader only status element */}
            {isScreenReaderMode && (
              <div className="sr-only" aria-live="polite">
                {lastAnnouncement}
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ProfileCreation;
