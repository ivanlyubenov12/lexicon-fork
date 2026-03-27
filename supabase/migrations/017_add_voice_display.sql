-- Add display type for class_voice questions: wordcloud (default) or barchart
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS voice_display TEXT DEFAULT 'wordcloud'
  CHECK (voice_display IN ('wordcloud', 'barchart'));

-- Existing system questions for favourite/hardest subject default to barchart
UPDATE questions
SET voice_display = 'barchart'
WHERE is_system = true
  AND class_id IS NULL
  AND order_index IN (2, 3);
