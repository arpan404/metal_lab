import {create} from 'zustand';
import {persist} from 'zustand/middleware';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface LabChat {
  labUID: string;
  messages: ChatMessage[];
}

interface ChatStore {
  labChats: LabChat[];
  addMessageToLab: (labUID: string, message: ChatMessage) => void;
  clearMessagesForLab: (labUID: string) => void;
  getMessagesForLab: (labUID: string) => ChatMessage[];
  initializeLabChat: (labUID: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      labChats: [],
      
      initializeLabChat: (labUID: string) =>
        set((state) => {
          const exists = state.labChats.some((chat) => chat.labUID === labUID);
          if (!exists) {
            return {
              labChats: [...state.labChats, { labUID, messages: [] }],
            };
          }
          return state;
        }),

      addMessageToLab: (labUID: string, message: ChatMessage) =>
        set((state) => {
          const labIndex = state.labChats.findIndex((chat) => chat.labUID === labUID);
          
          if (labIndex === -1) {
            return {
              labChats: [...state.labChats, { labUID, messages: [message] }],
            };
          }
          
          const updatedChats = [...state.labChats];
          updatedChats[labIndex] = {
            ...updatedChats[labIndex],
            messages: [...updatedChats[labIndex].messages, message],
          };
          
          return { labChats: updatedChats };
        }),

      clearMessagesForLab: (labUID: string) =>
        set((state) => ({
          labChats: state.labChats.map((chat) =>
            chat.labUID === labUID
              ? { ...chat, messages: [] }
              : chat
          ),
        })),

      getMessagesForLab: (labUID: string) => {
        const chat = get().labChats.find((chat) => chat.labUID === labUID);
        return chat?.messages || [];
      },
    }),
    {
      name: 'chat-messages-storage',
    }
  )
);  
