import { nanoid } from 'nanoid'
import type { Template } from './types'

function block(type: Template['blocks'][number]['type'], config: Record<string, unknown> = {}) {
  return { id: nanoid(8), type, config }
}

function coreBlocks() {
  return [
    block('hero', {}),
    block('class_voice', { placeholder: 'Какъв е нашият клас?' }),
    block('class_voice', { placeholder: 'Нашият класен е...' }),
    block('polls_grid', {}),
    block('subjects_bar', { placeholder: 'Кой предмет харесваме' }),
    block('subjects_bar', { placeholder: 'Кой предмет е най-труден' }),
    block('events', { limit: 20, style: 'polaroids' }),
  ]
}

export const templatePresets: Template[] = [
  {
    id: 'primary',
    name: 'Начално училище',
    description: 'Лексикон за начален курс — герой, ученици, въпроси, спомени.',
    themeId: 'classic',
    blocks: coreBlocks(),
  },
  {
    id: 'kindergarten',
    name: 'Детска градина',
    description: 'Лексикон за детска градина — снимки, цветове, забавление.',
    themeId: 'classic',
    blocks: coreBlocks(),
  },
  {
    id: 'teens',
    name: 'Тийновете',
    description: 'Лексикон за горен курс — видеа, въпроси, анкети.',
    themeId: 'classic',
    blocks: coreBlocks(),
  },
  // Keep 'classic' as alias for backwards-compatibility with older classes
  {
    id: 'classic',
    name: 'Класика',
    description: 'Класически лексикон.',
    themeId: 'classic',
    blocks: coreBlocks(),
  },
]

export const defaultTemplate = templatePresets[0]
