import express from "express";

const router = express.Router();
const {
	createProject,
	getProjectFromId,
	getAllProject,
	getProjectFromSlug,
	editProject,
	deleteProject,
} = require("../controllers/project");
router.post("/add", createProject);
router.put("/edit", editProject);
router.get("/all", getAllProject);
router.get("/code/:id", getProjectFromId);
router.get("/slug/:slug", getProjectFromSlug);
router.delete("/delete/:id", deleteProject);

module.exports = router;
