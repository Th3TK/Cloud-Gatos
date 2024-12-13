/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BASE_URL: string;
    // You can add any other environment variables you are using in the project
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }