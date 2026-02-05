import boardService from "../services/board.service.js";

export const createBoard = async (req, res) => {
    try {
        const board = await boardService.createBoard({
            ...req.body,
            user_id: req.user.id
        });
        res.status(201).json({ message: "Board created successfully", board });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getBoard = async (req, res) => {
    try {
        const board = await boardService.getBoardById(req.params.id, req.user.id);
        res.status(200).json({ board });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const createList = async (req, res) => {
    try {
        const list = await boardService.createList({
            ...req.body,
            user_id: req.user.id
        });
        res.status(201).json({ message: "List created successfully", list });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const createCard = async (req, res) => {
    try {
        const card = await boardService.createCard({
            ...req.body,
            user_id: req.user.id
        });
        res.status(201).json({ message: "Card created successfully", card });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const moveCard = async (req, res) => {
    try {
        const card = await boardService.moveCard({
            card_id: req.params.cardId,
            new_list_id: req.body.new_list_id,
            user_id: req.user.id
        });
        res.status(200).json({ message: "Card moved successfully", card });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export default {
    createBoard,
    getBoard,
    createList,
    createCard,
    moveCard
};