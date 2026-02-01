import mongoose from "mongoose";

const connectToMongoDB = async () => {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
        throw new Error("MONGO_URI is undefined! Check your .env file.");
    }

    try {
        // ✅ Removed deprecated options (useNewUrlParser, useUnifiedTopology)
        // Modern Mongoose (v6+) handles these automatically
        await mongoose.connect(mongoURI);
        console.log("✅ Connected to MongoDB");
        return true;
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        throw error;
    }
};

export default connectToMongoDB;
