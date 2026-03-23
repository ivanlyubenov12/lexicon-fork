-- Migration 005: Add class_voice system questions
insert into questions (text, type, is_system, allows_text, allows_media, order_index) values
  ('Кое е нещото, което харесваш най-много в нашия клас?',              'class_voice', true, true, false, 1),
  ('Ако можеше да промениш едно нещо в класа, какво би направил/а?',    'class_voice', true, true, false, 2);
