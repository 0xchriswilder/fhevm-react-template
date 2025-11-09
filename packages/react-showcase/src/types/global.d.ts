// Global type declarations for React showcase

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
      isConnected?: () => boolean;
    };
  }
  
  // Global functions
  function alert(message: string): void;
}

// CDN module declaration for FHEVM SDK
declare module 'https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.js' {
  export function initSDK(): Promise<void>;
  export function createInstance(config: any): Promise<any>;
  export const SepoliaConfig: any;
}

export {};
