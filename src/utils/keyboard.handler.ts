// utils/keyboardHandler.ts
import { KeyboardActions } from '../types/keyboard';

const keyboardActions: Required<Omit<KeyboardActions, string | number | symbol>> = {
  save: (): void => {
    console.log('Save operation triggered (Ctrl+S or Cmd+S)');
    // Add your save logic here
  },
  
  copy: (): void => {
    console.log('Copy operation triggered (Ctrl+C or Cmd+C)');
    // Add your copy logic here
  },
  
  paste: (): void => {
    console.log('Paste operation triggered (Ctrl+V or Cmd+V)');
    // Add your paste logic here
  },
  
  undo: (): void => {
    console.log('Undo operation triggered (Ctrl+Z or Cmd+Z)');
    // Add your undo logic here
  },
  
  redo: (): void => {
    console.log('Redo operation triggered (Ctrl+Y or Cmd+Shift+Z)');
    // Add your redo logic here
  }
};

export const handleKeyboardShortcuts = (
  event: KeyboardEvent,
  customActions: KeyboardActions = {}
): void => {
  // Type-safe merge of actions
  const actions: KeyboardActions = { ...keyboardActions, ...customActions };
  
  // Handle Ctrl/Cmd key combinations
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 's':
        event.preventDefault();
        actions.save?.();
        break;
        
      case 'c':
        if (!event.shiftKey) {
          event.preventDefault();
          actions.copy?.();
        }
        break;
        
      case 'v':
        event.preventDefault();
        actions.paste?.();
        break;
        
      case 'z':
        event.preventDefault();
        if (event.shiftKey && event.metaKey) {
          // Cmd+Shift+Z (redo on Mac)
          actions.redo?.();
        } else {
          actions.undo?.();
        }
        break;
        
      case 'y':
        if (event.ctrlKey) {
          // Ctrl+Y (redo on Windows)
          event.preventDefault();
          actions.redo?.();
        }
        break;
        
      default:
        // Handle any other custom shortcuts
        break;
    }
  }
  
  // Handle other key combinations (Alt, Shift, etc.)
  if (event.altKey) {
    switch (event.key.toLowerCase()) {
      case 'f4':
        event.preventDefault();
        console.log('Alt+F4 pressed');
        break;
        
      default:
        break;
    }
  }
};

export default handleKeyboardShortcuts;
