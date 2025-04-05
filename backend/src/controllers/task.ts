import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { convertCapitalizeString } from "../utils/string";
import { TaskData } from "../interface/task";
import { connect } from "http2";

const prisma = new PrismaClient();
export const addTask = async (req: Request, res: Response): Promise<any> => {
	try {
		const {
			title,
			project,
			startDate,
			endDate,
			priority,
			status,
			assigner,
			assignee,
			tags,
			description,
		} = req.body;

		// console.log('task data :-', req.body);
		const { user } = req as any;
		if (!user) {
			return res
				.status(401)
				.json({ message: "Unauthorized Access" });
		}
		const formattedStartTime = startDate
			? new Date(startDate).toISOString()
			: null;
		const formattedEndTime = endDate
			? new Date(endDate).toISOString()
			: null;

		console.log(formattedStartTime);
		const tagConnections = [];
		const assigneeId: string[] = [];
		const lastTaskId = await prisma.task.findFirst({
			orderBy: {
				id: "desc",
			},
		});
		const newTaskId =
			typeof lastTaskId == "number" ? lastTaskId + 1 : 0;

		const assignerUser = await prisma.user.findFirst({
			where: {
				username: assigner,
			},
		});

		console.log(assignerUser);
		if (Array.isArray(tags) && tags.length !== 0) {
			for (let tag of tags) {
				const existTag = await prisma.tag.findFirst({
					where: {
						name: tag,
					},
				});
				if (existTag) {
					// await prisma.tag.update({
					// 	data: {
					// 		tasks: {
					// 			connect: {
					// 				id: newTaskId,
					// 			},
					// 		},
					// 	},
					// 	where: {
					// 		id: existTag.id,
					// 	},
					// });
					tagConnections.push(existTag.id);
				} else {
					const newTag = await prisma.tag.create({
						data: {
							name: convertCapitalizeString(tag),
						},
					});
					tagConnections.push(newTag.id);
				}
			}
		}

		const assigneeUsers = await prisma.user.findMany({
			where: {
				username: { in: assignee },
			},
			select: {
				id: true,
			},
		});
		console.log(assigneeUsers);
		if (assigneeUsers) {
			assigneeUsers.forEach((user) => {
				assigneeId.push(user.id);
			});
		}

		console.log(assigneeId);
		const projectData = await prisma.project.findFirst({
			where: {
				projectCode: project,
			},
			select: {
				id: true,
				members: true,
			},
		});

		const { id } = projectData as any;
		// if (user.role !== "admin") {
		// 	if (assignerUser) {
		// 		const isMember = projectData?.members.some(
		// 			(member: any) => assignerUser.id == member.id,
		// 		);
		// 		if (!isMember) {
		// 			return res
		// 				.status(401)
		// 				.json({
		// 					message: "You are not a Member of this project",
		// 				});
		// 		}
		// 	}
		// }
		console.log("project id", id);
		const newTaskData: TaskData = {
			title: title,
			project: {
				connect: {
					id: id,
				},
			},
			startTime: formattedStartTime,
			endTime: formattedEndTime,
			status: status,
			priority: priority,
			assigner: {
				connect: {
					id: assignerUser ? assignerUser.id : "",
				},
			},
			assignee: {
				connect: assigneeId.map((id: string) => ({
					id,
				})),
			},
			description: description,
		};

		// Only add 'tags' if tagConnections is not empty
		if (tagConnections.length > 0) {
			newTaskData.tags = {
				connect: tagConnections.map((id: number) => ({
					id,
				})),
			};
		}

		const newTask = await prisma.task.create({
			data: newTaskData,
			include: {
				project: {
					select: {
						members: true,
						projectCode: true,
						name: true,
						tags: {
							select: {
								name: true,
							},
						},
						status: true,
						startDate: true,
						deadline: true,
					},
				},
				tags: true,

				assignee: true,
				assigner: true,
			},
		});

		return res
			.status(200)
			.json({ message: "Task Added Successfully", task: newTask });
	} catch (err) {
		if (err instanceof Error) {
			console.log(err.message);
			return res.status(500).json({
				message: "Internal Server Error",
				error: err.message,
			});
		}
	}
};

