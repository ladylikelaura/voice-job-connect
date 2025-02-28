
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
      // Get the signed URL from ElevenLabs for the conversation
      const response = await fetch('https://api.elevenlabs.io/v1/convai/conversation/get_signed_url', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', errorText);
        throw new Error('Failed to get signed URL from ElevenLabs');
      }

      const data = await response.json();
      
      return new Response(
        JSON.stringify({
          success: true,
          signedUrl: data.signed_url,
          message: "Voice application initialized"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    else if (action === 'stop') {
      // In a real implementation, you would properly end the ElevenLabs session
      // For now, we just return a message indicating the session ended
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Voice application session ended"
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
