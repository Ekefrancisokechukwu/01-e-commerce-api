import mongoose from "mongoose";
import app from "./app";

const port = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
