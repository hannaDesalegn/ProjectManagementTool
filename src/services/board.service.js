import prisma from "../config/prisma.js";

export const createBoard = async ({ name, project_id, workspace_id, user_id }) => {
    if (!name || !project_id || !workspace_id) {
        throw new Error("Name, project_id, and workspace_id are required");
    }

    // Check project access
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

    const board = await prisma.boards.create({
        data: {
            name,
            project_id,
            workspace_id
        },
        include: {
            project: {
                select: { id: true, name: true }
            }
        }
    });

    // Create default lists
    const defaultLists = [
        { name: "To Do", position: 1 },
        { name: "In Progress", position: 2 },
        { name: "Done", position: 3 }
    ];

    for (const list of defaultLists) {
        await prisma.lists.create({
            data: {
                name: list.name,
                position: list.position,
                board_id: board.id
            }
        });
    }

    return board;
};

export const getBoardById = async (board_id, user_id) => {
    const board = await prisma.boards.findUnique({
        where: { id: board_id },
        include: {
            project: true,
            lists: {
                orderBy: { position: 'asc' },
                include: {
                    cards: {
                        orderBy: { created_at: 'asc' },
                        include: {
                            assignee: {
                                select: { id: true, name: true, email: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!board) {
        throw new Error("Board not found");
    }

    // Check project access
    const projectMembership = await prisma.projectMemberships.findUnique({
        where: {
            project_id_user_id: {
                project_id: board.project_id,
                user_id: user_id
            }
        }
    });

    if (!projectMembership) {
        throw new Error("Access denied to this board");
    }

    return board;
};

export const createList = async ({ name, board_id, user_id }) => {
    if (!name || !board_id) {
        throw new Error("Name and board_id are required");
    }

    // Get board and check access
    const board = await prisma.boards.findUnique({
        where: { id: board_id },
        include: { project: true }
    });

    if (!board) {
        throw new Error("Board not found");
    }

    // Check project access
    const projectMembership = await prisma.projectMemberships.findUnique({
        where: {
            project_id_user_id: {
                project_id: board.project_id,
                user_id: user_id
            }
        }
    });

    if (!projectMembership) {
        throw new Error("Access denied");
    }

    // Get next position
    const lastList = await prisma.lists.findFirst({
        where: { board_id },
        orderBy: { position: 'desc' }
    });

    const position = lastList ? lastList.position + 1 : 1;

    const list = await prisma.lists.create({
        data: {
            name,
            board_id,
            position
        }
    });

    return list;
};

export const createCard = async ({ title, description, list_id, assigned_to, user_id }) => {
    if (!title || !list_id) {
        throw new Error("Title and list_id are required");
    }

    // Get list and board info
    const list = await prisma.lists.findUnique({
        where: { id: list_id },
        include: {
            board: {
                include: { project: true }
            }
        }
    });

    if (!list) {
        throw new Error("List not found");
    }

    // Check project access
    const projectMembership = await prisma.projectMemberships.findUnique({
        where: {
            project_id_user_id: {
                project_id: list.board.project_id,
                user_id: user_id
            }
        }
    });

    if (!projectMembership) {
        throw new Error("Access denied");
    }

    const card = await prisma.cards.create({
        data: {
            title,
            description: description || "",
            list_id,
            board_id: list.board_id,
            workspace_id: list.board.workspace_id,
            assigned_to,
            status: 'ToDo'
        },
        include: {
            assignee: {
                select: { id: true, name: true, email: true }
            },
            list: {
                select: { id: true, name: true }
            }
        }
    });

    return card;
};

export const moveCard = async ({ card_id, new_list_id, user_id }) => {
    // Get card info
    const card = await prisma.cards.findUnique({
        where: { id: card_id },
        include: {
            board: {
                include: { project: true }
            }
        }
    });

    if (!card) {
        throw new Error("Card not found");
    }

    // Check project access
    const projectMembership = await prisma.projectMemberships.findUnique({
        where: {
            project_id_user_id: {
                project_id: card.board.project_id,
                user_id: user_id
            }
        }
    });

    if (!projectMembership) {
        throw new Error("Access denied");
    }

    // Update card status based on list
    const newList = await prisma.lists.findUnique({
        where: { id: new_list_id }
    });

    let status = 'ToDo';
    if (newList.name.toLowerCase().includes('progress')) {
        status = 'InProgress';
    } else if (newList.name.toLowerCase().includes('done')) {
        status = 'Done';
    }

    const updatedCard = await prisma.cards.update({
        where: { id: card_id },
        data: {
            list_id: new_list_id,
            status
        },
        include: {
            assignee: {
                select: { id: true, name: true, email: true }
            },
            list: {
                select: { id: true, name: true }
            }
        }
    });

    return updatedCard;
};

export default {
    createBoard,
    getBoardById,
    createList,
    createCard,
    moveCard
};