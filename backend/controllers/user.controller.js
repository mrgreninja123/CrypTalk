import User from "../models/user.model.js";

// ============================
// Get users for sidebar
// ============================
export const getUserForSidebar = async (req, res) => {
try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
    _id: { $ne: loggedInUserId }
    }).select("-password");

    res.status(200).json(filteredUsers);

} catch (error) {
    console.error("Error in getUserForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
}
};

// ============================
// Search Users
// ============================
export const searchUsers = async (req, res) => {
try {
    const query = req.query.query;

    if (!query) {
    return res.status(400).json({ error: "Search query required" });
    }

    const users = await User.find({
    username: { $regex: query, $options: "i" }
    }).select("-password");

    res.status(200).json(users);

} catch (error) {
    console.error("Error in searchUsers:", error.message);
    res.status(500).json({ error: "Internal server error" });
}
};

// ============================
// Get Current Logged-in User
// ============================
export const getCurrentUser = async (req, res) => {
try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
    return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);

} catch (error) {
    console.error("Error in getCurrentUser:", error.message);
    res.status(500).json({ error: "Internal server error" });
}
};
