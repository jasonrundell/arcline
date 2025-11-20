export interface ScrappyMessage {
  id: string;
  content: string;
  faction?: string;
  created_at: string;
  verified: boolean;
}

export interface Intel {
  id: string;
  content: string;
  faction?: string;
  priority?: string;
  created_at: string;
  verified: boolean;
}
