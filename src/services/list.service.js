import prisma from "../config/prisma.js";
import logger from "../utils/logger.js";

class ListService {
    // Create a new list
    async createList({ name, board_id, user_id }) {
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

            // Verify access
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: board.workspace_id,
                    left_at: null,
                },
            });

            if (!membership || membership.role === "Viewer") {
                throw new Error("You don't have permission to create lists");
            }

            // Get the highest position
            const lastList = await prisma.list.findFirst({
                where: { board_id, deleted_at: null },
                orderBy: { position: "desc" },
            });

            const position = lastList ? lastList.position + 1 : 1;

            const list = await prisma.list.create({
                data: {
                    name,
                    board_id,
                    position,
                },
                include: {
                    cards: {
                        where: { deleted_at: null },
                        orderBy: { position: "asc" },
                    },
                },
            });

            logger.info(`List created: ${list.id} by user ${user_id}`);
            return list;
        } catch (error) {
            logger.error(`Error creating list: ${error.message}`);
            throw error;
        }
    }

    // Update list
    async updateList(list_id, user_id, updates) {
        try {
            const list = await prisma.list.findFirst({
                where: {
                    id: list_id,
                    deleted_at: null,
                },
                include: {
                    board: true,
                },
            });

            if (!list) {
                throw new Error("List not found");
            }

            // Verify access
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: list.board.workspace_id,
                    left_at: null,
                },
            });

            if (!membership || membership.role === "Viewer") {
                throw new Error("You don't have permission to update this list");
            }

            const updatedList = await prisma.list.update({
                where: { id: list_id },
                data: updates,
            });

            logger.info(`List updated: ${list_id} by user ${user_id}`);
            return updatedList;
        } catch (error) {
            logger.error(`Error updating list: ${error.message}`);
            throw error;
        }
    }

    // Delete list (soft delete)
    async deleteList(list_id, user_id) {
        try {
            const list = await prisma.list.findFirst({
                where: {
                    id: list_id,
                    deleted_at: null,
                },
                include: {
                    board: true,
                },
            });

            if (!list) {
                throw new Error("List not found");
            }

            // Verify access
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: list.board.workspace_id,
                    left_at: null,
                },
            });

            if (!membership || membership.role === "Viewer") {
                throw new Error("You don't have permission to delete this list");
            }

            // Soft delete the list and all its cards
            await prisma.$transaction([
                prisma.list.update({
                    where: { id: list_id },
                    data: { deleted_at: new Date() },
                }),
                prisma.card.updateMany({
                    where: { list_id },
                    data: { deleted_at: new Date() },
                }),
            ]);

            logger.info(`List deleted: ${list_id} by user ${user_id}`);
            return { message: "List deleted successfully" };
        } catch (error) {
            logger.error(`Error deleting list: ${error.message}`);
            throw error;
        }
    }

    // Reorder lists
    async reorderLists(board_id, user_id, listOrders) {
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

            // Verify access
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: board.workspace_id,
                    left_at: null,
                },
            });

            if (!membership || membership.role === "Viewer") {
                throw new Error("You don't have permission to reorder lists");
            }

            // Update positions in a transaction
            await prisma.$transaction(
                listOrders.map(({ list_id, position }) =>
                    prisma.list.update({
                        where: { id: list_id },
                        data: { position },
                    })
                )
            );

            logger.info(`Lists reordered on board ${board_id} by user ${user_id}`);
            return { message: "Lists reordered successfully" };
        } catch (error) {
            logger.error(`Error reordering lists: ${error.message}`);
            throw error;
        }
    }
}

export default new ListService();