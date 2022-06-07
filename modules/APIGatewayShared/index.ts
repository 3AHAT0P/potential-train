import type { UserAction } from '../Main/Action';

interface _MessageContainer {
  sessionId: string;
}

export type MessageContainer = _MessageContainer & (
  {
    messageType: 'FROM_CLIENT';
    message: ActionFromClient;
  } | {
    messageType: 'TO_CLIENT';
    message: ActionToClient;
  } | {
    messageType: 'SYSTEM';
    message: 'CONNECTED' | 'DISCONNECTED';
  }
);

export interface ActionFromClient {
  action: UserAction['id'];
}

export interface ActionToClient {
  text: string;
  needAnswer: boolean;
  userActLayout: UserAction[][];
}
