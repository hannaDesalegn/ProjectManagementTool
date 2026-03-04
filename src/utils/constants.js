// Application constants
export const USER_ROLES = {
    OWNER: 'Owner',
    ADMIN: 'Admin',
    MEMBER: 'Member',
    VIEWER: 'Viewer'
};

export const WORKSPACE_TYPES = {
    PERSONAL: 'PERSONAL',
    TEAM: 'TEAM',
    ORGANIZATION: 'ORGANIZATION'
};

export const PROJECT_ROLES = {
    PROJECT_ADMIN: 'ProjectAdmin',
    CONTRIBUTOR: 'Contributor',
    VIEWER: 'Viewer'
};

export const CARD_STATUS = {
    TODO: 'ToDo',
    IN_PROGRESS: 'InProgress',
    DONE: 'Done'
};

export const PROJECT_STATUS = {
    ACTIVE: 'Active',
    ARCHIVED: 'Archived',
    COMPLETED: 'Completed'
};

export const VERIFICATION_STATUS = {
    PENDING: 'PENDING',
    DOMAIN_VERIFIED: 'DOMAIN_VERIFIED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
};

export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Insufficient permissions',
    NOT_FOUND: 'Resource not found',
    VALIDATION_FAILED: 'Validation failed',
    TOKEN_EXPIRED: 'Token has expired',
    INVALID_CREDENTIALS: 'Invalid credentials'
};

export default {
    USER_ROLES,
    WORKSPACE_TYPES,
    PROJECT_ROLES,
    CARD_STATUS,
    PROJECT_STATUS,
    VERIFICATION_STATUS,
    HTTP_STATUS,
    ERROR_MESSAGES
};