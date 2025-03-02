
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { PenSquare } from "lucide-react";

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
    ]
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
            <div>
              <CardTitle className="text-2xl font-bold">{profileData.name}</CardTitle>
              <p className="text-lg text-muted-foreground">{profileData.title}</p>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>{profileData.email}</p>
                <p>{profileData.location}</p>
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
                {profileData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>

            <Separator />

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
