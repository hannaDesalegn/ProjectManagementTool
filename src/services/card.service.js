import prisma from "../config/prisma.js";
import logger from "../utils/logger.js";

class CardService {
    // Create a new card
    async createCard({ title, description, list_id, priority, due_date, assigned_to, labels, color, user_id }) {
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
                throw new Error("You don't have permission to create cards");
            }

            // Get the highest position
            const lastCard = await prisma.card.findFirst({
                where: { list_id, deleted_at: null },
                orderBy: { position: "desc" },
            });

            const position = lastCard ? lastCard.position + 1 : 1;

            const card = await prisma.card.create({
                data: {
                    title,
                    description,
                    list_id,
                    board_id: list.board_id,
                    workspace_id: list.board.workspace_id,
                    position,
                    priority: priority || "MEDIUM",
                    due_date: due_date ? new Date(due_date) : null,
                    assigned_to,
                    labels: labels || null,
                    color: color || null,
                },
                include: {
                    assignee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile_pic: true,
                        },
                    },
                },
            });

            logger.info(`Card created: ${card.id} by user ${user_id}`);
            return card;
        } catch (error) {
            logger.error(`Error creating card: ${error.message}`);
            throw error;
        }
    }

    // Get card by ID with all details
    async getCardById(card_id, user_id) {
        try {
            const card = await prisma.card.findFirst({
                where: {
                    id: card_id,
                    deleted_at: null,
                },
                include: {
                    assignee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile_pic: true,
                        },
                    },
                    list: {
                        select: {
                            id: true,
                            name: true,
                            board_id: true,
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
                    subtasks: {
                        where: { deleted_at: null },
                        orderBy: { position: "asc" },
                    },
                },
            });

            if (!card) {
                throw new Error("Card not found");
            }

            // Verify access
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: card.workspace_id,
                    left_at: null,
                },
            });

            if (!membership) {
                throw new Error("You don't have access to this card");
            }

            return card;
        } catch (error) {
            logger.error(`Error getting card: ${error.message}`);
            throw error;
        }
    }

    // Update card
    async updateCard(card_id, user_id, updates) {
        try {
            const card = await prisma.card.findFirst({
                where: {
                    id: card_id,
                    deleted_at: null,
                },
            });

            if (!card) {
                throw new Error("Card not found");
            }

            // Verify access
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: card.workspace_id,
                    left_at: null,
                },
            });

            if (!membership || membership.role === "Viewer") {
                throw new Error("You don't have permission to update this card");
            }

            // Handle due_date conversion
            if (updates.due_date) {
                updates.due_date = new Date(updates.due_date);
            }

            const updatedCard = await prisma.card.update({
                where: { id: card_id },
                data: updates,
                include: {
                    assignee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile_pic: true,
                        },
                    },
                },
            });

            logger.info(`Card updated: ${card_id} by user ${user_id}`);
            return updatedCard;
        } catch (error) {
            logger.error(`Error updating card: ${error.message}`);
            throw error;
        }
    }

    // Move card to different list
    async moveCard(card_id, user_id, new_list_id, new_position) {
        try {
            const card = await prisma.card.findFirst({
                where: {
                    id: card_id,
                    deleted_at: null,
                },
            });

            if (!card) {
                throw new Error("Card not found");
            }

            const newList = await prisma.list.findFirst({
                where: {
                    id: new_list_id,
                    deleted_at: null,
                },
                include: {
                    board: true,
                },
            });

            if (!newList) {
                throw new Error("Target list not found");
            }

            // Verify access
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: card.workspace_id,
                    left_at: null,
                },
            });

            if (!membership || membership.role === "Viewer") {
                throw new Error("You don't have permission to move this card");
            }

            // Calculate position if not provided
            let position = new_position;
            if (!position) {
                const lastCard = await prisma.card.findFirst({
                    where: { list_id: new_list_id, deleted_at: null },
                    orderBy: { position: "desc" },
                });
                position = lastCard ? lastCard.position + 1 : 1;
            }

            // Update card status based on list name
            let status = card.status;
            if (newList.name.toLowerCase().includes("done") || newList.name.toLowerCase().includes("complete")) {
                status = "Done";
            } else if (newList.name.toLowerCase().includes("progress")) {
                status = "InProgress";
            } else if (newList.name.toLowerCase().includes("todo") || newList.name.toLowerCase().includes("to do")) {
                status = "ToDo";
            }

            const movedCard = await prisma.card.update({
                where: { id: card_id },
                data: {
                    list_id: new_list_id,
                    position,
                    status,
                },
                include: {
                    assignee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile_pic: true,
                        },
                    },
                },
            });

            logger.info(`Card moved: ${card_id} to list ${new_list_id} by user ${user_id}`);
            return movedCard;
        } catch (error) {
            logger.error(`Error moving card: ${error.message}`);
            throw error;
        }
    }

    // Delete card (soft delete)
    async deleteCard(card_id, user_id) {
        try {
            const card = await prisma.card.findFirst({
                where: {
                    id: card_id,
                    deleted_at: null,
                },
            });

            if (!card) {
                throw new Error("Card not found");
            }

            // Verify access
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: card.workspace_id,
                    left_at: null,
                },
            });

            if (!membership || membership.role === "Viewer") {
                throw new Error("You don't have permission to delete this card");
            }

            await prisma.card.update({
                where: { id: card_id },
                data: { deleted_at: new Date() },
            });

            logger.info(`Card deleted: ${card_id} by user ${user_id}`);
            return { message: "Card deleted successfully" };
        } catch (error) {
            logger.error(`Error deleting card: ${error.message}`);
            throw error;
        }
    }

    // Add checklist item
    async addChecklistItem(card_id, user_id, content) {
        try {
            const card = await prisma.card.findFirst({
                where: {
                    id: card_id,
                    deleted_at: null,
                },
            });

            if (!card) {
                throw new Error("Card not found");
            }

            // Verify access
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: card.workspace_id,
                    left_at: null,
                },
            });

            if (!membership || membership.role === "Viewer") {
                throw new Error("You don't have permission to add checklist items");
            }

            // Get the highest position
            const lastItem = await prisma.checklistItem.findFirst({
                where: { card_id },
                orderBy: { position: "desc" },
            });

            const position = lastItem ? lastItem.position + 1 : 1;

            const item = await prisma.checklistItem.create({
                data: {
                    card_id,
                    content,
                    position,
                },
            });

            logger.info(`Checklist item added to card ${card_id} by user ${user_id}`);
            return item;
        } catch (error) {
            logger.error(`Error adding checklist item: ${error.message}`);
            throw error;
        }
    }

    // Toggle checklist item
    async toggleChecklistItem(item_id, user_id) {
        try {
            const item = await prisma.checklistItem.findUnique({
                where: { id: item_id },
                include: {
                    card: true,
                },
            });

            if (!item) {
                throw new Error("Checklist item not found");
            }

            // Verify access
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: item.card.workspace_id,
                    left_at: null,
                },
            });

            if (!membership || membership.role === "Viewer") {
                throw new Error("You don't have permission to update checklist items");
            }

            const updatedItem = await prisma.checklistItem.update({
                where: { id: item_id },
                data: { is_completed: !item.is_completed },
            });

            return updatedItem;
        } catch (error) {
            logger.error(`Error toggling checklist item: ${error.message}`);
            throw error;
        }
    }

    // Add comment
    async addComment(card_id, user_id, content) {
        try {
            const card = await prisma.card.findFirst({
                where: {
                    id: card_id,
                    deleted_at: null,
                },
            });

            if (!card) {
                throw new Error("Card not found");
            }

            // Verify access
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: card.workspace_id,
                    left_at: null,
                },
            });

            if (!membership) {
                throw new Error("You don't have access to this card");
            }

            const comment = await prisma.comment.create({
                data: {
                    card_id,
                    user_id,
                    content,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            profile_pic: true,
                        },
                    },
                },
            });

            logger.info(`Comment added to card ${card_id} by user ${user_id}`);
            return comment;
        } catch (error) {
            logger.error(`Error adding comment: ${error.message}`);
            throw error;
        }
    }

    // Add reaction
    async addReaction(card_id, user_id, emoji) {
        try {
            const card = await prisma.card.findFirst({
                where: {
                    id: card_id,
                    deleted_at: null,
                },
            });

            if (!card) {
                throw new Error("Card not found");
            }

            // Verify access
            const membership = await prisma.membership.findFirst({
                where: {
                    user_id,
                    workspace_id: card.workspace_id,
                    left_at: null,
                },
            });

            if (!membership) {
                throw new Error("You don't have access to this card");
            }

            // Check if reaction already exists
            const existing = await prisma.reaction.findFirst({
                where: {
                    card_id,
                    user_id,
                    emoji,
                },
            });

            if (existing) {
                // Remove reaction if it exists
                await prisma.reaction.delete({
                    where: { id: existing.id },
                });
                return { message: "Reaction removed" };
            }

            const reaction = await prisma.reaction.create({
                data: {
                    card_id,
                    user_id,
                    emoji,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            logger.info(`Reaction added to card ${card_id} by user ${user_id}`);
            return reaction;
        } catch (error) {
            logger.error(`Error adding reaction: ${error.message}`);
            throw error;
        }
    }
}

export default new CardService();