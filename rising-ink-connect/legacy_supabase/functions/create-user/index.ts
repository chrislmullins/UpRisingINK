// DEPRECATED: This Supabase function is no longer used. Please migrate to a Firebase Cloud Function.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { email, password, fullName, role } = await req.json()

    console.log('Creating user:', { email, fullName, role })

    // For testing purposes, skip authentication checks
    // In production, you would verify the requesting user is an admin here

    // Create the user using admin client
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName,
        role: role
      },
      email_confirm: true // Auto-confirm email for admin-created users
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User created successfully:', newUser.user?.id)

    // Create profile entry
    if (newUser.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: newUser.user.id,
          email: newUser.user.email,
          full_name: fullName,
          role: role
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Don't fail the whole operation, just log the error
      }

      // If creating an artist, also create artist record
      if (role === 'artist') {
        const { error: artistError } = await supabaseAdmin
          .from('artists')
          .insert({
            profile_id: newUser.user.id,
            bio: '',
            is_available: true
          })

        if (artistError) {
          console.error('Error creating artist record:', artistError)
          // Don't fail the whole operation, just log the error
        }
      }

      // If creating a client, also create client record
      if (role === 'client') {
        const { error: clientError } = await supabaseAdmin
          .from('clients')
          .insert({
            profile_id: newUser.user.id
          })

        if (clientError) {
          console.error('Error creating client record:', clientError)
          // Don't fail the whole operation, just log the error
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'User created successfully', 
        user: {
          id: newUser.user?.id,
          email: newUser.user?.email,
          role: role
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
