const betterAuth = require('better-auth');

async function betterAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const user = await betterAuth.verifyToken(token);
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = betterAuthMiddleware;