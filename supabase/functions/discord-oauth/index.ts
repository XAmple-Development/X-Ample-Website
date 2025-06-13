
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid token')
    }

    if (req.method === 'POST') {
      const { code, redirect_uri } = await req.json()
      
      if (!code) {
        throw new Error('Authorization code required')
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('DISCORD_CLIENT_ID') ?? '',
          client_secret: Deno.env.get('DISCORD_CLIENT_SECRET') ?? '',
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirect_uri,
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const tokenData = await tokenResponse.json()

      // Get Discord user info
      const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      })

      if (!userResponse.ok) {
        throw new Error('Failed to get Discord user info')
      }

      const discordUser = await userResponse.json()

      // Calculate expiry date
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()

      // Store or update Discord integration
      const { error: dbError } = await supabaseClient
        .from('discord_integrations')
        .upsert({
          user_id: user.id,
          discord_user_id: discordUser.id,
          discord_username: `${discordUser.username}#${discordUser.discriminator}`,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_type: tokenData.token_type,
          scope: tokenData.scope,
          expires_at: expiresAt,
        })

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error('Failed to store Discord integration')
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          discord_user: {
            id: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatar: discordUser.avatar,
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (req.method === 'DELETE') {
      // Remove Discord integration
      const { error: deleteError } = await supabaseClient
        .from('discord_integrations')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) {
        throw new Error('Failed to remove Discord integration')
      }

      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
