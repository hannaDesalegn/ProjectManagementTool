import express from "express";
import projectController from "../controllers/project.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All project routes require authentication
router.use(protect);

router.post("/", projectController.createProject);
router.get("/workspace/:workspaceId", projectController.getWorkspaceProjects);
router.get("/:id", projectController.getProject);
router.post("/:id/members", projectController.addProjectMember);

export default router;