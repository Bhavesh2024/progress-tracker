import { Request, Response, NextFunction } from "express";

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = req.user as { role: string } | undefined;

		if (user && user.role === "admin") {
			return next(); // Proceed to the next middleware/controller
		} else {
			return res
				.status(403)
				.json({ message: "Unauthorized Access" });
		}
	} catch (error) {
		return res.status(500).json({ message: "Internal Server Error" });
	}
};
