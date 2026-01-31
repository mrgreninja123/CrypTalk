import mongoose from "mongoose";

const connectToMongoDB = async () => {
    const mongoURI = process.env.MONGO_DB_URI;

    if (!mongoURI) {
        throw new Error("MONGO_DB_URI is undefined! Check your .env file and its spelling.");
    }

    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");
        return true;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        throw error;
    }
};

export default connectToMongoDB;
