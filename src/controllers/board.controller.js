import boardService from "../services/board.service.js";
import listService from "../services/list.service.js";
import cardService from "../services/card.service.js";
import { sendSuccess, sendError, errorResponse } from "../utils/response.js";

class BoardController {
    // Create board
    async createBoard(req, res) {
        try {
            const { name, project_id, workspace_id, background_color } = req.body;
            const user_id = req.user.id;

            if (!name || !project_id || !workspace_id) {
                return errorResponse(res, "Name, project_id, and workspace_id are required", 400);
            }

            const board = await boardService.createBoard({
                name,
                project_id,
                workspace_id,
                user_id,
                background_color,
            });

            sendSuccess(res, board, "Board created successfully", 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Get board by ID
    async getBoardById(req, res) {
        try {
            const { boardId } = req.params;
            const user_id = req.user.id;

            const board = await boardService.getBoardById(boardId, user_id);
            sendSuccess(res, board);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    // Get boards by project
    async getBoardsByProject(req, res) {
        try {
            const { projectId } = req.params;
            const user_id = req.user.id;

            const boards = await boardService.getBoardsByProject(projectId, user_id);
            sendSuccess(res, boards);
        } catch (error) {
            sendError(res, error.message, 400);
        }
    }

    // Update board
    async updateBoard(req, res) {
        try {
            const { boardId } = req.params;
            const user_id = req.user.id;
            const updates = req.body;

            const board = await boardService.updateBoard(boardId, user_id, updates);
            sendSuccess(res, board, "Board updated successfully");
        } catch (error) {
            sendError(res, error.message, 400);
        }
    }

    // Delete board
    async deleteBoard(req, res) {
        try {
            const { boardId } = req.params;
            const user_id = req.user.id;

            const result = await boardService.deleteBoard(boardId, user_id);
            sendSuccess(res, result);
        } catch (error) {
            sendError(res, error.message, 400);
        }
    }

    // Create list
    async createList(req, res) {
        try {
            const { name, board_id } = req.body;
            const user_id = req.user.id;

            if (!name || !board_id) {
                return sendError(res, "Name and board_id are required", 400);
            }

            const list = await listService.createList({ name, board_id, user_id });
            sendSuccess(res, list, "List created successfully", 201);
        } catch (error) {
            sendError(res, error.message, 400);
        }
    }

    // Update list
    async updateList(req, res) {
        try {
            const { listId } = req.params;
            const user_id = req.user.id;
            const updates = req.body;

            const list = await listService.updateList(listId, user_id, updates);
            sendSuccess(res, list, "List updated successfully");
        } catch (error) {
            sendError(res, error.message, 400);
        }
    }

    // Delete list
    async deleteList(req, res) {
        try {
            const { listId } = req.params;
            const user_id = req.user.id;

            const result = await listService.deleteList(listId, user_id);
            sendSuccess(res, result);
        } catch (error) {
            sendError(res, error.message, 400);
        }
    }

    // Reorder lists
    async reorderLists(req, res) {
        try {
            const { board_id, listOrders } = req.body;
            const user_id = req.user.id;

            if (!board_id || !listOrders || !Array.isArray(listOrders)) {
                return sendError(res, "board_id and listOrders array are required", 400);
            }

            const result = await listService.reorderLists(board_id, user_id, listOrders);
            sendSuccess(res, result);
        } catch (error) {
            sendError(res, error.message, 400);
        }
    }

    // Create card
    async createCard(req, res) {
        try {
            const { title, description, list_id, priority, due_date, assigned_to, labels, color } = req.body;
            const user_id = req.user.id;

            if (!title || !list_id) {
                return sendError(res, "Title and list_id are required", 400);
            }

            const card = await cardService.createCard({
                title,
                description,
                list_id,
                priority,
                due_date,
                assigned_to,
                labels,
                color,
                user_id,
            });

            sendSuccess(res, card, "Card created successfully", 201);
        } catch (error) {
            sendError(res, error.message, 400);
        }
    }

    // Get card by ID
    async getCardById(req, res) {
        try {
            const { cardId } = req.params;
            const user_id = req.user.id;

            const card = await cardService.getCardById(cardId, user_id);
            sendSuccess(res, card);
        } catch (error) {
            sendError(res, error.message, 404);
        }
    }

    // Update card
    async updateCard(req, res) {
        try {
            const { cardId } = req.params;
            const user_id = req.user.id;
            const updates = req.body;

            const card = await cardService.updateCard(cardId, user_id, updates);
            sendSuccess(res, card, "Card updated successfully");
        } catch (error) {
            sendError(res, error.message, 400);
        }
    }

    // Move card
    async moveCard(req, res) {
        try {
            const { cardId } = req.params;
            const { new_list_id, new_position } = req.body;
            const user_id = req.user.id;

            if (!new_list_id) {
                return sendError(res, "new_list_id is required", 400);
            }

            const card = await cardService.moveCard(cardId, user_id, new_list_id, new_position);
            sendSuccess(res, card, "Card moved successfully");
        } catch (error) {
            sendError(res, error.message, 400);
        }
    }

    // Delete card
    async deleteCard(req, res) {
        try {
            const { cardId } = req.params;
            const user_id = req.user.id;

            const result = await cardService.deleteCard(cardId, user_id);
            sendSuccess(res, result);
        } catch (error) {
            sendError(res, error.message, 400);
        }
    }

    // Add checklist item
    async addChecklistItem(req, res) {
        try {
            const { cardId } = req.params;
            const { content } = req.body;
            const user_id = req.user.id;

            if (!content) {
                return sendError(res, "Content is required", 400);
            }

            const item = await cardService.addChecklistItem(cardId, user_id, content);
            sendSuccess(res, item, "Checklist item added", 201);
        } catch (error) {
            sendError(res, error.message, 400);
        }
    }

    // Toggle checklist item
    async toggleChecklistItem(req, res) {
        try {
            const { itemId } = req.params;
            const user_id = req.user.id;

            const item = await cardService.toggleChecklistItem(itemId, user_id);
            sendSuccess(res, item, "Checklist item updated");
        } catch (error) {
            sendError(res, error.message, 400);
        }
    }

    // Add comment
    async addComment(req, res) {
        try {
            const { cardId } = req.params;
            const { content } = req.body;
            const user_id = req.user.id;

            if (!content) {
                return sendError(res, "Content is required", 400);
            }

            const comment = await cardService.addComment(cardId, user_id, content);
            sendSuccess(res, comment, "Comment added", 201);
        } catch (error) {
            sendError(res, error.message, 400);
        }
    }

    // Add reaction
    async addReaction(req, res) {
        try {
            const { cardId } = req.params;
            const { emoji } = req.body;
            const user_id = req.user.id;

            if (!emoji) {
                return sendError(res, "Emoji is required", 400);
            }

            const reaction = await cardService.addReaction(cardId, user_id, emoji);
            sendSuccess(res, reaction, "Reaction added", 201);
        } catch (error) {
            sendError(res, error.message, 400);
        }
    }
}

export default new BoardController();