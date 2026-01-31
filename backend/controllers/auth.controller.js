import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const cookieOptions = {
    httpOnly: true,
    secure: false,       // false because you're using localhost http
    sameSite: "lax",     // strict blocks Postman, lax works everywhere
    path: "/",           // required for reading cookie on all routes
    maxAge: 15 * 24 * 60 * 60 * 1000 // 15 days
};

// SIGNUP
export const signup = async (req, res) => {
    try {
        const { fullName, username, password, confirmPassword, gender } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords don't match" });
        }

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const boyPic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlPic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        const newUser = new User({
            fullName,
            username,
            password: hashedPassword,
            gender,
            profilePic: gender === "male" ? boyPic : girlPic
        });

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "15d" }
        );

        res.cookie("jwt", token, cookieOptions);

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            profilePic: newUser.profilePic
        });

    } catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


// LOGIN
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        const isCorrect = await bcrypt.compare(password, user.password);
        if (!isCorrect) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "15d" }
        );

        res.cookie("jwt", token, cookieOptions);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            profilePic: user.profilePic
        });

    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


// LOGOUT
export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0, httpOnly: true, path: "/" });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
