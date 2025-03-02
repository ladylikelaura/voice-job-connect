
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { UserPlus, User, Video, CheckSquare, CheckCircle, Star, Play, Medal, FileText } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();

  const goToProfileCreation = () => {
    navigate('/profile/create');
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <Button 
          onClick={goToProfileCreation}
          className="flex items-center gap-2"
          aria-label="Create profile with skill demonstrations"
        >
          <UserPlus className="h-4 w-4" />
          Create Profile with Skill Demos
        </Button>
      </div>

      {/* Profile Preview - This shows how it will look after filling in details */}
      <Card className="mb-8 overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-primary/20 to-primary/40 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="h-24 w-24 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center text-gray-400">
              <User className="h-12 w-12" />
            </div>
          </div>
        </div>
        
        <CardHeader className="pt-16">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">John Doe</CardTitle>
              <CardDescription>Full-Stack Developer</CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Profile Verified
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">About</h3>
            <p className="text-muted-foreground text-sm">
              Passionate full-stack developer with 5+ years of experience building web applications with React, Node.js, and cloud technologies. Focused on creating accessible and performant user experiences.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Medal className="h-4 w-4 text-primary" />
              Verified Skills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["React", "TypeScript", "Node.js", "Accessibility"].map((skill, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{skill}</h4>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i}
                          className={`h-4 w-4 ${i < 4 ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex items-center gap-1 h-8">
                      <Play className="h-3 w-3" />
                      View Demo
                    </Button>
                    <Badge variant="secondary" className="flex items-center gap-1 h-6">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Professional Experience
            </h3>
            <div className="space-y-4">
              <div className="border-l-2 border-primary/30 pl-4 py-1">
                <h4 className="font-medium">Senior Developer</h4>
                <p className="text-sm text-muted-foreground">TechCorp Inc. • 2020 - Present</p>
                <p className="text-sm mt-1">
                  Led development of enterprise web applications using React and TypeScript.
                </p>
              </div>
              <div className="border-l-2 border-primary/30 pl-4 py-1">
                <h4 className="font-medium">Frontend Developer</h4>
                <p className="text-sm text-muted-foreground">WebSolutions • 2018 - 2020</p>
                <p className="text-sm mt-1">
                  Built responsive web interfaces and improved accessibility compliance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-6 flex justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Video className="h-4 w-4 text-primary" />
            <span>4 Skill Demonstrations</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckSquare className="h-4 w-4 text-primary" />
            <span>All Skills Verified</span>
          </div>
        </CardFooter>
      </Card>
      
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">About Profile Creation</h3>
        <p className="text-sm text-muted-foreground">
          Create your professional profile with video demonstrations of your skills. Get verified by experts to stand out to employers. Click "Create Profile with Skill Demos" to get started.
        </p>
      </div>
    </div>
  );
};

export default Profile;
