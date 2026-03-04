export const deleteProject = async(projectId, userId) => {
    // Only project admin or workspace owner can delete
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('Project not found');
    // Check if user is workspace owner
    const workspace = await prisma.workspace.findUnique({ where: { id: project.workspace_id } });
    const isOwner = workspace && workspace.owner_id === userId;
    // Or project admin
    const membership = await prisma.projectMembership.findFirst({ where: { project_id: projectId, user_id: userId, role: 'ProjectAdmin' } });
    if (!isOwner && !membership) throw new Error('Only the workspace owner or project admin can delete this project');
    // Soft delete: set deleted_at
    await prisma.project.update({ where: { id: projectId }, data: { deleted_at: new Date() } });
    // Optionally, also soft-delete related boards, etc.
    await prisma.board.updateMany({ where: { project_id: projectId }, data: { deleted_at: new Date() } });
    return true;
};
import prisma from '../config/prisma.js';

export const getUserProjects = async(userId) => {
    console.log('Getting all projects for user:', userId);

    try {
        // Get all workspaces user is member of
        const memberships = await prisma.membership.findMany({
            where: {
                user_id: userId
            },
            select: {
                workspace_id: true
            }
        });

        const workspaceIds = memberships.map(m => m.workspace_id);
        console.log('User workspaces:', workspaceIds);

        // Get all projects from those workspaces
        const projects = await prisma.project.findMany({
            where: {
                workspace_id: { in: workspaceIds },
                deleted_at: null
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        console.log('Found projects:', projects.length);

        return projects;
    } catch (error) {
        console.error('Error getting user projects:', error);
        throw error;
    }
};

export const createProject = async(userId, projectData) => {
    const { name, description, workspace_id, start_date, end_date } = projectData;

    console.log('Creating project:', { userId, name, workspace_id });

    try {
        // Check if user has access to workspace
        const membership = await prisma.membership.findFirst({
            where: {
                workspace_id,
                user_id: userId
            }
        });

        if (!membership) {
            throw new Error('Access denied to this workspace');
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                workspace_id,
                status: 'Active',
                is_public: false,
                start_date: new Date(start_date),
                end_date: new Date(end_date)
            }
        });

        console.log('Project created:', project);

        // Add creator as project admin
        const projectMembership = await prisma.projectMembership.create({
            data: {
                project_id: project.id,
                user_id: userId,
                role: 'ProjectAdmin'
            }
        });

        console.log('Project membership created:', projectMembership);

        return project;
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
};

export const getWorkspaceProjects = async(workspaceId, userId) => {
    console.log('Getting projects for workspace:', workspaceId, 'user:', userId);

    try {
        // Check if user has access to workspace
        const membership = await prisma.membership.findFirst({
            where: {
                workspace_id: workspaceId,
                user_id: userId
            }
        });

        if (!membership) {
            throw new Error('Access denied to this workspace');
        }

        const projects = await prisma.project.findMany({
            where: {
                workspace_id: workspaceId,
                deleted_at: null
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        console.log('Found projects:', projects.length);

        return projects;
    } catch (error) {
        console.error('Error getting workspace projects:', error);
        throw error;
    }
};

export const getProjectById = async(projectId, userId) => {
    // Check if user has access
    const projectMembership = await prisma.projectMembership.findFirst({
        where: {
            project_id: projectId,
            user_id: userId
        }
    });

    if (!projectMembership) {
        throw new Error('Access denied');
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            boards: true,
            project_memberships: {
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

    return project;
};

export const addProjectMember = async(projectId, userId, memberData) => {
    const { email, role, user_id } = memberData;

    // Check if requester is project admin
    const requesterMembership = await prisma.projectMembership.findFirst({
        where: {
            project_id: projectId,
            user_id: userId,
            role: 'ProjectAdmin'
        }
    });

    if (!requesterMembership) {
        throw new Error('Only project admins can add members');
    }

    let targetUserId = user_id;

    // If email provided, look up user
    if (email && !user_id) {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new Error('User not found with that email');
        }

        targetUserId = user.id;
    }

    if (!targetUserId) {
        throw new Error('User ID or email is required');
    }

    // Check if user already a member
    const existingMembership = await prisma.projectMembership.findFirst({
        where: {
            project_id: projectId,
            user_id: targetUserId
        }
    });

    if (existingMembership) {
        throw new Error('User is already a project member');
    }

    const membership = await prisma.projectMembership.create({
        data: {
            project_id: projectId,
            user_id: targetUserId,
            role
        }
    });

    return membership;
};