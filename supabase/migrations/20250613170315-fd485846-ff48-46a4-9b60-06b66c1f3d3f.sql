
-- Update the discord_integrations table to properly handle real OAuth tokens
ALTER TABLE discord_integrations 
ADD COLUMN IF NOT EXISTS scope TEXT,
ADD COLUMN IF NOT EXISTS token_type TEXT DEFAULT 'Bearer';

-- Add an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_discord_integrations_user_id ON discord_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_discord_integrations_discord_user_id ON discord_integrations(discord_user_id);
