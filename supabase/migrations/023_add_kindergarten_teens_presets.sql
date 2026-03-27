-- Seed kindergarten and teens presets by copying primary questions
INSERT INTO questions (text, type, allows_text, allows_media, order_index, is_system, preset, voice_display, description, is_featured)
SELECT text, type, allows_text, allows_media, order_index, true, 'kindergarten', voice_display, description, is_featured
FROM questions
WHERE is_system = true AND preset = 'primary';

INSERT INTO questions (text, type, allows_text, allows_media, order_index, is_system, preset, voice_display, description, is_featured)
SELECT text, type, allows_text, allows_media, order_index, true, 'teens', voice_display, description, is_featured
FROM questions
WHERE is_system = true AND preset = 'primary';
