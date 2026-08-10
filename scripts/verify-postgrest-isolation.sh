#!/bin/bash

# Default values if not provided via environment variables
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://your-project.supabase.co}"
ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-your-anon-key-here}"

echo "🔍 Verifying PostgREST Isolation for Public Portal..."

# Test 1: Try to access m_pos_pelkes with anon key
echo ""
echo "Test 1: SELECT from m_pos_pelkes (should fail)"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  "$SUPABASE_URL/rest/v1/m_pos_pelkes?select=id_pos,nama_pos&limit=1"

# Test 2: Try to access t_kerawanan_wilayah with anon key
echo ""
echo "Test 2: SELECT from t_kerawanan_wilayah (should fail)"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  "$SUPABASE_URL/rest/v1/t_kerawanan_wilayah?select=id_risiko&limit=1"

# Test 3: Try to access t_potensi_wilayah with anon key
echo ""
echo "Test 3: SELECT from t_potensi_wilayah (should fail)"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  "$SUPABASE_URL/rest/v1/t_potensi_wilayah?select=id_potensi&limit=1"

# Test 4: Verify public RPC is accessible
echo ""
echo "Test 4: Call get_public_map_data() (should succeed)"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' \
  "$SUPABASE_URL/rest/v1/rpc/get_public_map_data"

echo ""
echo "✅ PostgREST Isolation Verification Complete"
