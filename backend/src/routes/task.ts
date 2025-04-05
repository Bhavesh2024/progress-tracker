import express from "express";

const router = express.Router();
import {
	addTask,
	deleteTaskById,
	editTask,
	getAllTask,
	getMembersProject,
	getProjectTask,
	getTaskById,
	getTaskByMember,
	getUserCurrentTasks,
} from "../controllers/task";
router.post("/add", addTask);
router.put("/edit", editTask);
router.delete("/delete/:id", deleteTaskById);
router.get("/all", getAllTask);
router.get("/:id", getTaskById);
router.get("/user/:member", getTaskByMember);
router.get("/project/member", getMembersProject);
router.get("/project/:code", getProjectTask);
router.get("/user/current/:id", getUserCurrentTasks);
module.exports = router;
// export default router;
