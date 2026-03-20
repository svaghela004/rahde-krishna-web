const mongoose = require("mongoose");

const connect = async () => {
  try {
    await mongoose.connect("mongodb+srv://shivamvaghela2007_db_user:rxAaX0lIRd4ICQ7m@cluster0.sroemva.mongodb.net/?appName=Cluster0");
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log("❌ MongoDB Error:", error);
  }
};

module.exports = {connect};
