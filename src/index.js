import dotenv from "dotenv";
import connectToDatabase from "./config/database.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

const startServer = async () => {
  try {
    await connectToDatabase();
    app.on("error", (error) => {
      console.log("error", error);
      throw error;
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log("server is running on port", process.env.PORT);
    });
  } catch (error) {
    console.log("monogoDB connection  failed", error);
  }
};

startServer();
