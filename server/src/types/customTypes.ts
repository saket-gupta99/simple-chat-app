declare module "ws" {
    interface WebSocket {
        id: string;
        name: string;
        roomId: string;
    }
}

export interface IMessageFromClient {
  type: string;
  roomId?: string;
  message?: string;
  text?: string;
  name?:string;
}
