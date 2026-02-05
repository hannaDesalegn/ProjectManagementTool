import express from "express";
import workspaceController from "../controllers/workspace.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All workspace routes require authentication
router.use(protect);

router.post("/", workspaceController.createWorkspace);
router.get("/", workspaceController.getUserWorkspaces);
router.get("/:id", workspaceController.getWorkspace);
router.post("/:id/invite", workspaceController.inviteUser);

export default router;