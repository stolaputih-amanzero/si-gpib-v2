-- Tabel untuk menyimpan challenge sementara (expire 5 menit)
CREATE TABLE IF NOT EXISTS public.webauthn_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    challenge TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query cepat saat verifikasi
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_user ON public.webauthn_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_expires ON public.webauthn_challenges(expires_at);

-- RLS Policies
ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;

-- Hanya user yang bersangkutan yang bisa melihat challenge-nya (untuk keamanan)
CREATE POLICY "Users can view their own challenges"
ON public.webauthn_challenges FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Hanya sistem (via Service Role) yang bisa insert/delete
-- (Kita akan gunakan Service Role di API routes, jadi tidak perlu policy untuk authenticated user untuk insert)
