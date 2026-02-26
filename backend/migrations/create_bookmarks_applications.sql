-- ================================================================
-- CareerLens: Bookmarks + Applications tables
-- Run this ONCE in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Safe to re-run — uses IF NOT EXISTS everywhere
-- ================================================================

-- 1. Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, internship_id)
);

-- 2. Applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn')),
    notes TEXT DEFAULT '',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, internship_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(user_id, status);

-- RLS policies (enable row-level security)
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (safe to run even if they don't exist)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users manage own bookmarks" ON bookmarks;
    DROP POLICY IF EXISTS "Users manage own applications" ON applications;
    DROP POLICY IF EXISTS "Service role full access bookmarks" ON bookmarks;
    DROP POLICY IF EXISTS "Service role full access applications" ON applications;
END $$;

-- Users can see/manage their own rows (when using anon/user JWT)
CREATE POLICY "Users manage own bookmarks" ON bookmarks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own applications" ON applications
    FOR ALL USING (auth.uid() = user_id);

-- Service role (backend) gets full access — this is critical!
CREATE POLICY "Service role full access bookmarks" ON bookmarks
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access applications" ON applications
    FOR ALL USING (auth.role() = 'service_role');
