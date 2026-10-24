import React, { createContext, useContext } from 'react';
import { useCommsStore, type CommsState } from '../../store/useCommsStore';

// Context exposes the existing shared mailbox, so OS dispatches and AureMail never diverge.
const MailContext = createContext<CommsState | null>(null);
export function MailProvider({ children }: { children: React.ReactNode }) {
  const mailbox = useCommsStore();
  return <MailContext.Provider value={mailbox}>{children}</MailContext.Provider>;
}
export function useMailState<T>(selector: (state: CommsState) => T): T {
  const value = useContext(MailContext);
  if (!value) throw new Error('AureMail must be inside MailProvider.');
  return selector(value);
}
