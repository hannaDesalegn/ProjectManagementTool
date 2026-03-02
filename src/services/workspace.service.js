import prisma from '../config/prisma.js';

export const createWorkspace = async(userId, workspaceData) => {
    const { name, type } = workspaceData;

    console.log('Creating workspace:', { userId, name, type });

    try {
        const workspace = await prisma.workspace.create({
            data: {
                name,
                type,
                owner_id: userId,
                verified: false,
                plan: 'FREE',
                member_limit: 15,
                current_members: 1
            }
        });

        console.log('Workspace created:', workspace);

        // Create membership for owner
        const membership = await prisma.membership.create({
            data: {
                user_id: userId,
                workspace_id: workspace.id,
                role: 'Owner'
            }
        });

        console.log('Membership created:', membership);

        return workspace;
    } catch (error) {
        console.error('Error creating workspace:', error);
        throw error;
    }
};

export const getUserWorkspaces = async(userId) => {
    console.log('Getting workspaces for user:', userId);

    try {
        const memberships = await prisma.membership.findMany({
            where: {
                user_id: userId
            },
            include: {
                workspace: true
            }
        });

        console.log('Found memberships:', memberships.length);

        const workspaces = memberships.map(m => m.workspace);
        console.log('Returning workspaces:', workspaces);

        return workspaces;
    } catch (error) {
        console.error('Error getting user workspaces:', error);
        throw error;
    }
};

export const getWorkspaceById = async(workspaceId, userId) => {
    // Check if user has access
    const membership = await prisma.membership.findFirst({
        where: {
            workspace_id: workspaceId,
            user_id: userId
        }
    });

    if (!membership) {
        throw new Error('Access denied');
    }

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            memberships: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }
        }
    });

    return workspace;
};

export const inviteToWorkspace = async(workspaceId, userId, inviteData) => {
    const { email, role } = inviteData;

    console.log('Creating invitation:', { workspaceId, email, role });

    // Check if user is owner or admin
    const membership = await prisma.membership.findFirst({
        where: {
            workspace_id: workspaceId,
            user_id: userId,
            role: { in: ['Owner', 'Admin'] }
        }
    });

    if (!membership) {
        throw new Error('Only owners and admins can invite members');
    }

    // Generate invitation token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation = await prisma.invitation.create({
        data: {
            workspace_id: workspaceId,
            email,
            role,
            token,
            expires_at: expiresAt
        }
    });

    console.log('Invitation created:', invitation);

    return invitation;
};

// Get workspace invitations
export const getWorkspaceInvitations = async(workspaceId, userId) => {
    // Check if user is owner or admin
    const membership = await prisma.membership.findFirst({
        where: {
            workspace_id: workspaceId,
            user_id: userId,
            role: { in: ['Owner', 'Admin'] }
        }
    });

    if (!membership) {
        throw new Error('Only owners and admins can view invitations');
    }

    const invitations = await prisma.invitation.findMany({
        where: {
            workspace_id: workspaceId,
            expires_at: { gte: new Date() }
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return invitations;
};

// Get user invitations
export const getUserInvitations = async(userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
    });

    console.log('Getting invitations for user:', userId, 'email:', user ? user.email : 'not found');

    if (!user) {
        throw new Error('User not found');
    }

    const invitations = await prisma.invitation.findMany({
        where: {
            email: user.email,
            expires_at: { gte: new Date() }
        },
        include: {
            workspace: {
                select: {
                    id: true,
                    name: true,
                    type: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    console.log('Found invitations:', invitations.length);

    return invitations;
};

// Accept invitation
export const acceptInvitation = async(invitationId, userId) => {
    const invitation = await prisma.invitation.findUnique({
        where: { id: invitationId },
        include: { workspace: true }
    });

    if (!invitation) {
        throw new Error('Invitation not found');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
    });

    if (invitation.email !== user.email) {
        throw new Error('This invitation is not for you');
    }

    if (new Date() > invitation.expires_at) {
        throw new Error('Invitation has expired');
    }

    // Check if already a member
    const existingMembership = await prisma.membership.findFirst({
        where: {
            workspace_id: invitation.workspace_id,
            user_id: userId
        }
    });

    if (existingMembership) {
        // Delete invitation
        await prisma.invitation.delete({ where: { id: invitationId } });
        throw new Error('You are already a member of this workspace');
    }

    // Create membership
    await prisma.membership.create({
        data: {
            workspace_id: invitation.workspace_id,
            user_id: userId,
            role: invitation.role
        }
    });

    // Update workspace member count
    await prisma.workspace.update({
        where: { id: invitation.workspace_id },
        data: {
            current_members: { increment: 1 }
        }
    });

    // Delete invitation
    await prisma.invitation.delete({ where: { id: invitationId } });

    return { message: 'Invitation accepted', workspace: invitation.workspace };
};

// Reject invitation
export const rejectInvitation = async(invitationId, userId) => {
    const invitation = await prisma.invitation.findUnique({
        where: { id: invitationId }
    });

    if (!invitation) {
        throw new Error('Invitation not found');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
    });

    if (invitation.email !== user.email) {
        throw new Error('This invitation is not for you');
    }

    // Delete invitation
    await prisma.invitation.delete({ where: { id: invitationId } });

    return { message: 'Invitation rejected' };
};