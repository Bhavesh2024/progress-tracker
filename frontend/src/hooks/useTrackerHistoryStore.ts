import { Tracker, TrackerHistory } from "@/interface/tracker";
import { create } from "zustand";

export const useTrackerHistoryStore = create<TrackerHistory>((set) => ({
	history: [],
	addAllToHistory: (tracker: Tracker[]) =>
		set((state) => ({ history: tracker })),
	addToHistory: (tracker: Tracker) =>
		set((state) => ({
			history: [...state.history, tracker],
		})),

	removeFromHistory: (id: string) =>
		set((state) => ({
			history: state.history.filter((data) => data.userId !== id),
		})),

	clearHistory: () => set(() => ({ history: [] })),
}));
