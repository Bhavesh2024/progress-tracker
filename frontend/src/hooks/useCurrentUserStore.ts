import { CurrentUser, CurrentUserState } from "@/interface/user";
import { create } from "zustand";

export const useCurrentUserStore = create<CurrentUserState>((set) => ({
	currentUser: null,
	updateCurrentUser: (user: CurrentUser) =>
		set(() => ({
			currentUser: user,
		})),
}));
