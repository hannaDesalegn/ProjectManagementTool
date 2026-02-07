import prisma from "../config/prisma.js";

// Check if user has access to workspace
export const checkWorkspaceAccess = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user.id;

        if (!workspaceId) {
            return res.status(400).json({ error: "Workspace ID is required" });
        }

        // Check if user is a member of the workspace
        const membership = await prisma.memberships.findUnique({
            where: {
                user_id_workspace_id: {
                    user_id: userId,
                    workspace_id: workspaceId
                }
            },
            include: {
                workspace: true
            }
        });

        if (!membership) {
            return res.status(403).json({ error: "Access denied to this workspace" });
        }

        // Add workspace and membership info to request
        req.workspace = membership.workspace;
        req.membership = membership;
        
        next();
    } catch (error) {
        console.error("Workspace access check error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Check if user has admin or owner role in workspace
export const requireWorkspaceAdmin = async (req, res, next) => {
    try {
        const membership = req.membership;

        if (!membership || (membership.role !== 'Owner' && membership.role !== 'Admin')) {
            return res.status(403).json({ error: "Admin or Owner role required" });
        }

        next();
    } catch (error) {
        console.error("Workspace admin check error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Check if user is workspace owner
export const requireWorkspaceOwner = async (req, res, next) => {
    try {
        const membership = req.membership;

        if (!membership || membership.role !== 'Owner') {
            return res.status(403).json({ error: "Owner role required" });
        }

        next();
    } catch (error) {
        console.error("Workspace owner check error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Check organization verification permissions
export const checkVerificationPermission = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user.id;

        const workspace = await prisma.workspaces.findUnique({
            where: { id: workspaceId },
            include: {
                memberships: {
                    where: { user_id: userId }
                }
            }
        });

        if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        const membership = workspace.memberships[0];
        
        // Only organization owners can request verification
        if (workspace.type !== 'ORGANIZATION' || !membership || membership.role !== 'Owner') {
            return res.status(403).json({ error: "Only organization owners can manage verification" });
        }

        req.workspace = workspace;
        req.membership = membership;
        
        next();
    } catch (error) {
        console.error("Verification permission check error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export default {
    checkWorkspaceAccess,
    requireWorkspaceAdmin,
    requireWorkspaceOwner,
    checkVerificationPermission
};