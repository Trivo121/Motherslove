require("dotenv").config();

console.log("KEY:", process.env.RAZORPAY_KEY_ID);

const app = require("./src/App");
const connectDB = require("./src/config/db");

app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

const PORT =
process.env.PORT || 5000;

app.listen(PORT,()=>{

    console.log(
        `Server Running On ${PORT}`
    );

});
