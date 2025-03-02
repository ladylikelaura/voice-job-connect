
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      console.error("Missing ANTHROPIC_API_KEY");
      return new Response(
        JSON.stringify({
          error: "Server configuration error: Missing API key",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { transcriptSummary, enhancedPrompt, fullContext } = await req.json();

    if (!transcriptSummary && !enhancedPrompt) {
      return new Response(
        JSON.stringify({ error: "Missing transcript summary or prompt" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Received request to process CV with Claude");
    
    // Use the enhanced prompt if provided, or fall back to basic prompt
    const promptToUse = enhancedPrompt || 
      `You are a professional CV writer. Create a structured CV based on this interview transcript summary: ${transcriptSummary}. 
      Return ONLY a JSON object with the following structure (no explanation or commentary):
      {
        "personalInfo": {"name": "", "email": "", "phone": "", "location": ""},
        "professionalSummary": "",
        "jobTitle": "",
        "skills": [],
        "experience": [{"role": "", "company": "", "duration": "", "responsibilities": []}],
        "education": [{"degree": "", "institution": "", "year": ""}],
        "certifications": [],
        "languages": []
      }`;

    console.log("Sending request to Claude API");
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        temperature: 0.5,
        system: "You are a professional CV writer. Extract information from interview transcripts to create structured CVs. Always return valid JSON, even with limited information. Make logical inferences where data is missing.",
        messages: [
          {
            role: "user",
            content: promptToUse,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Claude API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Error calling Claude API", details: errorData }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const claudeResponse = await response.json();
    console.log("Received response from Claude API");

    // Extract JSON from Claude's response - it might be embedded in markdown code blocks
    let extractedData;
    try {
      const content = claudeResponse.content[0].text;
      console.log("Raw Claude response:", content);
      
      // Try to extract JSON from markdown code blocks first
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        extractedData = JSON.parse(jsonMatch[1].trim());
      } else {
        // If no code blocks, try to parse the whole response
        extractedData = JSON.parse(content);
      }
      
      console.log("Successfully extracted CV data");
    } catch (error) {
      console.error("Error parsing Claude response:", error);
      console.log("Claude raw response:", claudeResponse.content[0].text);
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse CV data from Claude response",
          rawResponse: claudeResponse.content[0].text 
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ data: extractedData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
