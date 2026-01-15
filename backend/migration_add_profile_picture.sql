-- Migration script to add profile_picture column to users table
-- Run this script if the column doesn't exist or needs to be changed from VARCHAR to TEXT

-- Check if column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'profile_picture'
    ) THEN
        ALTER TABLE users ADD COLUMN profile_picture TEXT;
    ELSE
        -- If column exists but is VARCHAR, change it to TEXT
        ALTER TABLE users ALTER COLUMN profile_picture TYPE TEXT;
    END IF;
END $$;
