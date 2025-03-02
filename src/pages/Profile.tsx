
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { PenSquare, UserRound, BadgeCheck, Video, AudioWaveform, Image as ImageIcon, Star, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAccessibilitySettings } from "@/components/voiceApplication/useAccessibilitySettings";
import { AccessibilityControls } from "@/components/voiceApplication/AccessibilityControls";

const Profile = () => {
  // Integrate accessibility settings
  const { 
    isScreenReaderMode, 
    highContrast, 
    toggleScreenReaderMode, 
    toggleHighContrast, 
    keyboardShortcuts, 
    lastAnnouncement, 
    announce 
  } = useAccessibilitySettings();

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
    ],
    // New reviews data
    reviews: [
      {
        text: "Jane is an exceptional developer with a strong eye for detail. Her React skills are outstanding, and she consistently delivers high-quality work on time.",
        rating: 5,
        reviewerName: "Michael Johnson",
        reviewerPosition: "CTO",
        reviewerCompany: "Tech Innovations Ltd",
        reviewerEmail: "michael.johnson@techinnovations.com",
        verified: true,
        date: "2023-11-10"
      },
      {
        text: "Working with Jane was a pleasure. She quickly understood our requirements and implemented solutions that exceeded our expectations.",
        rating: 5,
        reviewerName: "Sarah Williams",
        reviewerPosition: "Product Manager",
        reviewerCompany: "Digital Products Inc",
        reviewerEmail: "s.williams@digitalproducts.com",
        verified: true,
        date: "2023-08-05"
      },
      {
        text: "Jane's expertise in responsive design and accessibility best practices made our application much more inclusive and user-friendly.",
        rating: 4,
        reviewerName: "David Chen",
        reviewerPosition: "UX Director",
        reviewerCompany: "User Experience Group",
        reviewerEmail: "david.chen@uxgroup.org",
        verified: true,
        date: "2023-05-22"
      }
    ]
  };

  // Function to render star ratings
  const renderStars = (level) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={`text-sm ${i < level ? "text-yellow-500" : "text-gray-300"}`} aria-hidden="true">★</span>
    ));
  };

  // Accessible star rating with screen reader text
  const renderAccessibleRating = (level, maxLevel = 5) => {
    return (
      <div className="flex items-center" role="img" aria-label={`Rating: ${level} out of ${maxLevel} stars`}>
        {renderStars(level)}
        <span className="sr-only">{level} out of {maxLevel} stars</span>
      </div>
    );
  };

  return (
    <div 
      className={`container mx-auto py-8 px-4 ${highContrast ? "bg-black text-white" : ""}`}
      role="main"
      aria-labelledby="profile-heading"
      tabIndex={-1}
    >
      <div className="flex flex-col gap-4">
        <h1 id="profile-heading" className="sr-only">Professional Profile</h1>
        
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <Button 
            variant="default" 
            className="flex items-center gap-2"
            asChild
            aria-label="Create professional profile with skill demonstrations"
          >
            <Link to="/profile/create">
              <PenSquare size={18} aria-hidden="true" />
              Create Profile with Skill Demos
            </Link>
          </Button>
          
          {/* Accessibility Controls */}
          <div className="w-full md:w-auto">
            <AccessibilityControls
              isScreenReaderMode={isScreenReaderMode}
              highContrast={highContrast}
              toggleScreenReaderMode={toggleScreenReaderMode}
              toggleHighContrast={toggleHighContrast}
              keyboardShortcuts={keyboardShortcuts}
              lastAnnouncement={lastAnnouncement}
            />
          </div>
        </div>

        <Card className={`mb-8 ${highContrast ? "border-white bg-black" : ""}`}>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-primary" aria-hidden="true">
                  <AvatarImage src="/placeholder.svg" alt="" />
                  <AvatarFallback>
                    <UserRound className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle 
                      id="profile-name" 
                      className={`text-2xl font-bold ${highContrast ? "text-white" : ""}`}
                    >
                      {profileData.name}
                    </CardTitle>
                    {profileData.verifications.length > 0 && (
                      <Badge 
                        variant={highContrast ? "outline" : "outline"} 
                        className={`flex items-center gap-1 ${
                          highContrast 
                            ? "bg-blue-900 text-white border-white" 
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}
                      >
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Verified Professional</span>
                      </Badge>
                    )}
                  </div>
                  <p 
                    className={`text-lg ${highContrast ? "text-gray-300" : "text-muted-foreground"}`}
                    id="profile-title"
                  >
                    {profileData.title}
                  </p>
                  <div className={`mt-2 text-sm ${highContrast ? "text-gray-300" : "text-muted-foreground"}`}>
                    <p>
                      <span className="sr-only">Email: </span>
                      {profileData.email}
                    </p>
                    <p>
                      <span className="sr-only">Location: </span>
                      {profileData.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <section aria-labelledby="about-heading">
                <h2 id="about-heading" className={`text-lg font-semibold mb-2 ${highContrast ? "text-white" : ""}`}>About</h2>
                <p className={highContrast ? "text-gray-300" : "text-muted-foreground"}>{profileData.about}</p>
              </section>

              <Separator className={highContrast ? "bg-gray-500" : ""} />

              <section aria-labelledby="skills-heading">
                <h2 id="skills-heading" className={`text-lg font-semibold mb-2 ${highContrast ? "text-white" : ""}`}>Skills</h2>
                <div className="flex flex-wrap gap-2" role="list">
                  {profileData.skills.map((skill, index) => {
                    const isVerified = profileData.verifications.some(v => v.skill === skill);
                    return (
                      <Badge 
                        key={index} 
                        variant={isVerified ? "default" : "secondary"}
                        className={`flex items-center gap-1 ${isVerified ? "pl-1" : ""} ${
                          highContrast && isVerified ? "bg-blue-700" : ""
                        } ${highContrast && !isVerified ? "bg-gray-700 text-white" : ""}`}
                        role="listitem"
                      >
                        {isVerified && <BadgeCheck className="h-3 w-3" aria-label="Verified" />}
                        {skill}
                      </Badge>
                    );
                  })}
                </div>
              </section>

              <Separator className={highContrast ? "bg-gray-500" : ""} />

              {profileData.verifications.length > 0 && (
                <>
                  <section aria-labelledby="verifications-heading">
                    <h2 id="verifications-heading" className={`text-lg font-semibold mb-2 ${highContrast ? "text-white" : ""}`}>Skill Verifications</h2>
                    <div className="space-y-3" role="list">
                      {profileData.verifications.map((verification, index) => (
                        <div 
                          key={index} 
                          className={`flex justify-between items-center border rounded-md p-3 ${
                            highContrast ? "border-gray-500 bg-gray-900" : ""
                          }`}
                          role="listitem"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`font-medium ${highContrast ? "text-white" : ""}`}>{verification.skill}</h3>
                              <BadgeCheck className={`h-4 w-4 ${highContrast ? "text-blue-400" : "text-green-600"}`} aria-label="Verified" />
                            </div>
                            <p className={`text-sm ${highContrast ? "text-gray-300" : "text-muted-foreground"}`}>
                              Verified by {verification.by} on {new Date(verification.date).toLocaleDateString()}
                            </p>
                          </div>
                          {renderAccessibleRating(verification.level)}
                        </div>
                      ))}
                    </div>
                  </section>
                  <Separator className={highContrast ? "bg-gray-500" : ""} />
                </>
              )}

              {/* Verified Reviews section */}
              {profileData.reviews && profileData.reviews.length > 0 && (
                <>
                  <section aria-labelledby="reviews-heading">
                    <h2 id="reviews-heading" className={`text-lg font-semibold mb-2 ${highContrast ? "text-white" : ""}`}>Verified Reviews</h2>
                    <div className="space-y-4" role="list">
                      {profileData.reviews.map((review, index) => (
                        <Card 
                          key={index} 
                          className={`overflow-hidden ${highContrast ? "bg-gray-900 border-gray-500" : ""}`}
                          role="listitem"
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={`font-medium ${highContrast ? "text-white" : ""}`}>{review.reviewerName}</h3>
                                  {review.verified && (
                                    <Badge 
                                      variant="outline" 
                                      className={`flex items-center gap-1 ${
                                        highContrast 
                                          ? "bg-blue-900 text-white border-gray-300" 
                                          : "bg-blue-50 text-blue-700 border-blue-200"
                                      }`}
                                    >
                                      <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                                      <span>Verified</span>
                                    </Badge>
                                  )}
                                </div>
                                <p className={`text-sm ${highContrast ? "text-gray-300" : "text-muted-foreground"}`}>
                                  {review.reviewerPosition} at {review.reviewerCompany}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Mail className={`h-3 w-3 ${highContrast ? "text-gray-300" : "text-muted-foreground"}`} aria-hidden="true" />
                                  <span className={`text-xs ${highContrast ? "text-gray-300" : "text-muted-foreground"}`} aria-label="Work email">
                                    {review.reviewerEmail}
                                  </span>
                                </div>
                              </div>
                              {renderAccessibleRating(review.rating)}
                            </div>
                            <p className={`text-sm mt-2 ${highContrast ? "text-gray-200" : ""}`}>{review.text}</p>
                            <p className={`text-xs ${highContrast ? "text-gray-400" : "text-muted-foreground"} mt-2`}>
                              Reviewed on {new Date(review.date).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                  <Separator className={highContrast ? "bg-gray-500" : ""} />
                </>
              )}

              {profileData.demonstrations.length > 0 && (
                <>
                  <section aria-labelledby="demos-heading">
                    <h2 id="demos-heading" className={`text-lg font-semibold mb-2 ${highContrast ? "text-white" : ""}`}>Skill Demonstrations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="list">
                      {profileData.demonstrations.map((demo, index) => (
                        <Card 
                          key={index} 
                          className={`overflow-hidden ${highContrast ? "bg-gray-900 border-gray-500" : ""}`}
                          role="listitem"
                        >
                          <div className="relative aspect-video bg-muted">
                            <div className="absolute inset-0 flex items-center justify-center">
                              {demo.type === "video" && <Video className={`h-10 w-10 ${highContrast ? "text-gray-300" : "text-muted-foreground"}`} aria-hidden="true" />}
                              {demo.type === "audio" && <AudioWaveform className={`h-10 w-10 ${highContrast ? "text-gray-300" : "text-muted-foreground"}`} aria-hidden="true" />}
                              {demo.type === "image" && <ImageIcon className={`h-10 w-10 ${highContrast ? "text-gray-300" : "text-muted-foreground"}`} aria-hidden="true" />}
                            </div>
                            <img 
                              src={demo.thumbnail} 
                              alt={`Thumbnail for ${demo.skill} ${demo.type} demonstration`}
                              className="w-full h-full object-cover opacity-50" 
                            />
                            {demo.verified && (
                              <Badge 
                                className={`absolute top-2 right-2 flex items-center gap-1 ${
                                  highContrast ? "bg-blue-700" : "bg-green-500"
                                }`}
                                aria-label="Verified demonstration"
                              >
                                <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                                <span>Verified</span>
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-3">
                            <h3 className={`font-medium ${highContrast ? "text-white" : ""}`}>{demo.skill}</h3>
                            <p className={`text-xs ${highContrast ? "text-gray-300" : "text-muted-foreground"} capitalize`}>
                              {demo.type} Demonstration
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                  <Separator className={highContrast ? "bg-gray-500" : ""} />
                </>
              )}

              <section aria-labelledby="experience-heading">
                <h2 id="experience-heading" className={`text-lg font-semibold mb-2 ${highContrast ? "text-white" : ""}`}>Experience</h2>
                <div className="space-y-4" role="list">
                  {profileData.experience.map((exp, index) => (
                    <div key={index} role="listitem">
                      <h3 className={`font-medium ${highContrast ? "text-white" : ""}`}>{exp.title}</h3>
                      <div className={`flex justify-between text-sm ${highContrast ? "text-gray-300" : "text-muted-foreground"}`}>
                        <span>{exp.company}</span>
                        <span>{exp.period}</span>
                      </div>
                      <p className={`mt-1 text-sm ${highContrast ? "text-gray-300" : "text-muted-foreground"}`}>{exp.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <Separator className={highContrast ? "bg-gray-500" : ""} />

              <section aria-labelledby="education-heading">
                <h2 id="education-heading" className={`text-lg font-semibold mb-2 ${highContrast ? "text-white" : ""}`}>Education</h2>
                <div className="space-y-2" role="list">
                  {profileData.education.map((edu, index) => (
                    <div key={index} role="listitem">
                      <h3 className={`font-medium ${highContrast ? "text-white" : ""}`}>{edu.degree}</h3>
                      <div className={`flex justify-between text-sm ${highContrast ? "text-gray-300" : "text-muted-foreground"}`}>
                        <span>{edu.institution}</span>
                        <span>{edu.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
        
        {/* Screen reader announcements */}
        {isScreenReaderMode && (
          <div className="sr-only" aria-live="polite" role="status">
            {lastAnnouncement}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
