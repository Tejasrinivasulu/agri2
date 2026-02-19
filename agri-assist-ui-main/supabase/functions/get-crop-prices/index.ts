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
    const { crop, location, language } = await req.json();

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
            content: `You are a crop market price assistant for Indian farmers.
            Language: ${language || 'English'}
            Provide realistic Indian mandi prices in JSON format:
            {
              "crop": string,
              "markets": [
                { 
                  "name": string, 
                  "distance": string, 
                  "minPrice": number, 
                  "maxPrice": number, 
                  "avgPrice": number,
                  "trend": "up" | "down" | "stable"
                }
              ],
              "priceHistory": [{ "date": string, "price": number }],
              "advice": string
            }
            Use realistic Indian rupee prices per quintal.` 
          },
          { role: "user", content: `Get current market prices for ${crop || 'Rice'} near ${location || 'Hyderabad'}, India with price trends and advice.` }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    let priceData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      priceData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      priceData = {
        crop: crop || "Rice",
        markets: [
          { name: "Hyderabad Mandi", distance: "5 km", minPrice: 2100, maxPrice: 2350, avgPrice: 2225, trend: "up" },
          { name: "Secunderabad Market", distance: "12 km", minPrice: 2050, maxPrice: 2300, avgPrice: 2175, trend: "stable" },
          { name: "Warangal Mandi", distance: "145 km", minPrice: 2150, maxPrice: 2400, avgPrice: 2275, trend: "up" },
        ],
        priceHistory: [
          { date: "Dec 15", price: 2180 },
          { date: "Dec 16", price: 2200 },
          { date: "Dec 17", price: 2190 },
          { date: "Dec 18", price: 2220 },
          { date: "Dec 19", price: 2210 },
          { date: "Dec 20", price: 2225 },
          { date: "Dec 21", price: 2240 },
        ],
        advice: "Prices are trending upward. Consider selling at Warangal Mandi for best rates."
      };
    }

    return new Response(JSON.stringify(priceData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in get-crop-prices:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
