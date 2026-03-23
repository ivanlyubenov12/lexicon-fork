// Email: sent to parent when moderator adds their child to the class
// Includes: child's name + personal invite link /join/[invite_token]
import { Html, Text, Button } from '@react-email/components'

interface Props {
  studentName: string
  inviteUrl: string
}

export default function ParentInvite({ studentName, inviteUrl }: Props) {
  return (
    <Html>
      <Text>Поканени сте да попълните профила на {studentName} в класния лексикон.</Text>
      <Button href={inviteUrl}>Влез и започни</Button>
    </Html>
  )
}
