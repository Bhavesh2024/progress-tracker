import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
	ForgotPasswordRequestData,
	ForgotPasswordTokenVerificationData,
	MailResponse,
	TokenPayload,
	VerificationRequestData,
} from "../interface/auth";
import { sendMail } from "../utils/sendMail";
import { generateVerificationCode } from "../utils/generator";
import { v4 as uuid } from "uuid";
dotenv.config();
const prisma = new PrismaClient();
const cookieOptions: express.CookieOptions = {
	httpOnly: true,
	secure: false,
	maxAge: 24 * 60 * 60 * 1000,
	sameSite: "lax",
};

const SECRET_KEY = process.env.JWT_SECRET_KEY;
const handleLogin = async (req: Request, res: Response) => {
	try {
		const { username, password, role } = req.body;
		console.log(username);
		const user = await prisma.user.findFirst({
			where: {
				username: username,
				role: role,
			},
		});

		if (user) {
			const matchedPassword = await bcrypt.compare(
				password,
				user.password,
			);
			console.log(matchedPassword);
			const secret = SECRET_KEY || "";
			if (matchedPassword) {
				const token = jwt.sign(
					{
						id: user.id || "",
						username: user.username || "",
						role: user.role || "",
					},
					secret,
					{ expiresIn: "1d" },
				);
				res.cookie("token", token, cookieOptions);

				return res
					.status(201)
					.json({ message: "Login Successfully" });
			} else {
				return res
					.status(401)
					.json({ message: "Unauthorized Access" });
			}
		} else {
			return res
				.status(404)
				.json({ message: "Username not found" });
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

const checkLogin = async (req: Request, res: Response) => {
	const { userRole } = req.query;
	try {
		const token = req.cookies.token;

		// console.log(token);
		if (token && token !== "") {
			const decodeToken = jwt.verify(
				token,
				SECRET_KEY || "",
			) as TokenPayload;
			const { id, role } = decodeToken;
			if (role == userRole) {
				const user = await prisma.user.findFirst({
					where: {
						id: typeof id == "string" ? id : "",
						role: typeof role == "string" ? role : "",
					},
				});
				if (user) {
					return res.status(200).json({
						message: "User Found",
						currentUser: user,
					});
				} else {
					return res
						.status(404)
						.json({ message: "No User Found" });
				}
			} else {
				return res
					.status(401)
					.json({ message: "Unauthorized Access" });
			}
		} else {
			return res
				.status(401)
				.json({ message: "Unauthorized Access" });
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

const handleUserVerification = async (req: Request, res: Response) => {
	let { email, role } = req.body as VerificationRequestData;
	try {
		if (!email || email == "") {
			email = req.cookies.data;
		}
		const user = await prisma.user.findFirst({
			where: { email: email, role: role },
		});

		if (user) {
			const generateCode = generateVerificationCode(1, 8) as number;
			const generatedToken = uuid();
			const updateUser = await prisma.user.update({
				where: {
					email: email,
					role: role,
				},
				data: {
					code: generateCode,
					token: generatedToken,
				},
			});
			if (updateUser) {
				console.log(user.email);
				const verificationMailStatus = await sendMail(
					user.email,
					"Verify Your Account",
					{ code: generateCode, name: user.name },
					"verification",
				);
				const { message } =
					verificationMailStatus as MailResponse;
				// console.log(mailS)
				res.cookie("user", user.email, cookieOptions);
				return res.status(200).json({
					message: "Verification Code Sent Successfully",
					mailStatus: message,
				});
			} else {
				return res
					.status(500)
					.json({ message: "Mail Not Sent" });
			}
		} else {
			return res.status(401).json({ message: "No Email Found" });
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

const handleForgotPassword = async (req: Request, res: Response) => {
	try {
		const { email, password, role } =
			req.body as ForgotPasswordRequestData;
		const hashedPassword = await bcrypt.hash(password, 10);
		const isUserExist = await prisma.user.findFirst({
			where: {
				email: email,
				role: role,
			},
		});
		if (isUserExist) {
			await prisma.user.update({
				where: {
					email: email,
					role: role,
				},
				data: {
					token: "",
					code: 0,
					password: hashedPassword,
				},
			});

			return res
				.status(200)
				.json({ message: "Password Changed Successfully" });
		} else {
			return res
				.status(401)
				.json({ message: "Unauthenticated User" });
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

const handleResetPasswordVerification = async (req: Request, res: Response) => {
	const { token, role } = req.params as any;
	try {
		const authenticatedUser = await prisma.user.findFirst({
			where: {
				token: token,
				role: role,
			},
		});

		if (authenticatedUser) {
			return res.status(201).json({
				message: "Token Matched Authenticated User",
				user: authenticatedUser,
			});
		} else {
			return res
				.status(401)
				.json({ message: "Unauthenticated User" });
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

const handleCodeVerification = async (req: Request, res: Response) => {
	try {
		const { role, code } = req.body;
		console.log(typeof code);
		console.log(code);
		console.log(role);
		const user = await prisma.user.findFirst({
			where: {
				code: code,
				role: role,
			},
		});
		console.log(user);
		if (user) {
			await prisma.user.update({
				where: {
					email: user.email,
					role: role,
				},
				data: {
					code: 0,
				},
			});

			return res.status(200).json({
				message: "OTP Code Matched Successfully",
				token: user.token,
			});
		} else {
			return res
				.status(404)
				.json({ message: "Verification Code doesn't matched" });
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

const handleSendOTP = async (req: Request, res: Response) => {
	try {
		const { role } = req.body;
		const email = req.cookies.user;
		console.log(email || "helllo");
		if (email) {
			const user = await prisma.user.findFirst({
				where: { email: email, role: role },
			});

			if (user) {
				const generateCode = generateVerificationCode(
					1,
					6,
				) as number;
				const generatedToken = uuid();
				const updateUser = await (prisma as any)[
					role == "admin" ? "admin" : "user"
				]?.update({
					where: {
						email: email,
					},
					data: {
						code: generateCode,
						token: generatedToken,
					},
				});
				if (updateUser) {
					console.log(user.email);
					const verificationMailStatus = await sendMail(
						user.email,
						"Verify Your Account",
						{ code: generateCode, name: user.name },
						"verification",
					);
					const { message } =
						verificationMailStatus as MailResponse;
					res.cookie("user", user.email, cookieOptions);
					return res.status(200).json({
						message: "Verification Code Sent Successfully",
						mailStatus: message,
					});
				} else {
					return res
						.status(500)
						.json({ message: "Mail Not Sent" });
				}
			} else {
				return res
					.status(401)
					.json({ message: "No Email Found" });
			}
		} else {
			return res.status(401).json({ message: "Unauthorized User" });
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

const handleLogout = async (req: Request, res: Response) => {
	try {
		const { user } = req;

		if (user) {
			jwt.sign({}, SECRET_KEY || "", { expiresIn: 0 });
			res.cookie("token", "", { ...cookieOptions, maxAge: 0 });
			return res
				.status(200)
				.json({ message: "Logout Successfully" });
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
	handleLogin,
	checkLogin,
	handleUserVerification,
	handleForgotPassword,
	handleResetPasswordVerification,
	handleCodeVerification,
	handleSendOTP,
	handleLogout,
};
