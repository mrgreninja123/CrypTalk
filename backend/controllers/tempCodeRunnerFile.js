import User from "../models/user.model.js";

// Get all users except logged in user
export const getUserForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUserForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Search users by username (Instagram-style)
export const searchUsers = async (req, res) => {
    try {
        const { username } = req.query;
        const loggedInUserId = req.user._id;

        if (!username || username.trim() === "") {
            return res.status(200).json([]);
        }

        // Search for users with matching username (case-insensitive)
        const searchResults = await User.find({
            _id: { $ne: loggedInUserId },
            username: { $regex: username, $options: "i" }
        }).select("-password").limit(10);

        res.status(200).json(searchResults);
    } catch (error) {
        console.error("Error in searchUsers: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get current user info
export const getCurrentUser = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json(user);
    } catch (error) {
        console.error("Error in getCurrentUser: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};