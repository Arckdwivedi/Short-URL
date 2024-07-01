const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const {connectMongoDB} = require("./connect");
const URL = require("./models/url");
const {restrictToLoggedInUserOnly, checkAuth} = require("./middlewares/auth")

const staticRoute = require("./routes/staticRouter");
const urlRoute = require("./routes/url");
const userRoute = require("./routes/user");

const app = express();
const PORT = 8002;

mongoose.connect('mongodb://localhost:27017/short-url').then(() => {
    console.log("MongoDB connected");
})
/*connectMongoDB("mongodb://localhost:27017/short-url").then(() => {
    console.log("MongoDB connected");
}).catch((err) => console.log(err));
*/

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());


app.use("/url", restrictToLoggedInUserOnly, urlRoute);
app.use('/user', checkAuth, userRoute);
app.use("/", staticRoute);

app.get("/url/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId
    }, {
        $push: {
            visitHistory: {
                timestamp: Date.now(),
            },
        }
    })
    res.redirect(entry.redirectURL);
})
app.listen(PORT, () => console.log(`Server started at PORT ${PORT}`));