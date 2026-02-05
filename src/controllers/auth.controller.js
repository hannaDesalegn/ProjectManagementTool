const authService = require("../services/auth.service");

exports.register = async(req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ message: "User registered successfully", user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.login = async(req, res) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};