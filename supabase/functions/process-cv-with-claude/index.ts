
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing CV with Claude API");
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
    
    if (!claudeApiKey) {
      console.error("Missing Claude API key");
      return new Response(
        JSON.stringify({ error: "Missing API key configuration" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { transcriptSummary } = await req.json();

    if (!transcriptSummary || transcriptSummary.length === 0) {
      console.error("Missing transcript summary");
      return new Response(
        JSON.stringify({ error: "Missing transcript summary" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Transcript summary received, calling Claude API");
    
    // Improved prompt for better CV structure
    const systemPrompt = `
      You are an expert CV writer and career counselor who helps create professional CVs. 
      
      Your task is to extract and organize comprehensive information from an interview transcript summary into a well-structured professional CV.
      
      Instructions:
      1. Carefully analyze the transcript to identify key professional details.
      2. Use a formal, professional tone throughout the CV.
      3. Organize information into clear, standardized sections.
      4. Be concise yet comprehensive.
      5. Highlight achievements and skills relevant to the person's profession.
      6. Use professional industry terminology where appropriate.
      7. Format dates, job titles, and other details consistently.

      Your output should be a JSON object with these fields:
      - personalInfo: {name, email, phone, location, linkedIn, website}
      - professionalSummary: A compelling 3-4 sentence summary of their professional background
      - jobTitle: Their current or most recent job title
      - skills: Array of professional skills (aim for 6-12 relevant skills)
      - experience: Array of work experiences, each containing {company, role, duration, responsibilities}
        - For responsibilities, provide 3-5 bullet points per role that highlight achievements
      - education: Array of educational background, each containing {degree, institution, year}
      - certifications: Array of relevant professional certifications
      - languages: Array of languages they speak
      
      If any information is not available in the transcript, make reasonable professional inferences based on context, but DO NOT include completely fictitious details.
    `;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        temperature: 0.2,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Here is the interview transcript summary. Extract the relevant information to create a professional CV:\n\n${transcriptSummary}`
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.text();
      console.error("Claude API error:", errorData);
      throw new Error(`Claude API error: ${claudeResponse.status} ${errorData}`);
    }

    const responseData = await claudeResponse.json();
    console.log("Claude response received");
    
    // Extract the content from Claude's response
    let cvData;
    try {
      // Find the JSON in the response
      const content = responseData.content[0].text;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*}/);
                        
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];
        cvData = JSON.parse(jsonString);
        console.log("Successfully parsed CV data from Claude response");
      } else {
        // Try to extract JSON from the full content
        cvData = JSON.parse(content);
      }
    } catch (error) {
      console.error("Error parsing Claude response:", error);
      console.log("Claude raw response:", responseData.content[0].text);
      
      // Return a simple fallback structure
      return new Response(
        JSON.stringify({ 
          data: {
            personalInfo: { name: "Professional", email: "", phone: "" },
            professionalSummary: "Experienced professional with expertise in their field.",
            jobTitle: "Professional",
            skills: [],
            experience: [],
            education: [],
            certifications: [],
            languages: []
          },
          message: "Error parsing AI response, using fallback structure"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the processed CV data
    return new Response(
      JSON.stringify({ data: cvData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in process-cv-with-claude function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
