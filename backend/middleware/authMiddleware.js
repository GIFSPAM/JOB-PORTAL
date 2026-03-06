import jwt from 'jsonwebtoken';

// 1️⃣ VERIFY JWT TOKEN (The Main Gatekeeper)
export const verifyToken = (req, res, next) => {
    // Tokens are typically sent in the header as: "Bearer <token_string>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Decode the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the decoded payload (user_id and role) to the request object
        req.user = decoded; 
        
        next(); // Move to the next function (the controller or role checker)
    } catch (error) {
        return res.status(403).json({ error: "Invalid or expired token." });
    }
};

// 2️⃣ ROLE CHECK: EMPLOYER
export const isEmployer = (req, res, next) => {
    // We check against 'employer' based on your DB schema ENUM
    if (req.user && req.user.role === 'employer') {
        next();
    } else {
        return res.status(403).json({ error: "Access denied. Employers only." });
    }
};

// 3️⃣ ROLE CHECK: JOB SEEKER
export const isSeeker = (req, res, next) => {
    // We check against 'jobseeker' based on your DB schema ENUM
    if (req.user && req.user.role === 'jobseeker') {
        next();
    } else {
        return res.status(403).json({ error: "Access denied. Job seekers only." });
    }
};

// 4️⃣ ROLE CHECK: ADMIN
export const isAdmin = (req, res, next) => {
    // We check against 'admin' based on your DB schema ENUM
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }
};