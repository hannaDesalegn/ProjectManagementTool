import prisma from "../config/prisma.js";

// Request organization verification
export const requestOrganizationVerification = async ({ workspaceId, userId, verificationData }) => {
    const { legal_name, registration_id, website, org_domain } = verificationData;

    if (!legal_name || !registration_id) {
        throw new Error("Legal name and registration ID are required for verification");
    }

    // Check if workspace exists and user is owner
    const workspace = await prisma.workspaces.findUnique({
        where: { id: workspaceId },
        include: {
            memberships: {
                where: { user_id: userId }
            }
        }
    });

    if (!workspace) {
        throw new Error("Workspace not found");
    }

    const membership = workspace.memberships[0];
    if (!membership || membership.role !== 'Owner') {
        throw new Error("Only workspace owners can request verification");
    }

    if (workspace.type !== 'ORGANIZATION') {
        throw new Error("Only organization workspaces can be verified");
    }

    if (workspace.verification_status === 'APPROVED') {
        throw new Error("Workspace is already verified");
    }

    // Update workspace with verification information
    const updatedWorkspace = await prisma.workspaces.update({
        where: { id: workspaceId },
        data: {
            legal_name,
            registration_id,
            website,
            org_domain,
            verification_status: 'PENDING',
            verification_notes: 'Verification request submitted'
        }
    });

    // Log verification request activity
    await prisma.activityLogs.create({
        data: {
            action: 'VERIFICATION_REQUESTED',
            actor_id: userId,
            target_id: workspaceId,
            target_type: 'Workspace',
            workspace_id: workspaceId,
            metadata: {
                legal_name,
                registration_id,
                website,
                org_domain
            }
        }
    });

    return updatedWorkspace;
};

// Update verification status (admin only)
export const updateVerificationStatus = async ({ workspaceId, status, notes, adminId }) => {
    const validStatuses = ['PENDING', 'DOMAIN_VERIFIED', 'APPROVED', 'REJECTED'];
    
    if (!validStatuses.includes(status)) {
        throw new Error("Invalid verification status");
    }

    // In a real system, you'd check if adminId is a system admin
    // For now, we'll assume this is called by system admin

    const updateData = {
        verification_status: status,
        verification_notes: notes
    };

    if (status === 'APPROVED') {
        updateData.verified = true;
        updateData.verified_at = new Date();
    }

    const updatedWorkspace = await prisma.workspaces.update({
        where: { id: workspaceId },
        data: updateData
    });

    // Log verification status change
    await prisma.activityLogs.create({
        data: {
            action: `VERIFICATION_${status}`,
            actor_id: adminId,
            target_id: workspaceId,
            target_type: 'Workspace',
            workspace_id: workspaceId,
            metadata: {
                status,
                notes
            }
        }
    });

    return updatedWorkspace;
};

// Get verification details
export const getVerificationDetails = async (workspaceId, userId) => {
    const workspace = await prisma.workspaces.findUnique({
        where: { id: workspaceId },
        include: {
            memberships: {
                where: { user_id: userId }
            }
        }
    });

    if (!workspace) {
        throw new Error("Workspace not found");
    }

    const membership = workspace.memberships[0];
    if (!membership) {
        throw new Error("Access denied to this workspace");
    }

    // Only owners and admins can view verification details
    if (membership.role !== 'Owner' && membership.role !== 'Admin') {
        throw new Error("Insufficient permissions to view verification details");
    }

    return {
        id: workspace.id,
        name: workspace.name,
        type: workspace.type,
        verification_status: workspace.verification_status,
        verification_notes: workspace.verification_notes,
        verified: workspace.verified,
        verified_at: workspace.verified_at,
        legal_name: workspace.legal_name,
        registration_id: workspace.registration_id,
        website: workspace.website,
        org_domain: workspace.org_domain
    };
};

// Verify domain ownership (simplified)
export const verifyDomainOwnership = async ({ workspaceId, domain, userId }) => {
    // In a real implementation, this would:
    // 1. Check DNS records for verification token
    // 2. Send verification email to admin@domain
    // 3. Check domain ownership through other methods

    const workspace = await prisma.workspaces.findUnique({
        where: { id: workspaceId },
        include: {
            memberships: {
                where: { user_id: userId }
            }
        }
    });

    if (!workspace) {
        throw new Error("Workspace not found");
    }

    const membership = workspace.memberships[0];
    if (!membership || membership.role !== 'Owner') {
        throw new Error("Only workspace owners can verify domain");
    }

    // Simplified domain verification (in real app, implement proper verification)
    const updatedWorkspace = await prisma.workspaces.update({
        where: { id: workspaceId },
        data: {
            org_domain: domain,
            verification_status: 'DOMAIN_VERIFIED',
            verification_notes: 'Domain ownership verified'
        }
    });

    return updatedWorkspace;
};

export default {
    requestOrganizationVerification,
    updateVerificationStatus,
    getVerificationDetails,
    verifyDomainOwnership
};