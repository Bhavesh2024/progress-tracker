import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { convertCapitalizeString } from "../utils/string";
import { generateProjectCode, generateProjectSlug } from "../utils/generator";
// import { start } from "repl";

dotenv.config();
const prisma = new PrismaClient();

const createProject = async (req: Request, res: Response) => {
	const { name, status, client, tags, startDate, deadline, members } =
		req.body;
	try {
		const newProjectId = await generateProjectCode();
		const newProjectSlug = await generateProjectSlug(name);
		console.log(newProjectId);

		const formattedProjectName = convertCapitalizeString(name);
		const project = await prisma.project.findFirst({
			where: {
				name: formattedProjectName,
			},
		});

		if (project) {
			return res
				.status(409)
				.json({ message: "Project Already Exists" });
		}

		// Handle tags (many-to-many relationship with Project)
		let tagConnections = [];
		if (Array.isArray(tags) && tags.length !== 0) {
			for (let tag of tags) {
				const existTag = await prisma.tag.findFirst({
					where: {
						name: convertCapitalizeString(tag),
					},
				});

				if (!existTag) {
					const newTag = await prisma.tag.create({
						data: {
							name: convertCapitalizeString(tag),
						},
					});
					console.log(newTag);
					tagConnections.push({ id: newTag.id }); // Store the ID for connecting later
				} else {
					tagConnections.push({ id: existTag.id });
				}
			}
		}

		// Handle members (many-to-many relationship with Project)
		let membersId = [];
		if (Array.isArray(members) && members.length !== 0) {
			for (let member of members) {
				const existMember = await prisma.user.findFirst({
					where: {
						username: member.value, // Matching username to find the User
					},
				});

				if (existMember) {
					membersId.push(existMember.id);
				} else {
					return res.status(401).json({
						message: "Member not found",
						error: `${member} is not found`,
					});
				}
			}
		} else {
			return res
				.status(400)
				.json({ message: "No Members Added For Project" });
		}

		const formattedStartDate = startDate
			? new Date(startDate).toISOString()
			: null;
		const formattedEndDate = deadline
			? new Date(deadline).toISOString()
			: null;

		// Create the new Project
		const newProject = await prisma.project.create({
			data: {
				projectCode:
					typeof newProjectId == "string"
						? newProjectId
						: "", // Assuming generateProjectCode() returns this
				name: formattedProjectName,
				client: client,
				startDate: formattedStartDate
					? new Date(formattedStartDate).toISOString()
					: "",
				deadline: formattedEndDate
					? new Date(formattedEndDate).toISOString()
					: null,
				status: parseInt(status), // Ensure status is an integer
				tags: {
					connect: tagConnections, // Connect the tags that exist or are newly created
				},
				members: {
					connect: membersId.map((id) => ({ id })), // Connect the user members
				},
				slug:
					typeof newProjectSlug == "string"
						? newProjectSlug
						: "",
			},
			include: {
				tags: true, // Include the connected tags
				members: true, // Include the connected members
			},
		});
		console.log(newProject);
		return res.status(200).json({
			message: "Project Created Successfully",
			project: newProject,
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

const getProjectFromId = async (req: Request, res: Response) => {
	const { id } = req.params;
	console.log(id);
	try {
		const project = await prisma.project.findFirst({
			where: {
				projectCode: id, // Removes undefined values
			},
		});

		console.log(project);
		if (project) {
			return res.status(200).json({
				message: "Project Found Successfully",
				project,
			});
		} else {
			return res.status(404).json({ message: "Project Not Found" });
		}
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

const getProjectFromSlug = async (req: Request, res: Response) => {
	const { slug } = req.params;

	try {
		const project = await prisma.project.findFirst({
			where: {
				slug: slug, // Removes undefined values
			},
		});

		console.log(project);
		if (project) {
			return res.status(200).json({
				message: "Project Found Successfully",
				project,
			});
		} else {
			return res.status(404).json({ message: "Project Not Found" });
		}
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

const getAllProject = async (req: Request, res: Response) => {
	try {
		const projects = await prisma.project.findMany({
			where: {
				id: {
					not: 0,
				},
			},
			include: {
				tags: true,
				members: true,
			},
		});
		if (projects) {
			return res.status(200).json({
				message: "Projects Found Successfully",
				projects,
			});
			// console.log(projects);
		}
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
const editProject = async (req: Request, res: Response) => {
	try {
		const {
			id,
			name,
			startDate,
			deadline,
			client,
			members,
			tags,
			status,
		} = req.body;

		// Fetch existing project data (members & tags)
		const oldProjectData = await prisma.project.findFirst({
			where: { id },
			select: {
				members: { select: { id: true } },
				tags: { select: { id: true, name: true } },
			},
		});

		if (!oldProjectData) {
			return res.status(404).json({ message: "Project not found" });
		}

		// ---------- Handling Members ----------
		const membersId: any[] = [];
		if (Array.isArray(members) && members.length !== 0) {
			for (let member of members) {
				const existMember = await prisma.user.findFirst({
					where: { username: member.value },
				});
				if (!existMember) {
					return res.status(401).json({
						message: "Member not found",
						error: `${member.name} is not found`,
					});
				}
				membersId.push(existMember.id);
			}
		} else {
			return res
				.status(400)
				.json({ message: "No Members Added For Project" });
		}

		// Determine members to add and remove
		const membersToAdd = membersId.filter(
			(id) =>
				!oldProjectData.members.some(
					(member) => member.id === id,
				),
		);
		const membersToRemove = oldProjectData.members
			.filter((member) => !membersId.includes(member.id))
			.map((member) => member.id);

		// ---------- Handling Tags ----------
		const existingTags = oldProjectData.tags.map((tag) => tag.name);
		const newTags = Array.isArray(tags)
			? tags.map(convertCapitalizeString)
			: [];

		// Tags to add (new tags not in DB)
		const tagsToAdd = newTags.filter(
			(tag) => !existingTags.includes(tag),
		);
		// Tags to remove (existing tags no longer in the new list)
		const tagsToRemove = oldProjectData.tags
			.filter((tag) => !newTags.includes(tag.name))
			.map((tag) => tag.id);

		const tagConnections = [];
		for (let tag of tagsToAdd) {
			// Check if tag already exists in DB
			let existTag = await prisma.tag.findFirst({
				where: { name: tag },
			});

			if (!existTag) {
				// Create new tag if not found
				existTag = await prisma.tag.create({
					data: { name: tag },
				});
			}
			tagConnections.push({ id: existTag.id });
		}

		// ---------- Updating Project ----------
		const updatedProject = await prisma.project.update({
			where: { id },
			data: {
				name: convertCapitalizeString(name),
				startDate: new Date(startDate).toISOString(),
				deadline: deadline
					? new Date(deadline).toISOString()
					: null,
				client: convertCapitalizeString(client),
				members: {
					connect: membersToAdd.map((id) => ({ id })),
					disconnect: membersToRemove.map((id) => ({ id })),
				},
				tags: {
					connect: tagConnections, // Add new/existing tags
					disconnect: tagsToRemove.map((id) => ({ id })), // Remove unwanted tags
				},
				status: parseInt(status),
			},
			include: {
				tags: true,
				members: true,
			},
		});

		return res.status(200).json({
			message: "Project Updated Successfully",
			project: updatedProject,
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

const deleteProject = async (req: Request, res: Response) => {
	const { id } = req.params;
	console.log(id);
	try {
		const deletedProject = await prisma.project.delete({
			where: {
				id: parseInt(id),
			},
		});
		if (deletedProject) {
			return res.status(200).json({
				message: "Project Deleted Successfully",
				project: deletedProject,
			});
		} else {
			return res.status(404).json({ message: "Project Not Found" });
		}
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

module.exports = {
	createProject,
	getProjectFromId,
	getAllProject,
	editProject,
	deleteProject,
	getProjectFromSlug,
};
