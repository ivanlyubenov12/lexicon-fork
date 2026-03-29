-- Add terminology label columns to template_defaults
alter table template_defaults
  add column if not exists member_label    text not null default 'Ученик',
  add column if not exists group_label     text not null default 'Клас',
  add column if not exists memories_label  text not null default 'Нашите спомени';

-- Add label columns to classes (per-class overrides)
alter table classes
  add column if not exists member_label    text,
  add column if not exists group_label     text,
  add column if not exists memories_label  text;

-- Update existing preset defaults with correct labels
update template_defaults set
  member_label   = 'Ученик',
  group_label    = 'Клас',
  memories_label = 'Нашите спомени'
where preset_id = 'primary';

update template_defaults set
  member_label   = 'Дете',
  group_label    = 'Група',
  memories_label = 'Нашите спомени'
where preset_id = 'kindergarten';

update template_defaults set
  member_label   = 'Ученик',
  group_label    = 'Клас',
  memories_label = 'Нашите спомени'
where preset_id = 'teens';

-- Insert new presets into template_defaults
insert into template_defaults (preset_id, theme_id, bg_pattern, member_label, group_label, memories_label) values
  ('sports',  'adventure', 'none',   'Играч',    'Отбор',  'Нашите победи'),
  ('friends', 'magazine',  'none',   'Приятел',  'Група',  'Нашите моменти')
on conflict (preset_id) do nothing;

-- Seed sports system questions
insert into questions (text, type, allows_text, allows_media, order_index, is_system, preset, voice_display, description, is_featured) values
  ('Любимата ми позиция в отбора е',                         'class_voice', true,  false, 0,  true, 'sports', 'wordcloud',  null, false),
  ('Най-силното качество на нашия отбор е',                   'class_voice', true,  false, 1,  true, 'sports', 'wordcloud',  null, false),
  ('Какво описва нашия отбор с две думи?',                    'class_voice', true,  false, 2,  true, 'sports', 'wordcloud',  null, false),
  ('Преди мач обикновено:',                                   'class_voice', true,  false, 3,  true, 'sports', 'wordcloud',  null, false),
  ('Каква суперсила има нашият треньор?',                     'class_voice', true,  false, 4,  true, 'sports', 'wordcloud',  null, false),
  ('Представи се на отбора',                                  'video',       false, true,  5,  true, 'sports', null,         null, false),
  ('Как попаднах в този отбор',                               'personal',    true,  false, 6,  true, 'sports', null,         null, true),
  ('Моята тайна суперсила на терена е',                       'personal',    true,  false, 7,  true, 'sports', null,         'Какво правиш по специален начин?', true),
  ('Като порасна искам да стана',                             'personal',    true,  false, 8,  true, 'sports', null,         null, true),
  ('Най-яката победа, която помня',                           'personal',    true,  false, 9,  true, 'sports', null,         null, false),
  ('Ако бях животно, щях да съм:',                            'personal',    true,  false, 10, true, 'sports', null,         null, false),
  ('Любимото ми движение/упражнение е',                       'personal',    true,  false, 11, true, 'sports', null,         null, false),
  ('Мечтая да играя в:',                                      'personal',    true,  false, 12, true, 'sports', null,         null, false),
  ('Ако бях треньор за един ден, щях да:',                    'personal',    true,  false, 13, true, 'sports', null,         null, false)
on conflict do nothing;

-- Seed friends system questions
insert into questions (text, type, allows_text, allows_media, order_index, is_system, preset, voice_display, description, is_featured) values
  ('Как се запознахме?',                                      'class_voice', true,  false, 0,  true, 'friends', 'wordcloud', null, false),
  ('Любимото ни място за срещи е',                            'class_voice', true,  false, 1,  true, 'friends', 'wordcloud', null, false),
  ('Какво описва нашата група с две думи?',                   'class_voice', true,  false, 2,  true, 'friends', 'wordcloud', null, false),
  ('Когато сме заедно, най-често:',                           'class_voice', true,  false, 3,  true, 'friends', 'wordcloud', null, false),
  ('Каква суперсила има нашето приятелство?',                 'class_voice', true,  false, 4,  true, 'friends', 'wordcloud', null, false),
  ('Представи се на останалите',                              'video',       false, true,  5,  true, 'friends', null,        null, false),
  ('Как попаднах в тази група',                               'personal',    true,  false, 6,  true, 'friends', null,        null, true),
  ('Моята тайна суперсила е',                                 'personal',    true,  false, 7,  true, 'friends', null,        'Какво правиш по специален начин?', true),
  ('Като порасна искам да стана',                             'personal',    true,  false, 8,  true, 'friends', null,        null, true),
  ('Най-смешният спомен с тези хора е',                       'personal',    true,  false, 9,  true, 'friends', null,        null, false),
  ('Ако бях животно, щях да съм:',                            'personal',    true,  false, 10, true, 'friends', null,        null, false),
  ('Ако бях супергерой, щях да:',                             'personal',    true,  false, 11, true, 'friends', null,        null, false),
  ('Мечтая да отида в:',                                      'personal',    true,  false, 12, true, 'friends', null,        null, false),
  ('Съветът ми към нашата група е:',                          'personal',    true,  false, 13, true, 'friends', null,        null, false)
on conflict do nothing;
