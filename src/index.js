import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/dbconfig.js";
dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(8000 || 8000, () => {
      console.log(`⚙️ Server is running at port : https ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
