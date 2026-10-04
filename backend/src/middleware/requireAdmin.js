const supabase = require("../config/db");

const requireAdmin = async (req, res, next) => {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length)
        : null;

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ message: "Invalid or expired session" });
        }

        if (user.app_metadata?.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        req.user = user;
        return next();
    } catch (error) {
        console.error("Admin authentication failed:", error.message);
        return res.status(401).json({ message: "Unable to verify session" });
    }
};

module.exports = requireAdmin;
