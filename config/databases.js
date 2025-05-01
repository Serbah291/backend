const mongoose = require("mongoose");

const connectDB = () => {
  mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    console.log(`✅ Database connected successfully: ${conn.connection.host}`);
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  });
};

module.exports = connectDB;
