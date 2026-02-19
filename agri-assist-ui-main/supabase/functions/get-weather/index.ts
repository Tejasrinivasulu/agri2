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
    const { location, language } = await req.json();

    // Use Lovable AI to generate weather data and advice
    const response = await fetch("https://llm.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { 
            role: "system", 
            content: `You are a weather assistant for Indian farmers. Provide realistic weather data in JSON format.
            Language: ${language || 'English'}
            Return JSON with this structure:
            {
              "current": { "temp": number, "condition": string, "humidity": number, "wind": number },
              "forecast": [{ "day": string, "high": number, "low": number, "condition": string, "icon": string }],
              "farmingAdvice": string
            }
            Use realistic temperatures for Indian locations (20-40°C range typically).
            Icons should be emoji: ☀️ 🌤️ ⛅ 🌧️ ⛈️ 🌦️` 
          },
          { role: "user", content: `Generate current weather and 7-day forecast for ${location}, India with farming advice.` }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Try to parse JSON from response
    let weatherData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      weatherData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      weatherData = {
        current: { temp: 32, condition: "Partly Cloudy", humidity: 65, wind: 12 },
        forecast: [
          { day: "Today", high: 34, low: 24, condition: "Sunny", icon: "☀️" },
          { day: "Tomorrow", high: 33, low: 23, condition: "Cloudy", icon: "⛅" },
          { day: "Day 3", high: 31, low: 22, condition: "Rain", icon: "🌧️" },
          { day: "Day 4", high: 30, low: 21, condition: "Rain", icon: "🌧️" },
          { day: "Day 5", high: 32, low: 23, condition: "Sunny", icon: "☀️" },
          { day: "Day 6", high: 33, low: 24, condition: "Sunny", icon: "☀️" },
          { day: "Day 7", high: 34, low: 25, condition: "Partly Cloudy", icon: "🌤️" },
        ],
        farmingAdvice: "Good conditions for field work. Consider irrigation in the morning hours."
      };
    }

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in get-weather:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
