import { ProjectData, Project } from "@/interface/project";
import { create } from "zustand";

export const useProjectStore = create<ProjectData>((set) => ({
	projects: [],

	// Add a new project to the store
	addNewProject: (project: Project) =>
		set((state) => ({
			projects: [...state.projects, project],
		})),

	// Update an existing project in the store
	editProject: (updatedProject: Project) =>
		set((state) => ({
			projects: state.projects.map((project) =>
				project.id === updatedProject.id
					? updatedProject
					: project,
			),
		})),

	// Delete a project from the store
	deleteProject: (id: string) =>
		set((state) => ({
			projects: state.projects.filter(
				(project) => project.id !== id,
			),
		})),
	clearAllProject: () => set({ projects: [] }),
}));
