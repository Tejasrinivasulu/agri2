import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, type, language } = await req.json();

    let systemPrompt = `You are a helpful farming assistant for Indian farmers. 
    Respond in ${language || 'English'}. Keep responses concise and farmer-friendly.
    Use simple language that rural farmers can understand.`;

    let userPrompt = query;

    if (type === 'weather') {
      systemPrompt += ` You are providing weather information and farming advice.`;
      userPrompt = `Provide weather-related farming advice for: ${query}`;
    } else if (type === 'crop_prices') {
      systemPrompt += ` You are providing crop market price information.`;
      userPrompt = `Provide crop price information for: ${query}`;
    } else if (type === 'news') {
      systemPrompt += ` You are providing agriculture news updates.`;
      userPrompt = `Provide recent agriculture news for Indian farmers about: ${query}`;
    } else if (type === 'voice') {
      systemPrompt += ` You are a voice assistant helping farmers with their queries.`;
    }

    const response = await fetch("https://llm.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I couldn't process your request. Please try again.";

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in ai-assistant:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
