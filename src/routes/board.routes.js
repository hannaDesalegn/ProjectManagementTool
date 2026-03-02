import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { sanitizeInput } from "../middleware/validation.middleware.js";
import { apiRateLimiter } from "../middleware/rateLimiter.middleware.js";
import boardController from "../controllers/board.controller.js";

const router = express.Router();

// Apply authentication, rate limiting, and sanitization to all routes
router.use(protect);
router.use(apiRateLimiter);
router.use(sanitizeInput);

// Board routes
router.post("/", boardController.createBoard);
router.get("/:boardId", boardController.getBoardById);
router.get("/project/:projectId", boardController.getBoardsByProject);
router.patch("/:boardId", boardController.updateBoard);
router.delete("/:boardId", boardController.deleteBoard);

// List routes
router.post("/lists", boardController.createList);
router.patch("/lists/:listId", boardController.updateList);
router.delete("/lists/:listId", boardController.deleteList);
router.post("/lists/reorder", boardController.reorderLists);

// Card routes
router.post("/cards", boardController.createCard);
router.get("/cards/:cardId", boardController.getCardById);
router.patch("/cards/:cardId", boardController.updateCard);
router.patch("/cards/:cardId/move", boardController.moveCard);
router.delete("/cards/:cardId", boardController.deleteCard);

// Checklist routes
router.post("/cards/:cardId/checklist", boardController.addChecklistItem);
router.patch("/checklist/:itemId/toggle", boardController.toggleChecklistItem);

// Comment routes
router.post("/cards/:cardId/comments", boardController.addComment);

// Reaction routes
router.post("/cards/:cardId/reactions", boardController.addReaction);

export default router;