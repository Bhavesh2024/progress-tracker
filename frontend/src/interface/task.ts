import { Project } from "./project";

export enum TaskStatus {
	NotStarted = 0,
	InProgress = 1,
	Completed = 2,
	Archived = 3,
	Incomplete = 4,
}
export enum TaskPriority {
	Low = 0,
	High = 2,
	Medium = 3,
	Urent = 1,
}

export interface Task {
	id: number;
	taskCode: string;
	title: string;
	startTime: Date | null;
	endTime: Date | null;
	members: any;
	status: number;
	tags: any;
	priority: number;
	projectId: number;
	project: any;
	assigneeId: string;
	assigner: any;
	assignee: any;
	description: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface TaskData {
	tasks: Task[];
	addNewTask: (task: Task) => void;
	editTask: (task: Task) => void;
	deleteTask: (id: string) => void;
	clearAllTasks: () => void;
	addAllTasks: (tasks: Task[]) => void;
}

export interface TaskDataFormat {
	taskId: number | undefined;
	title: string;
	startDate: Date | string;
	endDate: Date | string;
	priority: TaskPriority;
	status: TaskStatus;
	assigner: string;
	assignee: any[];
	project: any | Project;
	tags: string[];
	description: string;
}

export interface UserCurrentTaskData {
	tasks: Task[];
	addAllTasks: (task: Task[]) => void;
	removeAllTasks: () => void;
	addReceivedTasks: (task: Task) => void;
}
