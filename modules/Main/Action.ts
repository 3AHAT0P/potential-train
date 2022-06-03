export type ActionMoveType = 'MOVE_TO_WEST' | 'MOVE_TO_EAST' | 'MOVE_TO_NORTH' | 'MOVE_TO_SOUTH' | 'MOVE_FORBIDDEN';

export type ActionGlobalType = 'SHOW_HELP' | 'SHOW_MAP' | 'INVENTORY_OPEN' | 'INVENTORY_CLOSE' | 'TAKE_A_REST' | 'OPEN_MAIN_MENU';

export type ActionHandshakeType = 'START_NEW_GAME' | 'DONATE_LINK' | 'MAIN_CONTACT';

export type ActionBattleType = 'ATTACK' | `ATTACK_${number}` | 'EXAMINE' | `EXAMINE_${number}`
  | 'BATTLE_START' | 'BATTLE_WIN' | 'BATTLE_LOSE' | 'BATTLE_LEAVE' | 'BACK';

export type ActionType = 'COMMON' | 'SYSTEM' | 'AUTO'
  | 'CHANGE_SCENARIO' | 'CHANGE_LOCATION'
  | 'DIALOG_START' | 'DIALOG_END'
  | 'TRADE_START' | 'TRADE_END'
  | 'FINISH_SESSION'
  | 'OTHER' | `OTHER_${number}` | 'BACK' | 'RELOAD'
  | 'DEAL_SUCCESS' | 'DEAL_FAILURE' | `BUY_${number}`
  | `INVENTORY_${string}`
  | ActionMoveType
  | ActionGlobalType
  | ActionHandshakeType
  | ActionBattleType;

export interface UserAction {
  id: string;
  text: string;
  type: ActionType;
}
