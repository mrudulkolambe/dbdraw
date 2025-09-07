// hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';
import { KeyboardActions } from '../types/keyboard';
import handleKeyboardShortcuts from '@/utils/keyboard.handler';

export const useKeyboardShortcuts = (
  customActions: KeyboardActions = {},
  isEnabled: boolean = true
): void => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      handleKeyboardShortcuts(event, customActions);
    };

    document.addEventListener('keydown', handleKeyDown);

    return (): void => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [customActions, isEnabled]);
};

export default useKeyboardShortcuts;
