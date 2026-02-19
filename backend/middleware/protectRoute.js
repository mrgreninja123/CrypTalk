import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
    try {
        let token;

        // 1️⃣ Check Authorization header first
        if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
        ) {
        token = req.headers.authorization.split(" ")[1];
        }
        // 2️⃣ If not in header, check cookie
        else if (req.cookies.jwt) {
        token = req.cookies.jwt;
        }

        if (!token) {
        return res.status(401).json({ error: "Unauthorized - No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
        return res.status(404).json({ error: "User not found" });
        }

        req.user = user;
        next();

    } catch (error) {
        console.log("Error in protectRoute middleware:", error.message);
        res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }
};

export default protectRoute;
