-- Migration 004: Move questions 7, 8, 10 to better_together and renumber

-- Personal tab after change: Q1-Q6 stay, Q9 becomes #7
UPDATE questions SET order_index = 7
WHERE text = 'Какво искаш да станеш, когато пораснеш?' AND is_system = true;

-- Move Q7, Q8, Q10 to better_together and give them new order within class tab
UPDATE questions SET type = 'better_together', order_index = 1
WHERE text = 'Какво е нещото, което те прави специален/а в нашия клас?' AND is_system = true;

UPDATE questions SET type = 'better_together', order_index = 2
WHERE text = 'Кажи нещо хубаво на класа си.' AND is_system = true;

UPDATE questions SET type = 'better_together', order_index = 3
WHERE text = 'Какво е твоето училище за теб?' AND is_system = true;

-- Renumber superhero and existing better_together questions
UPDATE questions SET order_index = 4
WHERE text = 'Ако класната беше супергерой — какви сили би имала?' AND is_system = true;

UPDATE questions SET order_index = 5
WHERE text LIKE 'Едно нещо, което искам да подобря%' AND is_system = true;

UPDATE questions SET order_index = 6
WHERE text LIKE 'Едно нещо, което ценя%' AND is_system = true;
