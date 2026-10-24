import { MOCK_DOCUMENTS } from '../../data/mockDocuments';

// Only an explicit catalog reference may select a template. Unrelated enclosures
// must keep their own title, provenance and message content.
export function attachmentDocument(attachment: any, mail: any) {
  const template = attachment.mockKey ? MOCK_DOCUMENTS[attachment.mockKey] : undefined;
  const extension = attachment.name.split('.').pop()?.toLowerCase() || 'txt';
  if (template) return { ...template, id: attachment.id, name: attachment.name, filename: attachment.name };
  return { id: attachment.id || 'doc', name: attachment.name, filename: attachment.name, type: extension,
    category: attachment.kind === 'form' ? 'Interactive Civic Form' : 'Mail enclosure',
    meta: { classification: mail?.institutionalSeal || 'Saved correspondence', author: mail?.sender || 'Sender not recorded', timestamp: mail?.time || 'Not recorded', fileSize: 'Saved copy' },
    security: { isEncrypted: Boolean(mail?.encrypted) },
    content: { title: attachment.previewTitle || attachment.name, subtitle: attachment.provenance || attachment.previewText || 'AureMail document enclosure',
      bodyText: `${attachment.previewText || ''}\n\n${attachment.provenance || ''}\nVersion: ${attachment.version || 'original'}\n\nOriginal message: ${mail?.subject || ''}\n${mail?.body || ''}` },
  };
}
