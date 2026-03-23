// Email: sent to parent when moderator returns an answer for editing
// Includes: child name, question text, moderator note
import { Html, Text } from '@react-email/components'

interface Props {
  studentName: string
  questionText: string
  note: string
  editUrl: string
}

export default function AnswerRejected({ studentName, questionText, note, editUrl }: Props) {
  return (
    <Html>
      <Text>Отговорът на {studentName} на въпроса „{questionText}" е върнат за редакция.</Text>
      <Text>Бележка от модератора: {note}</Text>
    </Html>
  )
}