export const editTask = async (req: Request, res: Response): Promise<any> => {
	try {
		const {
			taskId,
			title,
			project,
			startDate,
			endDate,
			priority,
			status,
			assigner,
			assignee,
			tags,
			description,
		} = req.body;

		console.log(tags);
		const formattedStartTime = startDate
			? new Date(startDate).toISOString()
			: null;
		const formattedEndTime = endDate
			? new Date(endDate).toISOString()
			: null;
		console.log(formattedStartTime);

		const tagConnections: number[] = [];
		const assigneeId: string[] = [];

		// Updating tags
		if (Array.isArray(tags) && tags.length !== 0) {
			for (let tag of tags) {
				const existTag = await prisma.tag.findFirst({
					where: { name: tag },
				});

				if (existTag) {
					tagConnections.push(existTag.id);
				} else {
					const newTag = await prisma.tag.create({
						data: {
							name: convertCapitalizeString(tag),
						},
					});
					tagConnections.push(newTag.id);
				}
			}
		}

		// Fetch the project to get project members
		const projectData = await prisma.project.findFirst({
			where: { projectCode: project },
			select: {
				id: true,
				members: { select: { username: true, id: true } },
			},
		});

		if (!projectData) {
			return res.status(404).json({ message: "Project not found" });
		}

		// Get existing task assignees
		const existingTask = await prisma.task.findFirst({
			where: { id: taskId },
			select: {
				assignee: { select: { id: true, username: true } },
			},
		});

		if (!existingTask) {
			return res.status(404).json({ message: "Task not found" });
		}

		const existingAssignees = existingTask.assignee.map(
			(member) => member.username,
		);

		// Determine assignees to add & remove
		const assigneeToAdd = assignee
			.filter((user: any) => !existingAssignees.includes(user)) // New assignees not in the task
			.map((user: any) => {
				const member = projectData.members.find(
					(m) => m.username === user,
				);
				return member ? { id: member.id } : null;
			})
			.filter(Boolean) as { id: string }[];

		const assigneeToRemove = existingTask.assignee
			.filter((member) => !assignee.includes(member.username)) // Remove if they are not in the new list
			.map((member) => ({ id: member.id }));

		// Update the task
		const updatedTask = await prisma.task.update({
			where: { id: taskId },
			data: {
				title,
				project: { connect: { id: projectData.id } },
				startTime: formattedStartTime,
				endTime: formattedEndTime,
				status: parseInt(status),
				priority: parseInt(priority),
				...(assigneeToAdd.length || assigneeToRemove.length
					? {
							assignee: {
								...(assigneeToAdd.length
									? {
											connect: assigneeToAdd,
									  }
									: {}),
								...(assigneeToRemove.length
									? {
											disconnect:
												assigneeToRemove,
									  }
									: {}),
							},
					  }
					: {}),
				...(tagConnections.length
					? {
							tags: {
								set: tagConnections.map(
									(id) => ({ id }),
								),
							},
					  }
					: {}),
				description,
			},
			include: {
				project: {
					select: {
						members: true,
						projectCode: true,
						id: true,
						name: true,
					},
				},
				tags: { select: { name: true } },
				assignee: true,
				assigner: true,
			},
		});

		return res.status(200).json({
			message: "Task Updated Successfully",
			task: updatedTask,
		});
	} catch (err) {
		if (err instanceof Error) {
			console.log(err.message);
			return res.status(500).json({
				message: "Internal Server Error",
				error: err.message,
			});
		}
	}
};

export const deleteTaskById = async (
	req: Request,
	res: Response,
): Promise<any> => {
	const { id } = req.params;

	try {
		const deletedTask = await prisma.task.delete({
			where: {
				id: typeof id == "string" ? parseInt(id) : 0,
			},
			select: {
				id: true,
			},
		});

		return res.status(200).json({
			message: "Task Deleted Successfully",
			task: deletedTask,
		});
	} catch (err) {
		if (err instanceof Error) {
			console.log(err.message);
			return res.status(500).json({
				message: "Internal Server Error",
				error: err.message,
			});
		}
	}
};

export const getTaskById = async (
	req: Request,
	res: Response,
): Promise<any> => {
	const { id } = req.params;
	console.log(typeof id);
	try {
		const task = await prisma.task.findFirst({
			where: {
				id: typeof id == "string" ? parseInt(id) : 0,
			},
			include: {
				project: true,
				tags: true,
				assigner: true,
				assignee: true,
			},
		});
		return res
			.status(200)
			.json({ message: "Task Found Successfully", task });
	} catch (err) {
		if (err instanceof Error) {
			console.log(err.message);
			return res.status(500).json({
				message: "Internal Server Error",
				error: err.message,
			});
		}
	}
};

export const getTaskByMember = async (
	req: Request,
	res: Response,
): Promise<any> => {
	const { member } = req.params;
	try {
		const membersTask = await prisma.task.findMany({
			where: {
				assignee: {
					some: {
						username: member, // Assuming `assignee` is a relation and `id` is the field for member
					},
				},
			},
			include: {
				tags: {
					select: {
						id: true,
						name: true,
					},
				},
				assignee: true,
				assigner: true,
				project: {
					select: {
						projectCode: true,
						name: true,
					},
				},
			},
		});

		return res
			.status(200)
			.json({ message: "Members Task Found", tasks: membersTask });
	} catch (err) {
		if (err instanceof Error) {
			console.log(err.message);
			return res.status(500).json({
				message: "Internal Server Error",
				error: err.message,
			});
		}
	}
};

