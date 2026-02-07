import prisma from "../config/prisma.js";
import { generateToken } from "../config/jwt.js";

// Create workspace invitation
export const createWorkspaceInvitation = async ({ workspaceId, email, role, inviterId }) => {
    if (!workspaceId || !email || !role) {
        throw new Error("Workspace ID, email, and role are required");
    }

    // Validate role
    const validRoles = ['Admin', 'Member', 'Viewer'];
    if (!validRoles.includes(role)) {
        throw new Error("Invalid role. Must be Admin, Member, or Viewer");
    }

    // Check if inviter has permission
    const inviterMembership = await prisma.memberships.findUnique({
        where: {
            user_id_workspace_id: {
                user_id: inviterId,
                workspace_id: workspaceId
            }
        }
    });

    if (!inviterMembership || (inviterMembership.role !== 'Owner' && inviterMembership.role !== 'Admin')) {
        throw new Error("Insufficient permissions to invite users");
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
        where: { email }
    });

    if (existingUser) {
        // Check if user is already a member
        const existingMembership = await prisma.memberships.findUnique({
            where: {
                user_id_workspace_id: {
                    user_id: existingUser.id,
                    workspace_id: workspaceId
                }
            }
        });

        if (existingMembership) {
            throw new Error("User is already a member of this workspace");
        }

        // Add existing user to workspace
        const membership = await prisma.memberships.create({
            data: {
                user_id: existingUser.id,
                workspace_id: workspaceId,
                role
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                workspace: {
                    select: { id: true, name: true }
                }
            }
        });

        return {
            type: 'direct_add',
            membership,
            message: 'User added to workspace successfully'
        };
    } else {
        // Create invitation token for new user
        const invitationToken = generateToken({
            email,
            workspaceId,
            role,
            type: 'workspace_invitation'
        });

        // Store invitation in database (you might want to create an Invitations table)
        // For now, we'll return the token for email sending
        
        return {
            type: 'invitation_sent',
            invitationToken,
            email,
            workspaceId,
            role,
            message: 'Invitation created successfully'
        };
    }
};

// Accept workspace invitation
export const acceptWorkspaceInvitation = async ({ token, userId }) => {
    try {
        // Verify invitation token
        const { verifyToken } = await import("../config/jwt.js");
        const decoded = verifyToken(token);

        if (decoded.type !== 'workspace_invitation') {
            throw new Error("Invalid invitation token");
        }

        const { email, workspaceId, role } = decoded;

        // Verify user email matches invitation
        const user = await prisma.users.findUnique({
            where: { id: userId }
        });

        if (!user || user.email !== email) {
            throw new Error("User email does not match invitation");
        }

        // Check if user is already a member
        const existingMembership = await prisma.memberships.findUnique({
            where: {
                user_id_workspace_id: {
                    user_id: userId,
                    workspace_id: workspaceId
                }
            }
        });

        if (existingMembership) {
            throw new Error("User is already a member of this workspace");
        }

        // Create membership
        const membership = await prisma.memberships.create({
            data: {
                user_id: userId,
                workspace_id: workspaceId,
                role
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                workspace: {
                    select: { id: true, name: true }
                }
            }
        });

        return membership;
    } catch (error) {
        throw new Error(`Failed to accept invitation: ${error.message}`);
    }
};

// Get workspace invitations (for admin view)
export const getWorkspaceInvitations = async (workspaceId, userId) => {
    // Check if user has admin access
    const membership = await prisma.memberships.findUnique({
        where: {
            user_id_workspace_id: {
                user_id: userId,
                workspace_id: workspaceId
            }
        }
    });

    if (!membership || (membership.role !== 'Owner' && membership.role !== 'Admin')) {
        throw new Error("Insufficient permissions to view invitations");
    }

    // In a real implementation, you'd fetch from an Invitations table
    // For now, return empty array as we're storing invitations as tokens
    return [];
};

export default {
    createWorkspaceInvitation,
    acceptWorkspaceInvitation,
    getWorkspaceInvitations
};