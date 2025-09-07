export interface KeyboardActions {
  save?: () => void;
  copy?: () => void;
  paste?: () => void;
  undo?: () => void;
  redo?: () => void;
  [key: string]: (() => void) | undefined;
}

export type KeyCombination = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
};

export type ActionName = keyof KeyboardActions;