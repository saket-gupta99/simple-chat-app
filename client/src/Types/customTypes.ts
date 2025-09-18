export interface IMessageFromServer {
  type: string;
  roomId?: string;
  message?: string;
  text?: string;
  name?:string;
}
