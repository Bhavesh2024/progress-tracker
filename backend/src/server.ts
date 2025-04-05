import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
// import {Strategy} from 'passp'
// const { Strategy: JWTStrategy } = require('passport')
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { PrismaClient } from "@prisma/client";
import { adminAuth } from "./middlewares/adminAuth";
import { Server } from "socket.io";
import { createServer } from "http";
const app = express();
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const projectRoutes = require("./routes/project");
const taskRoutes = require("./routes/task");
const cookieParser = require("cookie-parser");
const trackerRoutes = require("./routes/tracker");
require("dotenv").config();
// Middleware
app.use(express.json()); // Parses JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data
app.use(cookieParser());
app.use(express.static("public"));

const cookieExtractor = (req: Request): string | null => {
	return req.cookies.token || null;
};

interface JwtPayload {
	id: string;
	role: string;
	username: string;
}

const prisma = new PrismaClient();

passport.use(
	new JWTStrategy(
		{
			jwtFromRequest: cookieExtractor,
			secretOrKey: process.env.JWT_SECRET_KEY || "",
		},
		async (
			jwt_payload: JwtPayload,
			done: (error: any, user?: any, info?: any) => void,
		) => {
			if (jwt_payload) {
				const data = jwt_payload;
				const user = await prisma.user.findFirst({
					where: {
						id: data.id,
					},
				});
				if (user && user.id) {
					return done(null, user, {
						message: "User Found",
					});
				} else {
					return done(null, false, {
						message: "Unauthorized Access",
					});
				}
			}
		},
	),
);
// CORS Configuration
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000", // Adjust based on frontend URL
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.use(passport.initialize());

// Handle Preflight Requests for CORS
// app.options("*", cors());

app.use("/user/auth", authRoutes);
app.use("/user", passport.authenticate("jwt", { session: false }), userRoutes);
app.use(
	"/user/tracker",
	passport.authenticate("jwt", { session: false }),
	trackerRoutes,
);
app.use(
	"/user/project",
	passport.authenticate("jwt", { session: false }),
	adminAuth as any,
	projectRoutes,
);
app.use("/task", passport.authenticate("jwt", { session: false }), taskRoutes);

const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: `${process.env.CLIENT_URL}`,
		credentials: true,
	},
});

io.on("connection", (socket) => {
	socket.on("newTask", ({ task }) => {
		// console.log(task);
		socket.broadcast.emit("receivedTask", { task: task });
	});
	// console.log(socket.id, "connected successfully");
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
