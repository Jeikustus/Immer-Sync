export interface User {
  uid: string;
  name: string;
  email: string;
  accountType: string;
  displayName: string;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  messages: Message[];
}

export interface Message {
  id: string;
  senderId: string;
  senderEmail: string;
  recipientId: string;
  recipientEmail: string;
  text: string;
  timestamp: number;
}
