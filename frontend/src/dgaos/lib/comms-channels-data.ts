// Department channels, team direct messages, and autonomous agent conversation streams

export interface ChannelMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderTitle: string;
  senderDepartment: 'Investigation' | 'Medical' | 'Intelligence' | 'Government' | 'Operations';
  senderAvatar: string;
  content: string;
  timestamp: string;
  isUrgent?: boolean;
  caseId?: string;
  attachmentName?: string;
}

export interface AgencyChannelDef {
  id: string;
  name: string;
  topic: string;
  department: 'Investigation' | 'Medical' | 'Intelligence' | 'Government' | 'Operations';
  unreadCount: number;
}

export const INITIAL_CHANNELS: AgencyChannelDef[] = [
  {
    id: 'chan-homicide',
    name: '#homicide-investigations',
    topic: 'Major Case Squad & Forensic Crime Scene updates',
    department: 'Investigation',
    unreadCount: 0,
  },
  {
    id: 'chan-medstat',
    name: '#medstat-clinical-icu',
    topic: 'Metro Trauma ICU patient vitals & toxicology consultation',
    department: 'Medical',
    unreadCount: 0,
  },
  {
    id: 'chan-intel',
    name: '#signals-intel-watch',
    topic: 'SIGINT wiretaps, satellite reconnaissance & OSINT tracking',
    department: 'Intelligence',
    unreadCount: 0,
  },
  {
    id: 'chan-executive',
    name: '#executive-briefings',
    topic: 'Cabinet directives, diplomatic cables & legal warrants',
    department: 'Government',
    unreadCount: 0,
  },
  {
    id: 'chan-all-hands',
    name: '#agency-all-hands',
    topic: 'General agency operations and dispatch alerts',
    department: 'Operations',
    unreadCount: 0,
  },
];

export const INITIAL_CHANNEL_MESSAGES: ChannelMessage[] = [];
