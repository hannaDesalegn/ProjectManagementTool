// Standardized API response utilities
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

export const errorResponse = (res, message = 'Error', statusCode = 400, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString()
    });
};

export const validationErrorResponse = (res, errors) => {
    return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
        timestamp: new Date().toISOString()
    });
};

export const unauthorizedResponse = (res, message = 'Unauthorized') => {
    return res.status(401).json({
        success: false,
        message,
        timestamp: new Date().toISOString()
    });
};

export const forbiddenResponse = (res, message = 'Forbidden') => {
    return res.status(403).json({
        success: false,
        message,
        timestamp: new Date().toISOString()
    });
};

export const notFoundResponse = (res, message = 'Resource not found') => {
    return res.status(404).json({
        success: false,
        message,
        timestamp: new Date().toISOString()
    });
};

export const serverErrorResponse = (res, message = 'Internal server error') => {
    return res.status(500).json({
        success: false,
        message,
        timestamp: new Date().toISOString()
    });
};

export const paginatedResponse = (res, data, pagination, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: Math.ceil(pagination.total / pagination.limit)
        },
        timestamp: new Date().toISOString()
    });
};

export default {
    successResponse,
    errorResponse,
    validationErrorResponse,
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    serverErrorResponse,
    paginatedResponse
};