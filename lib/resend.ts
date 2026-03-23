// Helper: Resend email sending
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Един неразделен клас <noreply@resend.dev>'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

export async function sendParentInviteEmail(to: string, studentName: string, inviteToken: string) {
  const inviteUrl = `${BASE_URL}/join/${inviteToken}`

  await resend.emails.send({
    from: FROM,
    to: [to],
    subject: `Поканени сте да попълните профила на ${studentName}`,
    html: `
      <p>Здравейте,</p>
      <p>Поканени сте да попълните профила на <strong>${studentName}</strong> в <em>Един неразделен клас</em>.</p>
      <p><a href="${inviteUrl}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Влез и започни</a></p>
      <p style="color:#9ca3af;font-size:12px;">Линкът работи завинаги — можете да се върнете по всяко време.</p>
    `,
  })
}

export async function sendAnswerRejectedEmail(
  to: string,
  studentName: string,
  questionText: string,
  note: string
) {
  await resend.emails.send({
    from: FROM,
    to: [to],
    subject: `Отговор на ${studentName} е върнат за редакция`,
    html: `
      <p>Здравейте,</p>
      <p>Модераторът върна отговора на <strong>${studentName}</strong> на въпроса:</p>
      <blockquote style="border-left:3px solid #e5e7eb;padding-left:12px;color:#374151;margin:12px 0;">${questionText}</blockquote>
      <p><strong>Бележка от модератора:</strong></p>
      <blockquote style="border-left:3px solid #fbbf24;padding-left:12px;color:#374151;margin:12px 0;">${note}</blockquote>
      <p>Влезте в профила на детето, за да редактирате отговора.</p>
    `,
  })
}

export async function sendLexiconPublishedEmail(
  recipients: Array<{ email: string; studentName: string }>,
  classId: string,
  className: string
) {
  const classUrl = `${BASE_URL}/class/${classId}`

  for (const r of recipients) {
    try {
      await resend.emails.send({
        from: FROM,
        to: [r.email],
        subject: `„Един неразделен клас" на ${className} е готов!`,
        html: `
          <p>Здравейте,</p>
          <p>Дигиталният спомен на <strong>${className}</strong> е публикуван!</p>
          <p>Вече можете да разгледате профила на <strong>${r.studentName}</strong> и целия клас.</p>
          <p>
            <a href="${classUrl}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;">
              Виж лексикона →
            </a>
          </p>
          <p style="color:#9ca3af;font-size:12px;">Линкът работи завинаги — запазете го за спомен.</p>
        `,
      })
    } catch {
      // Continue sending to remaining parents even if one fails
    }
  }
}
