import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { validateProject, sanitizeInput } from "../middleware/validation.middleware.js";
import * as projectService from "../services/project.service.js";

const router = express.Router();

// Apply authentication and sanitization to all routes
router.use(protect);
router.use(sanitizeInput);

// Get all user projects (from all workspaces)
router.get("/", async(req, res) => {
    try {
        const projects = await projectService.getUserProjects(req.user.id);
        res.status(200).json({ projects });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Create project
router.post("/", validateProject, async(req, res) => {
    try {
        console.log('Project creation request:', req.body);
        console.log('User:', req.user);

        const project = await projectService.createProject(req.user.id, req.body);

        res.status(201).json({
            message: "Project created successfully",
            project
        });
    } catch (err) {
        console.error('Project creation error:', err);
        res.status(400).json({ error: err.message, details: err.stack });
    }
});

// Get workspace projects
router.get("/workspace/:workspaceId", async(req, res) => {
    try {
        const projects = await projectService.getWorkspaceProjects(req.params.workspaceId, req.user.id);
        res.status(200).json({ projects });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
});

// Get project by ID
router.get("/:projectId", async(req, res) => {
    try {
        const project = await projectService.getProjectById(req.params.projectId, req.user.id);
        res.status(200).json({ project });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
});

// Add project member
router.post("/:projectId/members", async(req, res) => {
    try {
        const { user_id, email, role } = req.body;

        if (!role) {
            return res.status(400).json({ error: "Role is required" });
        }

        if (!user_id && !email) {
            return res.status(400).json({ error: "User ID or email is required" });
        }

        const membership = await projectService.addProjectMember(
            req.params.projectId,
            req.user.id, { user_id, email, role }
        );

        res.status(201).json({
            message: "Member added successfully",
            membership
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;