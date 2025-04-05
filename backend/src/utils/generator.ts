import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const generateVerificationCode = (
	min: number,
	max: number,
	length: number = 6,
): number => {
	let otp = "";
	for (let i = 0; i < length; i++) {
		otp += `${Math.floor(Math.random() * (max - min + 1) + min)}`;
	}
	return parseInt(otp);
};

export const generateEmployeeCode = async (): Promise<string | number> => {
	try {
		// Fetch the last user with empCode
		const getLastUser = await prisma.user.findFirst({
			orderBy: { id: "desc" },
		});

		// If no employee exists, return the first employee code
		let newEmployeeId = "KPYX0001";

		if (getLastUser && getLastUser.empCode) {
			const lastEmployeeId = getLastUser.empCode;
			console.log("Last Employee Code:", lastEmployeeId);

			// Extract the last 4 digits from the employee code
			const extractDigit = lastEmployeeId.match(/\d{4}$/);

			if (!extractDigit) {
				console.log("Error: Invalid employee code format");
				return "Error: Invalid employee code format";
			}

			// Increment the numeric part by 1
			let nextNumber = parseInt(extractDigit[0]) + 1;

			// Ensure uniqueness by checking the database
			do {
				newEmployeeId = `KPYX${nextNumber
					.toString()
					.padStart(4, "0")}`;
				const existingUser = await prisma.user.findFirst({
					where: { empCode: newEmployeeId },
				});
				if (!existingUser) break; // If no user exists with this code, exit loop
				nextNumber++; // Otherwise, increment and check again
			} while (true);
		}

		console.log("Generated Employee ID:", newEmployeeId);
		return newEmployeeId;
	} catch (err) {
		console.error("Error generating employee code:", err);
		return 0; // Return 0 to indicate failure
	}
};

export const generateEmployeeUsername = (name: string, empCode: string) => {
	try {
		const firstName = name.split(" ")[0];
		const lastDigit = empCode.slice(4, empCode.length);
		const newUsername = `${firstName}_${lastDigit}`;
		console.log(newUsername);
		return newUsername;
	} catch (err) {
		if (err instanceof Error) {
			console.log(err.message);
			return "";
		}
	}
};

export const generateEmployeePassword = async (
	len: number,
	upper: number,
	nums: number,
	special: number,
): Promise<string | undefined> => {
	try {
		const lower = "abcdefghijklmnopqrstuvwxyz";
		const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const numChars = "0123456789";
		const specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?";
		let chars = lower;

		if (upper) chars += upperChars;
		if (nums) chars += numChars;
		if (special) chars += specialChars;

		let pass = "";
		for (let i = 0; i < len; i++) {
			const randIdx = Math.floor(Math.random() * chars.length);
			pass += chars[randIdx];
		}
		let passExist = await prisma.user.findFirst({
			where: {
				password: pass,
			},
		});
		while (passExist) {
			passExist = await prisma.user.findFirst({
				where: {
					password: pass,
				},
			});
		}
		return pass;
	} catch (err) {
		if (err instanceof Error) {
			console.log(err.message);
			return "";
		}
	}
};

// Project Generator Method
export const generateProjectCode = async (): Promise<
	string | number | undefined
> => {
	try {
		const getLastProject = await prisma.project.findFirst({
			orderBy: {
				id: "desc",
			},
		});

		// If no user is found, return the first employee code
		if (!getLastProject) return "KPYXP001";

		const lastProjectId = getLastProject.projectCode;
		console.log("id", lastProjectId);

		// Extract the last 4 digits from the employee code
		const extractDigit = lastProjectId.match(/\d{3}$/);
		console.log("digit : ", extractDigit);

		if (extractDigit) {
			// Increment the numeric part by 1
			const newProjectId =
				"KPYXP" +
				(parseInt(extractDigit[0]) + 1)
					.toString()
					.padStart(3, "0");
			console.log("newProjectId : ", newProjectId);
			return newProjectId;
		} else {
			return "Error: Invalid employee code format";
		}
	} catch (err) {
		if (err instanceof Error) {
			console.log(err.message);
			return 0;
		}
	}
};

export const generateProjectSlug = async (projectName: string) => {
	// Convert to lowercase and replace spaces, underscores, and special characters with hyphens
	let baseSlug = projectName
		.toLowerCase()
		.replace(/[_\s]+/g, "-")
		.replace(/[^a-z0-9-]/g, "");
	let slug = baseSlug;
	let counter = 1;

	// Check if slug already exists in the database
	while (await prisma.project.findFirst({ where: { slug: slug } })) {
		slug = `${baseSlug}-${counter}`;
		counter++;
	}

	return slug;
};
