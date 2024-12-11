/// <reference types="phaser" />

declare module "socket.io-client" {
  export interface Socket {
    id: string;
    on(event: string, callback: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
    disconnect(): void;
  }
}

declare function io(): Socket;

interface Window {
  io: typeof io;
}

declare const Phaser: typeof import("phaser");
