export interface TaskData {
	title: string;
	project: any;
	startTime: Date | string | null; // Assuming ISO string format for dates
	endTime: Date | string | null; // Assuming ISO string format for dates
	status: number;
	priority: number;
	assigner: any;
	assignee: {
		connect: Array<{
			id: string; // Assuming assignee' IDs are strings. Adjust if needed.
		}>;
	};
	description: string;
	tags?: {
		connect: Array<{
			id: number; // Tag ID type (number here)
		}>;
	};
}
