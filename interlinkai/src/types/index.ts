export interface ChatMsg {
    id: number | string; 
    sender: 'user' | 'ai';
    text: string;
    isError?: boolean;
    createdAt?: string; 
}

