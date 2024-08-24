const validateSignup = (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({
            error: "Username, email, and password are required"
        });
    }
    next(); 
};

module.exports = validateSignup;