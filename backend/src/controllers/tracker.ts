import { Request, Response } from "express";
import { Tracker } from "../interface/tracker";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const setTrackerTime = async (
	req: Request,
	res: Response,
): Promise<any> => {
	try {
		// Destructuring input fields from the request body
		const { startTime, stopTime, type, userId } = req.body as Tracker;
		const currentDate = new Date().toISOString().split("T")[0];
		console.log(req.body);
		// Checking for an empty userId
		if (!userId) {
			return res
				.status(401)
				.json({ message: "Unauthorized User Access" });
		}

		// Find the latest tracker entry for the user
		const userTracker = await prisma.tracker.findFirst({
			orderBy: { createdAt: "desc" }, // Order by the latest created tracker
			where: { userId: userId },
		});

		// If no existing tracker and the type is "start"
		if (!userTracker && type === "start") {
			if (startTime) {
				// Create a new tracker for the user
				const newUserTracker = await prisma.tracker.create({
					data: {
						startTime: new Date(startTime), // Ensure startTime is a valid Date object
						user: {
							connect: { id: userId }, // Connect to the existing user
						},
					},
				});
				return res.status(200).json({
					message: "Tracker Started Successfully",
					time: newUserTracker,
				});
			} else {
				return res
					.status(400)
					.json({ message: "Start Time is required" });
			}
		}
		if (userTracker && type == "start" && userTracker.stopTime) {
			if (startTime) {
				// Create a new tracker for the user
				const newUserTracker = await prisma.tracker.create({
					data: {
						startTime: new Date(startTime), // Ensure startTime is a valid Date object
						user: {
							connect: { id: userId }, // Connect to the existing user
						},
					},
				});
				return res.status(200).json({
					message: "Tracker Started Successfully",
					time: newUserTracker,
				});
			} else {
				return res
					.status(400)
					.json({ message: "Start Time is required" });
			}
		}
		// If there's an existing tracker and the type is "stop"
		if (userTracker && type === "stop") {
			if (stopTime) {
				const requestedStopTimeDate = new Date(stopTime)
					.toISOString()
					.split("T")[0];

				// Check if the stop is on the same date as the current date
				if (requestedStopTimeDate === currentDate) {
					// Ensure that a tracker has started and been paused before stopping
					if (!userTracker.startTime) {
						return res.status(400).json({
							message: "Tracker Not Started Yet",
						});
					}

					// Update the stopTime in the tracker
					const updatedTracker =
						await prisma.tracker.update({
							where: {
								id: userTracker.id, // Update based on the latest userTracker
							},
							data: {
								stopTime: new Date(stopTime), // Convert stopTime to Date
							},
						});
					return res.status(200).json({
						message: "Tracker Stopped Successfully",
						time: updatedTracker,
					});
				} else {
					return res.status(400).json({
						message: "Stop Time should be on the current date.",
					});
				}
			} else {
				return res
					.status(400)
					.json({ message: "Stop Time is required" });
			}
		}

		// If no valid action is matched
		return res.status(400).json({
			message: "Invalid action type or missing time values.",
		});
	} catch (err) {
		// Catch any unexpected errors and log them
		if (err instanceof Error) {
			console.log(err.message);
			return res.status(500).json({
				message: "Internal Server Error",
				error: err.message,
			});
		}
	}
};
export const getTrackerTime = async (
	req: Request,
	res: Response,
): Promise<any> => {
	try {
		const { type } = req.query as any;
		const { user } = req as any;

		if (!user) {
			return res
				.status(401)
				.json({ message: "Unauthorized Access" });
		}

		const trackerTime = await prisma.tracker.findFirst({
			orderBy: {
				id: "desc",
			},
			where: {
				user: {
					id: typeof user.id == "string" ? user.id : "",
				},
			},
		});

		if (trackerTime) {
			return res.status(200).json({
				message: "Tracker Time Found",
				time: trackerTime,
			});
		} else {
			return res
				.status(404)
				.json({ message: "Tracker Time not found" });
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

export const getTrackerHistory = async (
	req: Request,
	res: Response,
): Promise<any> => {
	try {
		const { userId } = req.query as any;
		const userTrackerHistory = await prisma.tracker.findMany({
			orderBy: {
				id: "desc",
			},
			where: {
				user: {
					id: userId,
				},
			},
		});

		if (userTrackerHistory) {
			return res.status(200).json({
				message: "History Found",
				history: userTrackerHistory,
			});
		} else {
			return res.status(404).json({ message: "Not History Found" });
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
