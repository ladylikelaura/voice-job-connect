
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { PenSquare, UserRound, BadgeCheck, Video, AudioWaveform, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Profile = () => {
  // This is placeholder data for the preview
  const profileData = {
    name: "Jane Smith",
    title: "Front-end Developer",
    email: "jane.smith@example.com",
    location: "San Francisco, CA",
    about: "Passionate front-end developer with expertise in React, TypeScript, and modern web technologies. I love creating intuitive, accessible, and responsive user interfaces.",
    skills: ["React", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS", "Accessibility", "UI/UX Design", "Git"],
    experience: [
      {
        title: "Senior Front-end Developer",
        company: "Tech Solutions Inc.",
        period: "2020 - Present",
        description: "Led development of responsive web applications, mentored junior developers, and implemented best practices for accessibility and performance."
      },
      {
        title: "Front-end Developer",
        company: "Web Creations LLC",
        period: "2017 - 2020",
        description: "Developed and maintained client websites using React and modern JavaScript frameworks."
      }
    ],
    education: [
      {
        degree: "B.S. Computer Science",
        institution: "University of California",
        year: "2017"
      }
    ],
    verifications: [
      {
        skill: "React",
        level: 5,
        by: "Expert Reviewer",
        date: "2023-09-15"
      },
      {
        skill: "Accessibility",
        level: 4,
        by: "Senior Developer",
        date: "2023-08-22"
      }
    ],
    demonstrations: [
      {
        type: "video",
        skill: "React Component Demo",
        url: "https://example.com/demo-video",
        thumbnail: "/placeholder.svg",
        verified: true
      },
      {
        type: "audio",
        skill: "Technical Interview",
        url: "https://example.com/interview-audio",
        thumbnail: "/placeholder.svg",
        verified: false
      },
      {
        type: "image",
        skill: "UI Design Sample",
        url: "/placeholder.svg",
        verified: true
      }
    ]
  };

  // Function to render star ratings
  const renderStars = (level) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={`text-sm ${i < level ? "text-yellow-500" : "text-gray-300"}`}>★</span>
    ));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="default" 
          className="flex items-center gap-2"
          asChild
        >
          <Link to="/profile/create">
            <PenSquare size={18} />
            Create Profile with Skill Demos
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-2 border-primary">
                <AvatarImage src="/placeholder.svg" alt={profileData.name} />
                <AvatarFallback>
                  <UserRound className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl font-bold">{profileData.name}</CardTitle>
                  {profileData.verifications.length > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified Professional
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-muted-foreground">{profileData.title}</p>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>{profileData.email}</p>
                  <p>{profileData.location}</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{profileData.about}</p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => {
                  const isVerified = profileData.verifications.some(v => v.skill === skill);
                  return (
                    <Badge 
                      key={index} 
                      variant={isVerified ? "default" : "secondary"}
                      className={`flex items-center gap-1 ${isVerified ? "pl-1" : ""}`}
                    >
                      {isVerified && <BadgeCheck className="h-3 w-3" />}
                      {skill}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <Separator />

            {profileData.verifications.length > 0 && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Skill Verifications</h3>
                  <div className="space-y-3">
                    {profileData.verifications.map((verification, index) => (
                      <div key={index} className="flex justify-between items-center border rounded-md p-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{verification.skill}</h4>
                            <BadgeCheck className="h-4 w-4 text-green-600" />
                          </div>
                          <p className="text-sm text-muted-foreground">Verified by {verification.by}</p>
                        </div>
                        <div className="flex items-center">
                          {renderStars(verification.level)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {profileData.demonstrations.length > 0 && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Skill Demonstrations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {profileData.demonstrations.map((demo, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="relative aspect-video bg-muted">
                          <div className="absolute inset-0 flex items-center justify-center">
                            {demo.type === "video" && <Video className="h-10 w-10 text-muted-foreground" />}
                            {demo.type === "audio" && <AudioWaveform className="h-10 w-10 text-muted-foreground" />}
                            {demo.type === "image" && <ImageIcon className="h-10 w-10 text-muted-foreground" />}
                          </div>
                          <img 
                            src={demo.thumbnail} 
                            alt={demo.skill}
                            className="w-full h-full object-cover opacity-50" 
                          />
                          {demo.verified && (
                            <Badge 
                              className="absolute top-2 right-2 flex items-center gap-1 bg-green-500"
                            >
                              <BadgeCheck className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-medium">{demo.skill}</h4>
                          <p className="text-xs text-muted-foreground capitalize">{demo.type} Demonstration</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-2">Experience</h3>
              <div className="space-y-4">
                {profileData.experience.map((exp, index) => (
                  <div key={index}>
                    <h4 className="font-medium">{exp.title}</h4>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{exp.company}</span>
                      <span>{exp.period}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Education</h3>
              <div className="space-y-2">
                {profileData.education.map((edu, index) => (
                  <div key={index}>
                    <h4 className="font-medium">{edu.degree}</h4>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{edu.institution}</span>
                      <span>{edu.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
