// Input validation middleware
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    // At least 6 characters
    return password && password.length >= 6;
};

export const validateName = (name) => {
    // At least 2 characters, only letters and spaces
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name);
};

export const validateRegistration = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = [];

    if (!name) {
        errors.push('Name is required');
    } else if (!validateName(name)) {
        errors.push('Name must be 2-50 characters and contain only letters and spaces');
    }

    if (!email) {
        errors.push('Email is required');
    } else if (!validateEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    if (!password) {
        errors.push('Password is required');
    } else if (!validatePassword(password)) {
        errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors 
        });
    }

    next();
};

export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email) {
        errors.push('Email is required');
    } else if (!validateEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    if (!password) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors 
        });
    }

    next();
};

export const validateWorkspace = (req, res, next) => {
    const { name, type } = req.body;
    const errors = [];
    const validTypes = ['PERSONAL', 'TEAM', 'ORGANIZATION'];

    if (!name) {
        errors.push('Workspace name is required');
    } else if (name.length < 2 || name.length > 100) {
        errors.push('Workspace name must be 2-100 characters long');
    }

    if (!type) {
        errors.push('Workspace type is required');
    } else if (!validTypes.includes(type)) {
        errors.push('Workspace type must be PERSONAL, TEAM, or ORGANIZATION');
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors 
        });
    }

    next();
};

export const validateProject = (req, res, next) => {
    const { name, workspace_id, start_date, end_date } = req.body;
    const errors = [];

    if (!name) {
        errors.push('Project name is required');
    } else if (name.length < 2 || name.length > 100) {
        errors.push('Project name must be 2-100 characters long');
    }

    if (!workspace_id) {
        errors.push('Workspace ID is required');
    }

    if (!start_date) {
        errors.push('Start date is required');
    } else if (isNaN(Date.parse(start_date))) {
        errors.push('Start date must be a valid date');
    }

    if (!end_date) {
        errors.push('End date is required');
    } else if (isNaN(Date.parse(end_date))) {
        errors.push('End date must be a valid date');
    }

    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
        errors.push('End date must be after start date');
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors 
        });
    }

    next();
};

export const sanitizeInput = (req, res, next) => {
    // Remove potential XSS characters
    const sanitize = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<[^>]*>/g, '')
                    .trim();
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };

    if (req.body) {
        sanitize(req.body);
    }
    if (req.query) {
        sanitize(req.query);
    }
    if (req.params) {
        sanitize(req.params);
    }

    next();
};

export default {
    validateEmail,
    validatePassword,
    validateName,
    validateRegistration,
    validateLogin,
    validateWorkspace,
    validateProject,
    sanitizeInput
};