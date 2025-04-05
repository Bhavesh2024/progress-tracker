export enum ProjectStatus {
	NotStarted = 0,
	InProgress = 1,
	Completed = 2,
	Archived = 3,
	Incomplete = 4,
}

export interface Project {
	id: string;
	name: string;
	client: string;
	startDate: string;
	deadline: string;
	members: any[];
	tags: any[];
	status: ProjectStatus;
}

export interface ProjectData {
	projects: Project[];
	addNewProject: (project: Project) => void;
	editProject: (project: Project) => void;
	deleteProject: (id: string) => void;
	clearAllProject: () => void;
}
