import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { validateWorkspace, sanitizeInput } from "../middleware/validation.middleware.js";
import * as workspaceService from "../services/workspace.service.js";

const router = express.Router();

// Apply authentication and sanitization to all routes
router.use(protect);
router.use(sanitizeInput);

// Get user's pending invitations - MUST be before /:workspaceId routes
router.get("/invitations/pending", async(req, res) => {
    try {
        const invitations = await workspaceService.getUserInvitations(req.user.id);
        res.status(200).json({ invitations });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Accept invitation
router.post("/invitations/:invitationId/accept", async(req, res) => {
    try {
        const result = await workspaceService.acceptInvitation(
            req.params.invitationId,
            req.user.id
        );
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Reject invitation
router.post("/invitations/:invitationId/reject", async(req, res) => {
    try {
        const result = await workspaceService.rejectInvitation(
            req.params.invitationId,
            req.user.id
        );
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Create workspace
router.post("/", validateWorkspace, async(req, res) => {
    try {
        console.log('Workspace creation request:', req.body);
        console.log('User:', req.user);

        const workspace = await workspaceService.createWorkspace(req.user.id, req.body);

        res.status(201).json({
            message: "Workspace created successfully",
            workspace
        });
    } catch (err) {
        console.error('Workspace creation error:', err);
        res.status(400).json({ error: err.message, details: err.stack });
    }
});

// Get user workspaces
router.get("/", async(req, res) => {
    try {
        const workspaces = await workspaceService.getUserWorkspaces(req.user.id);
        res.status(200).json({ workspaces });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get workspace by ID
router.get("/:workspaceId", async(req, res) => {
    try {
        const workspace = await workspaceService.getWorkspaceById(req.params.workspaceId, req.user.id);
        res.status(200).json({ workspace });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
});

// Invite to workspace
router.post("/:workspaceId/invite", async(req, res) => {
    try {
        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({ error: "Email and role are required" });
        }

        const invitation = await workspaceService.inviteToWorkspace(
            req.params.workspaceId,
            req.user.id, { email, role }
        );

        res.status(201).json({
            message: "User invited successfully",
            invitation
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get workspace invitations (for workspace owner/admin)
router.get("/:workspaceId/invitations", async(req, res) => {
    try {
        const invitations = await workspaceService.getWorkspaceInvitations(
            req.params.workspaceId,
            req.user.id
        );
        res.status(200).json({ invitations });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
});

export default router;