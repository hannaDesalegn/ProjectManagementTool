import workspaceService from "../services/workspace.service.js";

export const createWorkspace = async (req, res) => {
    try {
        const workspace = await workspaceService.createWorkspace({
            ...req.body,
            owner_id: req.user.id
        });
        res.status(201).json({ message: "Workspace created successfully", workspace });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getUserWorkspaces = async (req, res) => {
    try {
        const workspaces = await workspaceService.getUserWorkspaces(req.user.id);
        res.status(200).json({ workspaces });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getWorkspace = async (req, res) => {
    try {
        const workspace = await workspaceService.getWorkspaceById(req.params.id, req.user.id);
        res.status(200).json({ workspace });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const inviteUser = async (req, res) => {
    try {
        const membership = await workspaceService.inviteUserToWorkspace({
            workspaceId: req.params.id,
            ...req.body,
            inviterId: req.user.id
        });
        res.status(201).json({ message: "User invited successfully", membership });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export default {
    createWorkspace,
    getUserWorkspaces,
    getWorkspace,
    inviteUser
};