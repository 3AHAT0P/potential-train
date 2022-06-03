import type { UserAction } from '../Main/Action';

export interface ActionFromClient {
  action: UserAction['id'];
}

export interface ActionToClient {
  text: string;
  needAnswer: boolean;
  userActLayout: UserAction[][];
}
