import express from "express";
import workspaceController from "../controllers/workspace.controller.js";
import invitationController from "../controllers/invitation.controller.js";
import verificationController from "../controllers/verification.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { 
    checkWorkspaceAccess, 
    requireWorkspaceAdmin, 
    requireWorkspaceOwner,
    checkVerificationPermission 
} from "../middleware/workspace.middleware.js";

const router = express.Router();

// All workspace routes require authentication
router.use(protect);

// Workspace management
router.post("/", workspaceController.createWorkspace);
router.get("/", workspaceController.getUserWorkspaces);
router.get("/:workspaceId", checkWorkspaceAccess, workspaceController.getWorkspace);

// Workspace invitations
router.post("/:workspaceId/invite", checkWorkspaceAccess, requireWorkspaceAdmin, invitationController.inviteToWorkspace);
router.get("/:workspaceId/invitations", checkWorkspaceAccess, requireWorkspaceAdmin, invitationController.getInvitations);
router.post("/invitations/accept", invitationController.acceptInvitation);

// Organization verification
router.post("/:workspaceId/verification/request", checkVerificationPermission, verificationController.requestVerification);
router.get("/:workspaceId/verification", checkWorkspaceAccess, requireWorkspaceAdmin, verificationController.getVerificationDetails);
router.patch("/:workspaceId/verification/status", verificationController.updateVerificationStatus); // System admin only
router.post("/:workspaceId/verification/domain", checkVerificationPermission, verificationController.verifyDomain);

export default router;