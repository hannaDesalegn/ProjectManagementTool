import prisma from "../config/prisma.js";

export const createWorkspace = async ({ name, type, owner_id, legal_name, org_domain, website }) => {
    if (!name || !type || !owner_id) {
        throw new Error("Name, type, and owner_id are required");
    }

    const workspace = await prisma.workspaces.create({
        data: {
            name,
            type,
            owner_id,
            legal_name,
            org_domain,
            website,
        },
        include: {
            owner: {
                select: { id: true, name: true, email: true }
            }
        }
    });

    // Create membership for the owner
    await prisma.memberships.create({
        data: {
            user_id: owner_id,
            workspace_id: workspace.id,
            role: 'Owner'
        }
    });

    return workspace;
};

export const getUserWorkspaces = async (userId) => {
    const memberships = await prisma.memberships.findMany({
        where: { user_id: userId },
        include: {
            workspace: {
                include: {
                    owner: {
                        select: { id: true, name: true, email: true }
                    },
                    _count: {
                        select: { memberships: true, projects: true }
                    }
                }
            }
        }
    });

    return memberships.map(m => m.workspace);
};

export const getWorkspaceById = async (workspaceId, userId) => {
    // Check if user has access to this workspace
    const membership = await prisma.memberships.findUnique({
        where: {
            user_id_workspace_id: {
                user_id: userId,
                workspace_id: workspaceId
            }
        }
    });

    if (!membership) {
        throw new Error("Access denied to this workspace");
    }

    const workspace = await prisma.workspaces.findUnique({
        where: { id: workspaceId },
        include: {
            owner: {
                select: { id: true, name: true, email: true }
            },
            memberships: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            },
            projects: {
                include: {
                    _count: {
                        select: { boards: true }
                    }
                }
            },
            teams: true
        }
    });

    return workspace;
};

export const inviteUserToWorkspace = async ({ workspaceId, email, role, inviterId }) => {
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

    // Find user by email
    const user = await prisma.users.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Check if user is already a member
    const existingMembership = await prisma.memberships.findUnique({
        where: {
            user_id_workspace_id: {
                user_id: user.id,
                workspace_id: workspaceId
            }
        }
    });

    if (existingMembership) {
        throw new Error("User is already a member of this workspace");
    }

    const membership = await prisma.memberships.create({
        data: {
            user_id: user.id,
            workspace_id: workspaceId,
            role
        },
        include: {
            user: {
                select: { id: true, name: true, email: true }
            }
        }
    });

    return membership;
};

export default {
    createWorkspace,
    getUserWorkspaces,
    getWorkspaceById,
    inviteUserToWorkspace
};