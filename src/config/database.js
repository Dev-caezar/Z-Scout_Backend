import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`,
    );
    console.log(`mongoDB connected ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("database connection failed", error);
    process.exit(1);
  }
};

export default connectToDatabase;
