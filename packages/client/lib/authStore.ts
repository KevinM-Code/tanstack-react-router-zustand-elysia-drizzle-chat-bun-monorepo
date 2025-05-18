import { create } from "zustand";
import { edenApi } from "./useEden";
import { createJSONStorage, persist } from "zustand/middleware";


export type AuthStore = {
  token: string | null;
  user: string | null;
  id: string | null;
  timestamp: string | null;

  // actions
  isAuthed: () => boolean;

  // mutations
  login: (token: string, user: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  // persist(
    (set, get) => {
      const { api } = edenApi();

      return {
        token: null,
        id: null,
        user: null,
        timestamp: null,

        isAuthed: () => !!get().token,

        login: async (token) => {
          // fetch user info from api
          // const { data: user } = await api.auth.me.get({
          //   $headers: { Authorization: `Bearer ${token}` },
          // });

          set({ token });
        },
        logout: () => {
          
          set({ token: null, user: null, id: null, timestamp: null })
        },
      };
    },
    // {
    //   name: "auth-store",
    //   // WARNING: this is NOT secure.
    //   // in future we can implement refresh tokens and store them in a httpOnly cookie
    //   storage: createJSONStorage(() => localStorage),
    // },
  // ),
);
