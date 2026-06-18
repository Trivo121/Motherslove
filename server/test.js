const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://M4:Panda2526@cluster0.w6sszt1.mongodb.net/clothing?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected Successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection Error:");
    console.error(err);
    process.exit(1);
  });