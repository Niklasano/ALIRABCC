
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Edge function team-stats called')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { 
      action, 
      winnerTeam, 
      loserTeam, 
      winnerPlayers, 
      loserPlayers,
      winnerChutesAdverses = 0,
      winnerEpicerieAlarms = 0,
      winnerVousEtesNulsCount = 0,
      loserChutesAdverses = 0
    } = await req.json()
    console.log('Action received:', action)

    if (action === 'leaderboard') {
      console.log('Fetching leaderboard data')
      // Get both team and player leaderboard data ordered by points
      const [teamsResult, playersResult] = await Promise.all([
        supabaseClient
          .from('team_stats')
          .select('*')
          .order('points', { ascending: false })
          .order('victories', { ascending: false })
          .order('team_name', { ascending: true }),
        supabaseClient
          .from('player_stats')
          .select('*')
          .order('points', { ascending: false })
          .order('victories', { ascending: false })
          .order('player_name', { ascending: true })
      ])

      if (teamsResult.error) {
        console.error('Teams error:', teamsResult.error)
        throw teamsResult.error
      }
      if (playersResult.error) {
        console.error('Players error:', playersResult.error)
        throw playersResult.error
      }

      console.log('Leaderboard data fetched successfully')
      return new Response(
        JSON.stringify({ 
          teams: teamsResult.data || [],
          players: playersResult.data || []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'record-victory') {
      console.log('Recording victory for:', winnerTeam, 'vs', loserTeam)

      if (!winnerTeam || !loserTeam) {
        return new Response(
          JSON.stringify({ error: 'Winner and loser team names are required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      // Update team stats with new points system
      const { error: winnerError } = await supabaseClient
        .rpc('upsert_team_victory_with_points', { 
          team_name_param: winnerTeam,
          opponent_chutes: winnerChutesAdverses,
          epicerie_alarms: winnerEpicerieAlarms,
          vous_etes_nuls_malus: winnerVousEtesNulsCount
        })

      if (winnerError) {
        console.error('Winner error:', winnerError)
        throw winnerError
      }

      const { error: loserError } = await supabaseClient
        .rpc('upsert_team_game_with_points', { 
          team_name_param: loserTeam,
          opponent_chutes: loserChutesAdverses
        })

      if (loserError) {
        console.error('Loser error:', loserError)
        throw loserError
      }

      // Update player stats if provided
      if (winnerPlayers && Array.isArray(winnerPlayers)) {
        for (const player of winnerPlayers) {
          if (player && typeof player === 'string') {
            const { error } = await supabaseClient
              .rpc('upsert_player_victory_with_points', { 
                player_name_param: player,
                team_name_param: winnerTeam,
                opponent_chutes: winnerChutesAdverses,
                epicerie_alarms: winnerEpicerieAlarms,
                vous_etes_nuls_malus: winnerVousEtesNulsCount
              })
            if (error) throw error
          }
        }
      }

      if (loserPlayers && Array.isArray(loserPlayers)) {
        for (const player of loserPlayers) {
          if (player && typeof player === 'string') {
            const { error } = await supabaseClient
              .rpc('upsert_player_game_with_points', { 
                player_name_param: player,
                team_name_param: loserTeam,
                opponent_chutes: loserChutesAdverses
              })
            if (error) throw error
          }
        }
      }

      console.log('Victory recorded successfully')
      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'reset-stats') {
      console.log('Resetting all stats')
      const { error } = await supabaseClient
        .rpc('reset_all_stats')

      if (error) {
        console.error('Reset error:', error)
        throw error
      }

      console.log('Stats reset successfully')
      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
