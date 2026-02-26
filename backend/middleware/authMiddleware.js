import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // 1. Grab the Header
    const authHeader = req.headers['authorization'];

    // 2. Extract the Token
    const token = authHeader && authHeader.split(' ')[1];

    // 3. Early Exit check
    if (!token) {
        return res.status(401).json({ message: "No token provided, access denied." });
    }

    try {
        // 4. Verify the Seal
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Attach user info to the request
        req.user = decoded;

        // 6. Let them through the gate
        next();
    } catch (err) {
        // 7. Handle tampered or expired tokens
        res.status(403).json({ message: "Invalid or expired token." });
    }
};