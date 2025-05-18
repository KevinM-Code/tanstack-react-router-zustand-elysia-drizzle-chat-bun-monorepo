import { create } from "zustand";
import { edenApi } from "./useEden";
import { useAuthStore } from "./authStore";

export type Message = string 


export type ChatStore = {
  // maybe move the Message type to ./shared ?
  messages: Message[];
  status: "CONNECTED" | "DISCONNECTED";

  // actions
  sendMessage: ({message, user, token, id, timestamp}: {message: string, user: string, token: string, id: string, timestamp: string}) => void;
  clearMessages: () => void;

  connect: () => void;
  disconnect: () => void;
  isConnected: () => boolean;
};

export const useChatStore = create<ChatStore>((set, get) => {
  const { api } = edenApi();
  type ChatWS = ReturnType<(typeof api)["chat"]["ws"]["subscribe"]>;
  let ws: ChatWS | null = null;
  const authStore = useAuthStore;

  function onMessage(data: Message) {

    if (data.token) {
      useAuthStore.setState({token: data.token})
    }


    if (useAuthStore.getState().token) {
      if (data.message === "AUTHENTICATED") {
        set({ status: "CONNECTED" });
       // set((state) => ({ messages: [...state.messages, data.userMessage] }));
        return;
      }

      if (data.message === "NOT_AUTHENTICATED") {
        ws?.send({ accessToken: authStore.getState().token || "" });
      }      
    }

    set((state) => ({ messages: [...state.messages, data] }));
  }

  return {
    messages: [],
    status: "DISCONNECTED",

    // actions
    sendMessage: (msg) => {
      const wsRes = ws?.send({ msg, token: useAuthStore.getState().token, user: useAuthStore.getState().user, id: useAuthStore.getState().id, timestamp: useAuthStore.getState().timestamp?.toString() });
     
    },
    clearMessages: () => set({ messages: [] }),

    connect: () => {
      if (ws) get().disconnect();

      ws = api.chat.ws.subscribe();

      ws.on("message", ({ data }) => onMessage(data));
    },

    disconnect: () => {
      ws?.close();
      ws = null;
      set({ status: "DISCONNECTED" });
    },

    isConnected: () => get().status === "CONNECTED",
  };
});
