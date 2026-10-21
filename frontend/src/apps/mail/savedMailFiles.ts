import type { EmailItem } from '../../data/commsData';

export function savedMailFiles(emails: EmailItem[], savedIds: string[]) {
  const saved = new Set(savedIds);
  return emails.flatMap(mail => (mail.attachments || []).filter(attachment => !attachment.isReward && saved.has(`${mail.id}_${attachment.id}`)).map(attachment => ({
    id: `mail:${mail.id}:${attachment.id}`, name: attachment.name, type: attachment.name.split('.').at(-1)?.toLowerCase() || 'txt',
    dir: '/downloads/auremail', size: 'Saved copy', desc: attachment.previewTitle || attachment.previewText || 'AureMail attachment',
    publisher: mail.sender, mailId: mail.id,
    body: `${attachment.previewTitle || attachment.name}\n\n${attachment.previewText || ''}\n\n${attachment.provenance || ''}\nVersion: ${attachment.version || 'original'}\n\nSource message: ${mail.subject}\nFrom: ${mail.sender} <${mail.senderAddress || ''}>\n\n${mail.body}`,
  })));
}
