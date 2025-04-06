import { Request, Response } from "express";
import { UserReqData } from "../interface/user";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";
import {
	generateEmployeeCode,
	generateEmployeePassword,
	generateEmployeeUsername,
} from "../utils/generator";
import bcrypt from "bcryptjs";
import { sendMail } from "../utils/sendMail";
const prisma = new PrismaClient();

const userData = fs.readFileSync(
	path.join(__dirname, "../data/user.json"),
	"utf-8",
);
// Add New User
const addUser = async (req: Request, res: Response) => {
	try {
		const {
			name,
			email,
			phone,
			gender,
			joiningDate,
			jobRole,
			userRole,
			birthDate,
			infoUser,
		} = req.body as UserReqData;
		let newEmployeeId = await generateEmployeeCode();

		if (newEmployeeId == 0) {
			return res.status(500).json({
				message: "Error while creating Employee Code.. Try Again !!!",
			});
		}
		const file = req.file;
		const user = await prisma.user.findFirst({
			where: {
				OR: [
					{
						email: email,
					},
					{
						phone: phone,
					},
				],
			},
		});
		if (user) {
			if (user.email !== email) {
				if (user.phone == phone) {
					return res.status(409).json({
						message: "Phone number Already Exist",
					});
				}
			} else {
				return res
					.status(409)
					.json({ message: "Email Already Exist" });
			}
		}

		const generatedUsername = generateEmployeeUsername(
			name,
			typeof newEmployeeId == "string" ? newEmployeeId : "",
		);
		console.log(generatedUsername);
		const generatedPassword = await generateEmployeePassword(
			16,
			8,
			7,
			1,
		);
		const users = JSON.parse(userData);
		fs.writeFileSync(
			path.join(__dirname, "../data/user.json"),
			JSON.stringify({
				...users,
				[newEmployeeId]: {
					username: generatedUsername,
					password: generatedPassword,
				},
			}),
		);
		if (
			typeof generatedPassword == "string" &&
			typeof generatedUsername == "string" &&
			typeof newEmployeeId == "string" &&
			typeof file?.filename == "string"
		) {
			console.log("hee");
			const encryptedPassword = await bcrypt.hash(
				generatedPassword,
				10,
			);
			const newUser = await prisma.user.create({
				data: {
					name,
					email,
					phone,
					gender,
					joiningDate: new Date(joiningDate).toISOString(),
					password: encryptedPassword,
					username:
						typeof generatedUsername == "string"
							? generatedUsername.toLowerCase()
							: "",
					empCode: newEmployeeId,
					birthDate: new Date(birthDate).toISOString(),
					profilePhoto: file?.filename,
					role: userRole,
					jobRole,
				},
			});
			if (newUser) {
				const mailUser =
					typeof infoUser == "string" ||
					typeof infoUser == "boolean"
						? infoUser == "true" || infoUser == true
						: false;
				if (mailUser) {
					console.log(typeof infoUser);
					const mailStatus = await sendMail(
						email,
						"Progress Tracker Credential",
						{
							username: generatedUsername.toLowerCase(),
							password: generatedPassword,
							name: name.split(" ")[0],
						},
						"credential",
					);
					return res.status(201).json({
						message: "User Created Successfully",
						user: newUser,
						mail: mailStatus,
					});
				} else {
					return res.status(201).json({
						message: "User Created Successfully",
						user: newUser,
					});
				}
				// console/.log("ddfhfdh");
			}
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
const getUser = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const user = await prisma.user.findFirst({
			where: {
				empCode: id,
			},
		});
		if (user) {
			return res.status(200).json({ message: "user found", user });
		} else {
			return res
				.status(404)
				.json({ message: "user not found", user: {} });
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

const getAllUser = async (req: Request, res: Response) => {
	try {
		const users = await prisma.user.findMany({
			where: {
				NOT: {
					empCode: "KPYX0000",
				},
			},
		});
		if (users.length !== 0) {
			return res
				.status(200)
				.json({ message: "Users Found", users });
		} else {
			return res
				.status(203)
				.json({ message: "No Users available", users: [] });
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

const deleteUser = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const removeUser = await prisma.user.delete({
			where: {
				id: id,
			},
		});
		if (removeUser) {
			return res
				.status(200)
				.json({ message: "User Deleted Successfully", id: id });
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
const editUser = async (req: Request, res: Response) => {
	try {
		const {
			name,
			email,
			phone,
			gender,
			joiningDate,
			jobRole,
			userRole,
			birthDate,
			empCode,
			username,
			image,
		} = req.body as UserReqData;
		const file = req.file;

		// Find the user based on empCode
		const user = await prisma.user.findFirst({
			where: {
				empCode: empCode,
			},
		});

		if (user) {
			// Create a combined check for the fields that could cause conflicts
			const conflictingUser = await prisma.user.findFirst({
				where: {
					OR: [
						{ email: email, NOT: { empCode: empCode } }, // Check if the email already exists, but exclude the current user
						{ phone: phone, NOT: { empCode: empCode } }, // Check if the phone already exists, but exclude the current user
						{
							username: username,
							NOT: { empCode: empCode },
						}, // Check if the username already exists, but exclude the current user
					],
				},
			});

			if (conflictingUser) {
				// Return a conflict message if any of the fields already exist
				if (conflictingUser.email === email) {
					return res
						.status(409)
						.json({ message: "Email Already Exists" });
				}
				if (conflictingUser.phone === phone) {
					return res.status(409).json({
						message: "Phone Number Already Exists",
					});
				}
				if (conflictingUser.username === username) {
					return res.status(409).json({
						message: "Username Already Exists",
					});
				}
			}

			// Handle profile photo update
			let updatedProfilePhoto = image; // Default to the existing image if no file uploaded
			if (file && typeof file.filename === "string") {
				// If a new file (profile photo) is provided, update it
				updatedProfilePhoto = file.filename;
			}

			// Proceed with the update
			const updatedUser = await prisma.user.update({
				where: {
					empCode: empCode,
				},
				data: {
					name,
					email,
					phone,
					gender,
					joiningDate: new Date(joiningDate).toISOString(),
					username,
					birthDate: new Date(birthDate).toISOString(),
					profilePhoto:
						typeof updatedProfilePhoto == "string"
							? updatedProfilePhoto
							: "", // Set profile photo accordingly
					role: userRole,
					jobRole,
				},
			});

			return res.status(200).json({
				message: "User Updated Successfully",
				user: updatedUser,
			});
		} else {
			// If no user is found with the given empCode
			return res.status(404).json({
				message: "User not found with the provided empCode",
			});
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

const getUsersForProject = async (req: Request, res: Response) => {
	try {
		const users = await prisma.user.findMany({
			where: {
				role: {
					not: "admin", // Filter out users with the role 'admin'
				},
			},
			select: {
				empCode: true, // Select the empCode field
				username: true, // Select the username field
				name: true, // Select the name field
				jobRole: true, // Select the jobRole field
				role: true, // Select the role field
				profilePhoto: true,
			},
		});
		console.log(users);
		if (users.length == 0) {
			return res.status(404).json({ message: "No Users Found" });
		}

		return res
			.status(200)
			.json({ message: "Users Found", projectUsers: users });
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

const updateUserProfile = async (req: Request, res: Response) => {
	const { id, username, email, phone, name, role } = req.body;

	try {
		const { file } = req as any; // Extract file and user from req (user injected by passport)
		console.log(file);
		let currentUser;
		console.log("edit role", role);
		console.log("data", req.body);

		currentUser = await prisma.user.findFirst({
			where: { id, role },
		});

		if (!currentUser) {
			return res.status(404).json({ message: "User not found" });
		}

		// Check if the new username, email, or phone is already taken (excluding the current user)
		const existingUsername = await prisma.user.findFirst({
			where: { username, id: { not: id } },
		});

		if (existingUsername) {
			return res
				.status(400)
				.json({ message: "Username already taken" });
		}

		const existingEmail = await prisma.user.findFirst({
			where: { email, id: { not: id } },
		});

		if (existingEmail) {
			return res
				.status(400)
				.json({ message: "Email already in use" });
		}

		const existingPhone = await prisma.user.findFirst({
			where: { phone, id: { not: id } },
		});

		if (existingPhone) {
			return res
				.status(400)
				.json({ message: "Phone number already in use" });
		}

		// Handle profile image update
		let profilePhoto = currentUser.profilePhoto; // Default to existing profile photo
		if (file) {
			profilePhoto = file.filename; // Set new profile photo path
		}

		// Update the user in the database
		const updatedUser = await prisma.user.update({
			where: { id },
			data: {
				name,
				email,
				username,
				phone,
				profilePhoto,
			},
		});

		return res.status(200).json({
			message: "Profile updated successfully",
			user: updatedUser,
		});
	} catch (err) {
		if (err instanceof Error) {
			console.error(err.message);
			return res.status(500).json({
				message: "Internal Server Error",
				error: err.message,
			});
		}
	}
};

const getUserReport = async (req: Request, res: Response): Promise<any> => {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({ message: "No User Id Found" });
		}
		console.log(id);
		const report = await prisma.user.findFirst({
			where: { id },
			select: {
				id: true,
				email: true,
				username: true,
				role: true,
				name: true,
				profilePhoto: true,
				gender: true,
				birthDate: true,
				joiningDate: true,
				empCode: true,
				tracker: true,
				jobRole: true,
				assignedTasks: {
					select: {
						assignee: true,
						title: true,
						description: true,
						startTime: true,
						endTime: true,
						tags: {
							select: {
								name: true,
							},
						},
					},
				},
				projects: true,
				following: {
					include: {
						project: {
							include: {
								members: true,
							},
						},
						tags: {
							select: {
								name: true,
							},
						},
						assigner: true,
						assignee: true,
					},
				},
			},
		});

		if (!report) {
			return res.status(404).json({ message: "No User Found" });
		}

		return res.status(200).json({
			message: "User Report Generated Successfully",
			report,
		});
	} catch (err) {
		if (err instanceof Error) {
			console.error(err.message);
			return res.status(500).json({
				message: "Internal Server Error",
				error: err.message,
			});
		}
	}
};

const getDashboardData = async (req: Request, res: Response): Promise<any> => {
	try {
		let data = {};
		const totalUser = await prisma.user.count();
		const totalProject = await prisma.project.count();
		data = {
			count: {
				user: totalUser,
				project: totalProject,
			},
		};
		return res
			.status(200)
			.json({ message: "Data Getted Successfully", data });
	} catch (err) {
		if (err instanceof Error) {
			console.error(err.message);
			return res.status(500).json({
				message: "Internal Server Error",
				error: err.message,
			});
		}
	}
};
module.exports = {
	addUser,
	editUser,
	getUser,
	getAllUser,
	deleteUser,
	getUsersForProject,
	updateUserProfile,
	getDashboardData,
	getUserReport,
};
