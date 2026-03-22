module.exports = (req, res, next) => {
    if (req.user.userType !== 'teacher') {
        return res.status(403).json({ error: 'Access denied. Teachers only' });
    }
    next();
};