import prisma from "../config/prisma.js";

export const createProject = async ({ name, description, workspace_id, start_date, end_date, team_id, user_id }) => {
    if (!name || !workspace_id || !start_date || !end_date) {
        throw new Error("Name, workspace_id, start_date, and end_date are required");
    }

    // Check if user has access to workspace
    const membership = await prisma.memberships.findUnique({
        where: {
            user_id_workspace_id: {
                user_id: user_id,
                workspace_id: workspace_id
            }
        }
    });

    if (!membership) {
        throw new Error("Access denied to this workspace");
    }

    const project = await prisma.projects.create({
        data: {
            name,
            description,
            workspace_id,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            team_id,
            status: 'Active'
        },
        include: {
            workspace: {
                select: { id: true, name: true }
            },
            team: {
                select: { id: true, name: true }
            }
        }
    });

    // Add creator as project admin
    await prisma.projectMemberships.create({
        data: {
            project_id: project.id,
            user_id: user_id,
            role: 'ProjectAdmin'
        }
    });

    return project;
};

export const getWorkspaceProjects = async (workspace_id, user_id) => {
    // Check workspace access
    const membership = await prisma.memberships.findUnique({
        where: {
            user_id_workspace_id: {
                user_id: user_id,
                workspace_id: workspace_id
            }
        }
    });

    if (!membership) {
        throw new Error("Access denied to this workspace");
    }

    const projects = await prisma.projects.findMany({
        where: { workspace_id },
        include: {
            team: {
                select: { id: true, name: true }
            },
            project_memberships: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            },
            _count: {
                select: { boards: true }
            }
        }
    });

    return projects;
};

export const getProjectById = async (project_id, user_id) => {
    // Check if user has access to this project
    const projectMembership = await prisma.projectMemberships.findUnique({
        where: {
            project_id_user_id: {
                project_id: project_id,
                user_id: user_id
            }
        }
    });

    if (!projectMembership) {
        throw new Error("Access denied to this project");
    }

    const project = await prisma.projects.findUnique({
        where: { id: project_id },
        include: {
            workspace: {
                select: { id: true, name: true }
            },
            team: {
                select: { id: true, name: true }
            },
            project_memberships: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            },
            boards: {
                include: {
                    _count: {
                        select: { lists: true, cards: true }
                    }
                }
            }
        }
    });

    return project;
};

export const addProjectMember = async ({ project_id, user_id, role, admin_id }) => {
    // Check if admin has permission
    const adminMembership = await prisma.projectMemberships.findUnique({
        where: {
            project_id_user_id: {
                project_id: project_id,
                user_id: admin_id
            }
        }
    });

    if (!adminMembership || adminMembership.role !== 'ProjectAdmin') {
        throw new Error("Insufficient permissions");
    }

    // Check if user is already a member
    const existingMembership = await prisma.projectMemberships.findUnique({
        where: {
            project_id_user_id: {
                project_id: project_id,
                user_id: user_id
            }
        }
    });

    if (existingMembership) {
        throw new Error("User is already a project member");
    }

    const membership = await prisma.projectMemberships.create({
        data: {
            project_id,
            user_id,
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
    createProject,
    getWorkspaceProjects,
    getProjectById,
    addProjectMember
};