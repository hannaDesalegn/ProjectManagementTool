import express from "express";
import boardController from "../controllers/board.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All board routes require authentication
router.use(protect);

router.post("/", boardController.createBoard);
router.get("/:id", boardController.getBoard);
router.post("/lists", boardController.createList);
router.post("/cards", boardController.createCard);
router.patch("/cards/:cardId/move", boardController.moveCard);

export default router;