import express from "express";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import fs from "fs";

const router = express.Router();
const {
	addUser,
	editUser,
	getUser,
	getAllUser,
	deleteUser,
	getUsersForProject,
	updateUserProfile,
	getUserReport,
} = require("../controllers/user");

const uploadDir = path.join(__dirname, "uploads", "user");

if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		if (
			!fs.existsSync(
				path.join(
					__dirname,
					`./public/uploads/user/${file.originalname}`,
				),
			)
		) {
			cb(null, "./public/uploads/user");
		}
	},
	filename: (req, file, cb) => {
		const extName = path.extname(file.originalname);

		if (
			!fs.existsSync(
				path.join(
					__dirname,
					`./public/uploads/user/${file.originalname}`,
				),
			)
		) {
			const filename = `${uuid()}${Date.now()}${extName}`;
			cb(null, filename);
		}
	},
});

const upload = multer({ storage: storage });

router.post("/add", upload.single("image"), addUser);
router.put("/edit", upload.single("image"), editUser);
router.get("/all", getAllUser);
router.get("/project", getUsersForProject);
router.post("/:id", getUser);
router.delete("/delete/:id", deleteUser);
router.put("/edit-profile", upload.single("image"), updateUserProfile);
router.get("/report/:id", getUserReport);
module.exports = router;
