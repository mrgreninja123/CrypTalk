import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
    try {
        let token;

        // ✅ 1. Check Authorization header first (Postman / Frontend)
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        // ✅ 2. If no header token, check cookie (browser)
        else if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        // ❌ No token found
        if (!token) {
            return res.status(401).json({
                error: "Unauthorized - No Token Provided"
            });
        }

        // ✅ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                error: "Unauthorized - Invalid Token"
            });
        }

        // ✅ Find user
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        // ✅ Attach user to request
        req.user = user;

        next();

    } catch (error) {
        console.log("Error in protectRoute middleware:", error.message);

        return res.status(401).json({
            error: "Unauthorized - Invalid or Expired Token"
        });
    }
};

export default protectRoute;
