import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const instantlyApiKey = Deno.env.get('INSTANTLY_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!instantlyApiKey || !openaiApiKey) {
      throw new Error("Missing API keys in environment.");
    }

    // 1. Fetch active outbound experiments from MIOS
    // Assuming outbound experiments use a specific primary metric and have the Instantly Campaign ID stored in campaign_id
    const { data: experiments, error: fetchError } = await supabaseClient
      .from('experiments')
      .select('id, test_code, campaign_id, control_name, variant_a_name, variant_b_name')
      .in('primary_metric', ['open_rate', 'reply_rate', 'meeting_rate', 'acceptance_rate'])
      .eq('status', 'running')
      .not('campaign_id', 'is', null);

    if (fetchError) throw fetchError;
    if (!experiments || experiments.length === 0) {
      return new Response(JSON.stringify({ message: "No active outbound experiments found." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const updates = [];

    // Process each active experiment
    for (const exp of experiments) {
      // 2. Fetch raw analytics from Instantly for this campaign
      // Using Instantly's v1 analytics endpoint
      const instantlyRes = await fetch(`https://api.instantly.ai/api/v1/analytics/campaign/summary?api_key=${instantlyApiKey}&campaign_id=${exp.campaign_id}`);
      
      if (!instantlyRes.ok) {
        console.error(`Failed to fetch Instantly stats for ${exp.campaign_id}`);
        continue;
      }
      
      const rawInstantlyData = await instantlyRes.json();

      // 3. Pass raw payload to the AI Agent (OpenAI) to extract standard metrics
      // This makes the pipeline resilient to Instantly changing their JSON schema.
      const aiPrompt = `
        You are a data extraction agent for MIOS. 
        Extract the performance metrics from the following raw JSON payload from an email marketing tool.
        
        The variants being tested are:
        - Control: "${exp.control_name}"
        - Variant A: "${exp.variant_a_name}"
        ${exp.variant_b_name ? `- Variant B: "${exp.variant_b_name}"` : ''}
        
        Raw Payload:
        ${JSON.stringify(rawInstantlyData)}
        
        If the payload does not break down by variants, output the total numbers into the Control variant and leave the others at 0.
        
        Respond ONLY with a JSON object in this exact format:
        {
          "control": { "sent": 0, "opened": 0, "replied": 0 },
          "variant_a": { "sent": 0, "opened": 0, "replied": 0 },
          "variant_b": { "sent": 0, "opened": 0, "replied": 0 }
        }
      `;

      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: aiPrompt }],
          response_format: { type: "json_object" },
          temperature: 0
        })
      });

      if (!aiRes.ok) {
        console.error(`AI extraction failed for ${exp.id}`);
        continue;
      }

      const aiData = await aiRes.json();
      const extractedMetrics = JSON.parse(aiData.choices[0].message.content);

      // 4. Update the MIOS database directly
      const { error: updateError } = await supabaseClient
        .from('experiments')
        .update({
          control_impressions: extractedMetrics.control.sent,
          control_clicks: extractedMetrics.control.opened,
          control_conversions: extractedMetrics.control.replied,
          variant_a_impressions: extractedMetrics.variant_a.sent,
          variant_a_clicks: extractedMetrics.variant_a.opened,
          variant_a_conversions: extractedMetrics.variant_a.replied,
          variant_b_impressions: extractedMetrics.variant_b?.sent || 0,
          variant_b_clicks: extractedMetrics.variant_b?.opened || 0,
          variant_b_conversions: extractedMetrics.variant_b?.replied || 0,
        })
        .eq('id', exp.id);

      if (updateError) {
        console.error(`Failed to update DB for ${exp.id}`, updateError);
      } else {
        updates.push({ id: exp.id, code: exp.test_code, status: 'success' });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Sync completed.", 
      updates 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