export const getAllTask = async (req: Request, res: Response): Promise<any> => {
	try {
		const { user } = req;

		const tasks = await prisma.task.findMany({
			where: {
				id: {
					not: 0,
				},
			},
			include: {
				tags: true,
				project: true,
				assigner: true,
				assignee: true,
			},
		});
		return res
			.status(200)
			.json({ message: "Task Added Successfully", tasks: tasks });
	} catch (err) {
		if (err instanceof Error) {
			console.log(err.message);
			return res.status(500).json({
				message: "Internal Server Error",
				error: err.message,
			});
		}
	}
};

export const getProjectTask = async (
	req: Request,
	res: Response,
): Promise<any> => {
	const { code } = req.params;
	const user = req.user as any; // Assuming user info is stored in req.user (middleware should set this)

	if (!user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	try {
		const project = await prisma.project.findFirst({
			where: {
				OR: [
					{
						projectCode:
							typeof code == "string" ? code : "",
					},
					{ slug: typeof code == "string" ? code : "" },
					{ id: typeof code == "number" ? code : 0 },
				],
			},
			include: {
				members: true, // Fetch members to check user membership
				tasks: {
					where:
						user.role !== "admin" // Only filter tasks if not admin
							? {
									OR: [
										{
											assignee: {
												some: {
													id: user.id,
												},
											},
										}, // User is assigned the task
										{
											assignerId:
												user.id,
										}, // User created the task
										{
											project: {
												members: {
													some: {
														id: user.id,
													},
												},
											},
										}, // User is a project member
									],
							  }
							: {
									id: {
										not: 0,
									},
							  }, // Admin sees all tasks
					select: {
						id: true,
						status: true,
						priority: true,
						startTime: true,
						endTime: true,
						assignee: true,
						assigner: true,
						tags: {
							select: { name: true },
						},
						project: {
							select: {
								id: true,
								projectCode: true,
								members: true,
								name: true,
								client: true,
								startDate: true,
								deadline: true,
								slug: true,
							},
						},
						title: true,
						description: true,
						createdAt: true,
						updatedAt: true,
					},
				},
			},
		});

		if (!project) {
			return res.status(404).json({ message: "Project not found" });
		}

		return res.status(200).json({
			message: "Project Task Found Successfully",
			project,
		});
	} catch (err) {
		if (err instanceof Error) {
			console.log(err.message);
			return res.status(500).json({
				message: "Internal Server Error",
				error: err.message,
			});
		}
	}
};

export const getMembersProject = async (
	req: Request,
	res: Response,
): Promise<any> => {
	try {
		const { user } = req as any;
		const { id, role } = user;

		const membersProject =
			role == "admin"
				? await prisma.project.findMany({
						orderBy: {
							id: "desc",
						},
				  })
				: await prisma.project.findMany({
						where: {
							members: {
								some: {
									id: id,
								},
							},
						},
						select: {
							projectCode: true,
							slug: true,
							name: true,
							members: {
								select: {
									username: true,
									id: true,
									name: true,
									profilePhoto: true,
								},
							},
						},
				  });
		if (!membersProject) {
			return res.status(404).json({ message: "No Projects Found" });
		}

		return res
			.status(200)
			.json({ message: "Project Found", projects: membersProject });
	} catch (err) {
		if (err instanceof Error) {
			console.log(err.message);
			return res.status(500).json({
				message: "Internal Server Error",
				error: err.message,
			});
		}
	}
};

export const getUserCurrentTasks = async (
	req: Request,
	res: Response,
): Promise<any> => {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({ message: "No Data Provided" });
		}

		/*
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
		*/

		const tasks = await prisma.task.findMany({
			where: {
				AND: [
					{
						assignee: {
							some: {
								id: id,
							},
						},
					},
					{
						status: { in: [0, 1, 4] },
					},
					{
						startTime: {
							lte: new Date(),
						},
					},
				],
			},
			select: {
				id: true,
				status: true,
				priority: true,
				startTime: true,
				endTime: true,
				assignee: true,
				assigner: true,
				tags: {
					select: { name: true },
				},
				project: {
					select: {
						id: true,
						projectCode: true,
						members: true,
						name: true,
						client: true,
						startDate: true,
						deadline: true,
						slug: true,
					},
				},
				title: true,
				description: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!tasks) {
			return res.status(404).json({ message: "No User Found" });
		}

		return res.status(200).json({
			message: "User Task Found Successfully",
			tasks: tasks,
		});
	} catch (err) {
		if (err instanceof Error) {
			console.log(err.message);
			return res.status(500).json({
				message: "Internal Server Error",
				error: err.message,
			});
		}
	}
};
