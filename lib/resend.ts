// Helper: Resend email sending
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Малки спомени <noreply@resend.dev>'
const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export async function sendParentInviteEmail(to: string, studentName: string, inviteToken: string) {
  const inviteUrl = `${BASE_URL}/join/${inviteToken}`

  await resend.emails.send({
    from: FROM,
    to: [to],
    subject: `Поканени сте да попълните профила на ${studentName}`,
    html: `
      <p>Здравейте,</p>
      <p>Поканени сте да попълните профила на <strong>${studentName}</strong> в <em>Малки спомени</em>.</p>
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

export async function sendReminderEmail(
  to: string,
  studentName: string,
  studentId: string,
  daysLeft: number
) {
  const wizardUrl = `${BASE_URL}/my/${studentId}/wizard`
  const urgency = daysLeft <= 2

  await resend.emails.send({
    from: FROM,
    to: [to],
    subject: urgency
      ? `⏰ Само ${daysLeft} ${daysLeft === 1 ? 'ден' : 'дни'} остават — попълнете профила на ${studentName}`
      : `Напомняне: ${daysLeft} дни до края — профилът на ${studentName}`,
    html: `
      <p>Здравейте,</p>
      <p>${urgency ? '<strong>Бързайте!</strong> О' : 'О'}стават само <strong>${daysLeft} ${daysLeft === 1 ? 'ден' : 'дни'}</strong> до крайния срок за попълване на <em>Малки спомени</em>.</p>
      <p>Профилът на <strong>${studentName}</strong> все още не е напълно попълнен.</p>
      <p>
        <a href="${wizardUrl}" style="background:${urgency ? '#dc2626' : '#4f46e5'};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold;">
          Попълни сега →
        </a>
      </p>
      <p style="color:#9ca3af;font-size:12px;">Отнема само няколко минути.</p>
    `,
  })
}

export async function sendLexiconPublishedEmail(
  recipients: Array<{ email: string; studentName: string }>,
  classId: string,
  className: string
) {
  const classUrl = `${BASE_URL}/lexicon/${classId}`

  for (const r of recipients) {
    try {
      await resend.emails.send({
        from: FROM,
        to: [r.email],
        subject: `„Малки спомени" на ${className} е готов!`,
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
