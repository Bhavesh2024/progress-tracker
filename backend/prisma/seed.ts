import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readlineSync from "readline-sync";

const prisma = new PrismaClient();
const createAdmin = async () => {
	try {
		const name = readlineSync.question("Name :- ");
		const username = readlineSync.question("Username :- ");
		const gender = readlineSync.question("Gender :-");
		const email = readlineSync.question("Email :- ");
		const phone = readlineSync.question("Phone :- ");
		const password = readlineSync.question("Password :- ");

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await prisma.user.create({
			data: {
				empCode: "KPYX0000",
				name,
				email,
				gender,
				phone,
				password: hashedPassword,
				username,
				role: "admin",
			},
		});

		if (newUser) {
			console.log("Admin created successfully");
		}
	} catch (err) {
		if (err instanceof Error) {
			console.log("Error :-", err.message);
		}
	}
};

createAdmin();
