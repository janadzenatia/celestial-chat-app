
-- Chat messages table for conversation persistence
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fetching user's messages efficiently
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages (user_id, created_at);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view own messages"
ON public.chat_messages FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can insert own messages"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages (clear chat)
CREATE POLICY "Users can delete own messages"
ON public.chat_messages FOR DELETE
USING (auth.uid() = user_id);
