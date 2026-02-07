import verificationService from "../services/verification.service.js";

export const requestVerification = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user.id;
        const verificationData = req.body;

        const workspace = await verificationService.requestOrganizationVerification({
            workspaceId,
            userId,
            verificationData
        });

        res.status(200).json({
            message: "Verification request submitted successfully",
            workspace: {
                id: workspace.id,
                name: workspace.name,
                verification_status: workspace.verification_status,
                verification_notes: workspace.verification_notes
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const updateVerificationStatus = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { status, notes } = req.body;
        const adminId = req.user.id;

        // Note: In a real system, you'd verify that the user is a system admin
        const workspace = await verificationService.updateVerificationStatus({
            workspaceId,
            status,
            notes,
            adminId
        });

        res.status(200).json({
            message: "Verification status updated successfully",
            workspace: {
                id: workspace.id,
                name: workspace.name,
                verification_status: workspace.verification_status,
                verified: workspace.verified,
                verified_at: workspace.verified_at
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getVerificationDetails = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user.id;

        const verificationDetails = await verificationService.getVerificationDetails(workspaceId, userId);

        res.status(200).json({ verification: verificationDetails });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const verifyDomain = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { domain } = req.body;
        const userId = req.user.id;

        const workspace = await verificationService.verifyDomainOwnership({
            workspaceId,
            domain,
            userId
        });

        res.status(200).json({
            message: "Domain verification completed",
            workspace: {
                id: workspace.id,
                org_domain: workspace.org_domain,
                verification_status: workspace.verification_status
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export default {
    requestVerification,
    updateVerificationStatus,
    getVerificationDetails,
    verifyDomain
};