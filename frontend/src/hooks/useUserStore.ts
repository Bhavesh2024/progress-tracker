import { UserState, User } from "@/interface/user";
import { create } from "zustand";

export const useUserStore = create<UserState>((set) => ({
	users: [],

	addNewUser: (user: User) =>
		set((state) => ({
			users: [...state.users, user],
		})),

	updateUser: (updatedUser: User) =>
		set((state) => ({
			users: state.users.map((user) =>
				user.empCode === updatedUser.empCode
					? updatedUser
					: user,
			),
		})),

	removeUser: (id: string) =>
		set((state) => ({
			users: state.users.filter((user) => user.id !== id),
		})),
	clearAllUsers: () => set({ users: [] }),
}));
