
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

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
    // Parse the request body
    const { transcriptSummary } = await req.json();

    if (!transcriptSummary || transcriptSummary.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing transcript summary" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing transcript summary with Claude API");
    
    // Call Claude API to process the transcript
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `I need you to analyze this interview transcript summary and extract structured information for a professional CV/resume. Format your response as JSON with the following fields:
            
            - personalInfo: object with name, email, phone
            - professionalSummary: string with 2-3 sentences describing the candidate
            - jobTitle: main job title/role
            - skills: array of technical and soft skills
            - experience: array of work experiences with company, role, duration, and key responsibilities
            - education: array of education items with degree, institution, year
            - certifications: array of any certifications mentioned
            - languages: array of languages spoken
            
            Here is the transcript summary:
            
            ${transcriptSummary}
            
            Respond with ONLY the JSON object, no additional text.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to process with Claude API", details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const claudeResponse = await response.json();
    let processedCV;
    
    try {
      // Extract the JSON from Claude's response
      const content = claudeResponse.content;
      if (Array.isArray(content) && content.length > 0) {
        // Find the text block in the response
        const textBlock = content.find(block => block.type === 'text');
        if (textBlock && textBlock.text) {
          // Try to parse the JSON from the text
          processedCV = JSON.parse(textBlock.text.trim());
        }
      }
      
      if (!processedCV) {
        throw new Error("Could not extract valid JSON from Claude response");
      }
    } catch (error) {
      console.error("Error parsing Claude response:", error);
      return new Response(
        JSON.stringify({ error: "Failed to parse Claude API response", details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: processedCV }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
