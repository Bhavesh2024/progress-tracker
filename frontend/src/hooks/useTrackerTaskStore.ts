import { UserCurrentTaskData } from "@/interface/task";
import { create } from "zustand";
import { Task } from "@/interface/task";

export const useTrackerTaskStore = create<UserCurrentTaskData>((set) => ({
	tasks: [],
	addAllTasks: (allTasks: Task[]) => set({ tasks: allTasks }),
	removeAllTasks: () => set({ tasks: [] }),
	addReceivedTasks: (task: Task) =>
		set((state) => ({ tasks: [...state.tasks, task] })),
}));
