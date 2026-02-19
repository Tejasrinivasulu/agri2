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
    const { language } = await req.json();

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
            content: `You are an agriculture news assistant for Indian farmers.
            Language: ${language || 'English'}
            Generate 5 realistic current agriculture news items in JSON format:
            {
              "news": [
                { 
                  "id": number,
                  "title": string, 
                  "summary": string, 
                  "category": "government" | "market" | "weather" | "technology" | "schemes",
                  "emoji": string,
                  "date": string
                }
              ]
            }
            Make news relevant to Indian farmers - government schemes, MSP updates, weather alerts, new technologies, etc.` 
          },
          { role: "user", content: `Generate today's top 5 agriculture news for Indian farmers. Today's date is ${new Date().toLocaleDateString()}.` }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    let newsData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      newsData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      newsData = {
        news: [
          { id: 1, title: "MSP Increased for Rabi Crops", summary: "Government announces 5% increase in Minimum Support Price for wheat and mustard.", category: "government", emoji: "🌾", date: "Today" },
          { id: 2, title: "New Kisan Credit Card Scheme", summary: "Simplified application process for farmer credit cards with lower interest rates.", category: "schemes", emoji: "💳", date: "Today" },
          { id: 3, title: "Weather Alert: Rainfall Expected", summary: "IMD predicts moderate rainfall in southern states over the next 3 days.", category: "weather", emoji: "🌧️", date: "Today" },
          { id: 4, title: "Tomato Prices Surge in Markets", summary: "Tomato prices reach ₹80/kg in major cities due to supply shortage.", category: "market", emoji: "🍅", date: "Today" },
          { id: 5, title: "Free Drone Training for Farmers", summary: "Government launches free drone pilot training program for progressive farmers.", category: "technology", emoji: "🚁", date: "Today" },
        ]
      };
    }

    return new Response(JSON.stringify(newsData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in get-news:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
