
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action } = await req.json()
    const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY')

    if (!ELEVEN_LABS_API_KEY) {
      throw new Error('Missing ElevenLabs API key')
    }

    if (action === 'start') {
      // Generate welcome message using ElevenLabs
      const welcomeText = "Hello! I'm your job application assistant. I'll help you create your CV. Please tell me about your professional experience, skills, and education."
      
      const voiceId = "EXAVITQu4vr4xnSDxMaL" // Sarah voice
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': ELEVEN_LABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: welcomeText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech with ElevenLabs')
      }

      // Convert audio to base64
      const audioBuffer = await response.arrayBuffer()
      const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))

      return new Response(
        JSON.stringify({
          success: true,
          audio: audioBase64,
          message: "Voice application started"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    else if (action === 'stop') {
      // For demonstration purposes, return a sample CV
      // In a real implementation, you would process recorded audio and generate the CV
      const mockCV = `
Name: Job Applicant

Professional Experience:
- Software Engineer at Tech Solutions Inc. (2019-2023)
  * Led development of customer-facing web applications
  * Improved system performance by 40%
  * Mentored junior developers

- Junior Developer at StartUp Co. (2017-2019)
  * Developed and maintained company website
  * Collaborated with design team on UI improvements

Skills:
- Programming Languages: JavaScript, TypeScript, Python
- Frameworks: React, Node.js, Express
- Tools: Git, Docker, AWS
- Soft Skills: Communication, Teamwork, Problem-solving

Education:
- Bachelor of Science in Computer Science, University Tech (2013-2017)
      `

      return new Response(
        JSON.stringify({
          success: true,
          cv: mockCV
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    else {
      throw new Error('Invalid action specified')
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
