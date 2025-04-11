import { Tool } from '../Toolbar';

// Interfaces for our tool state management
export interface ToolState {
  type: Tool;
  options?: Record<string, any>;
}

// Initial state for tool settings
export const initialToolState: Record<string, any> = {
  pencil: {
    // Default pencil options will go here
    thickness: 2,
    color: '#000000',
  }
};

// A tool state manager that can be expanded as needed
export class ToolManager {
  private currentTool: Tool = null;
  private toolOptions: Record<string, any> = { ...initialToolState };

  constructor() {}

  setTool(tool: Tool): void {
    this.currentTool = tool;
  }

  getCurrentTool(): Tool {
    return this.currentTool;
  }

  getToolOptions<T>(tool: Tool): T | undefined {
    if (!tool) return undefined;
    return this.toolOptions[tool] as T;
  }

  updateToolOption(tool: Tool, option: string, value: any): void {
    if (!tool) return;
    
    if (!this.toolOptions[tool]) {
      this.toolOptions[tool] = {};
    }
    
    this.toolOptions[tool][option] = value;
  }
}

export default ToolManager;