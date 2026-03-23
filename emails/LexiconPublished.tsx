// Email: sent to all parents after the class lexicon is published
// Includes: class name + link to the published lexicon
import { Html, Text, Button } from '@react-email/components'

interface Props {
  className: string
  lexiconUrl: string
}

export default function LexiconPublished({ className, lexiconUrl }: Props) {
  return (
    <Html>
      <Text>Лексиконът на {className} е готов! Разгледайте спомените заедно.</Text>
      <Button href={lexiconUrl}>Отвори лексикона</Button>
    </Html>
  )
}
