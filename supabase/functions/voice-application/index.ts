
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

    // Example conversation with the AI agent
    // You'll need to customize this based on your specific agent's configuration
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': ELEVEN_LABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: "Hello! I'm your application assistant. I'll help you create your CV. Please tell me about your professional experience.",
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to interact with ElevenLabs API')
    }

    // For now, return a mock CV (you'll need to implement the actual conversation flow)
    const mockCV = `
Name: [Collected from voice]
Professional Experience:
- Position 1
- Position 2

Skills:
- Skill 1
- Skill 2

Education:
- Degree 1
    `

    return new Response(
      JSON.stringify({
        success: true,
        cv: action === 'stop' ? mockCV : null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
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
