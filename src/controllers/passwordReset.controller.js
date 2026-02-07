import passwordResetService from "../services/passwordReset.service.js";

export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        
        const result = await passwordResetService.requestPasswordReset(email);
        
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        
        const result = await passwordResetService.verifyResetToken(token);
        
        if (result.valid) {
            res.status(200).json({
                message: "Token is valid",
                email: result.email
            });
        } else {
            res.status(400).json({
                error: result.error || "Invalid token"
            });
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        const result = await passwordResetService.resetPassword({
            token,
            newPassword
        });
        
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        
        const result = await passwordResetService.changePassword({
            userId,
            currentPassword,
            newPassword
        });
        
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export default {
    requestPasswordReset,
    verifyResetToken,
    resetPassword,
    changePassword
};