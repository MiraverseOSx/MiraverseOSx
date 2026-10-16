export type CommsDepartment = 'Investigation' | 'Medical' | 'Intelligence' | 'Government' | 'Operations';
export type MessageKind = 'cable' | 'channel' | 'voicemail' | 'template' | 'call';
export type MessageFolder = 'inbox' | 'sent' | 'drafts' | 'archived' | 'templates';

export interface DirectoryContact {
  id: string;
  name: string;
  title: string;
  department: CommsDepartment;
  extension: string;
  email: string;
  status: string;
  avatar: string;
  dialable: boolean;
  priorityLine: boolean;
}

export interface DirectoryChannel {
  id: string;
  name: string;
  topic: string;
  department: CommsDepartment;
}

export interface DirectoryMessage {
  id: string;
  kind: MessageKind;
  folder: MessageFolder;
  threadId: string;
  channelId?: string;
  contactId?: string;
  senderName: string;
  recipient: string;
  subject: string;
  body: string;
  createdAt: string;
  read: boolean;
  caseId?: string;
  priority: string;
  inReplyTo?: string;
}

export interface CommsTrigger {
  id: string;
  name: string;
  enabled: boolean;
  triggerType: 'reply' | 'delay' | 'keyword';
  delaySeconds: number;
  matchContactId?: string;
  matchThreadId?: string;
  matchKeyword?: string;
  action: {
    kind: MessageKind;
    folder?: MessageFolder;
    contactId?: string;
    channelId?: string;
    senderName: string;
    recipient?: string;
    subject: string;
    body: string;
    caseId?: string;
  };
}

export interface CommsSnapshot {
  contacts: DirectoryContact[];
  channels: DirectoryChannel[];
  messages: DirectoryMessage[];
  events: CommsTrigger[];
}

export async function loadComms(): Promise<CommsSnapshot> {
  const response = await fetch('/api/comms', { cache: 'no-store' });
  if (!response.ok) throw new Error('Communications database is unavailable.');
  return response.json();
}

export async function saveComms(action: string, data: Record<string, unknown>): Promise<CommsSnapshot> {
  const response = await fetch('/api/comms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...data })
  });
  const payload = await response.json() as CommsSnapshot & { error?: string };
  if (!response.ok) throw new Error(payload.error || 'The communications database rejected that change.');
  return payload;
}
