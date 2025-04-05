import { TaskData, Task } from "@/interface/task";
import { create } from "zustand";

export const useTaskStore = create<TaskData>((set) => ({
	tasks: [],

	// Add a new Task to the store
	addNewTask: (task: Task) =>
		set((state) => ({
			tasks: [...state.tasks, task],
		})),

	// Update an existing Task in the store
	editTask: (updatedTask: Task) =>
		set((state) => ({
			tasks: state.tasks.map((task) =>
				task.id === updatedTask.id ? updatedTask : task,
			),
		})),

	// Delete a Task from the store
	deleteTask: (id: string) =>
		set((state) => ({
			tasks: state.tasks.filter((task: any) => task.id !== id),
		})),

	// Clear all tasks from the store
	clearAllTasks: () => set({ tasks: [] }),

	// Add multiple tasks to the store
	addAllTasks: (newTasks: Task[]) =>
		set((state) => ({
			tasks: [...state.tasks, ...newTasks],
		})),
}));
