import invitationService from "../services/invitation.service.js";

export const inviteToWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { email, role } = req.body;
        const inviterId = req.user.id;

        const result = await invitationService.createWorkspaceInvitation({
            workspaceId,
            email,
            role,
            inviterId
        });

        res.status(201).json({
            message: result.message,
            type: result.type,
            data: result.membership || {
                invitationToken: result.invitationToken,
                email: result.email,
                role: result.role
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const acceptInvitation = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user.id;

        const membership = await invitationService.acceptWorkspaceInvitation({
            token,
            userId
        });

        res.status(200).json({
            message: "Invitation accepted successfully",
            membership
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getInvitations = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user.id;

        const invitations = await invitationService.getWorkspaceInvitations(workspaceId, userId);

        res.status(200).json({ invitations });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export default {
    inviteToWorkspace,
    acceptInvitation,
    getInvitations
};