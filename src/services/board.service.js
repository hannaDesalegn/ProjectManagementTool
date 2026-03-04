import prisma from "../config/prisma.js";
import logger from "../utils/logger.js";

class BoardService {
    // Create a new board with default lists
    async createBoard({ name, project_id, workspace_id, user_id, background_color }) {
        try {
            // Verify user has access to the workspace
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id,
                    left_at: null,
                },
            });

            if (!membership) {
                throw new Error("You don't have access to this workspace");
            }

            // Verify project exists and belongs to workspace
            const project = await prisma.project.findFirst({
                where: {
                    id: project_id,
                    workspace_id,
                    deleted_at: null,
                },
            });

            if (!project) {
                throw new Error("Project not found in this workspace");
            }

            // Create board with default lists
            const board = await prisma.board.create({
                data: {
                    name,
                    project_id,
                    workspace_id,
                    background_color: background_color || '#8b5cf6', // Default purple
                    lists: {
                        create: [
                            { name: "To Do", position: 1 },
                            { name: "In Progress", position: 2 },
                            { name: "Done", position: 3 },
                        ],
                    },
                },
                include: {
                    lists: {
                        orderBy: { position: "asc" },
                    },
                },
            });

            logger.info(`Board created: ${board.id} by user ${user_id}`);
            return board;
        } catch (error) {
            logger.error(`Error creating board: ${error.message}`);
            throw error;
        }
    }

    // Get board with all lists and cards
    async getBoardById(board_id, user_id) {
        try {
            const board = await prisma.board.findFirst({
                where: {
                    id: board_id,
                    deleted_at: null,
                },
                include: {
                    lists: {
                        where: { deleted_at: null },
                        orderBy: { position: "asc" },
                        include: {
                            cards: {
                                where: { deleted_at: null },
                                orderBy: { position: "asc" },
                                include: {
                                    assignee: {
                                        select: {
                                            id: true,
                                            name: true,
                                            email: true,
                                            profile_pic: true,
                                        },
                                    },
                                    checklists: {
                                        orderBy: { position: "asc" },
                                    },
                                    comments: {
                                        orderBy: { created_at: "desc" },
                                        include: {
                                            user: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                    profile_pic: true,
                                                },
                                            },
                                        },
                                    },
                                    reactions: {
                                        include: {
                                            user: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    project: {
                        select: {
                            id: true,
                            name: true,
                            workspace_id: true,
                        },
                    },
                },
            });

            if (!board) {
                throw new Error("Board not found");
            }

            // Verify user has access
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: board.project.workspace_id,
                    left_at: null,
                },
            });

            if (!membership) {
                throw new Error("You don't have access to this board");
            }

            return board;
        } catch (error) {
            logger.error(`Error getting board: ${error.message}`);
            throw error;
        }
    }

    // Get all boards for a project
    async getBoardsByProject(project_id, user_id) {
        try {
            const project = await prisma.project.findFirst({
                where: {
                    id: project_id,
                    deleted_at: null,
                },
            });

            if (!project) {
                throw new Error("Project not found");
            }

            // Verify access
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: project.workspace_id,
                    left_at: null,
                },
            });

            if (!membership) {
                throw new Error("You don't have access to this project");
            }

            const boards = await prisma.board.findMany({
                where: {
                    project_id,
                    deleted_at: null,
                },
                include: {
                    lists: {
                        where: { deleted_at: null },
                        orderBy: { position: "asc" },
                        include: {
                            _count: {
                                select: { cards: true },
                            },
                        },
                    },
                },
                orderBy: { created_at: "desc" },
            });

            return boards;
        } catch (error) {
            logger.error(`Error getting boards: ${error.message}`);
            throw error;
        }
    }

    // Update board
    async updateBoard(board_id, user_id, updates) {
        try {
            const board = await prisma.board.findFirst({
                where: {
                    id: board_id,
                    deleted_at: null,
                },
                include: {
                    project: true,
                },
            });

            if (!board) {
                throw new Error("Board not found");
            }

            // Verify access
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: board.workspace_id,
                    left_at: null,
                },
            });

            if (!membership || membership.role === "Viewer") {
                throw new Error("You don't have permission to update this board");
            }

            const updatedBoard = await prisma.board.update({
                where: { id: board_id },
                data: updates,
                include: {
                    lists: {
                        where: { deleted_at: null },
                        orderBy: { position: "asc" },
                    },
                },
            });

            logger.info(`Board updated: ${board_id} by user ${user_id}`);
            return updatedBoard;
        } catch (error) {
            logger.error(`Error updating board: ${error.message}`);
            throw error;
        }
    }

    // Delete board (soft delete)
    async deleteBoard(board_id, user_id) {
        try {
            const board = await prisma.board.findFirst({
                where: {
                    id: board_id,
                    deleted_at: null,
                },
            });

            if (!board) {
                throw new Error("Board not found");
            }

            // Verify access - allow any workspace member to delete boards
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: board.workspace_id,
                    left_at: null,
                },
            });

            if (!membership) {
                throw new Error("You don't have access to this workspace");
            }

            // Only Viewers cannot delete
            if (membership.role === "Viewer") {
                throw new Error("Viewers cannot delete boards");
            }

            await prisma.board.update({
                where: { id: board_id },
                data: { deleted_at: new Date() },
            });

            logger.info(`Board deleted: ${board_id} by user ${user_id}`);
            return { message: "Board deleted successfully" };
        } catch (error) {
            logger.error(`Error deleting board: ${error.message}`);
            throw error;
        }
    }
}

export default new BoardService();