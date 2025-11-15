if (process.env.NODE_ENV !="production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing.js"); 
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/WrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const {isLoggedIn} = require("./middleware.js");

// using ejs-mate for layouts
app.engine("ejs",ejsMate);

const listingsRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

// setting up ejs
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

// const mongoUrl = "mongodb://127.0.0.1:27017/explorica"
const dbUrl = process.env.ATLASDB_URL;

// mongoose connection
main()
.then(()=>{
    console.log("Database connected");
}).catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/explorica")
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 3600*24,
});

const sessionOptions = {
    store: store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 1000 * 60 *60 *24,
        maxAge : 1000 * 60 *60 *24,
        httpOnly : true
    }
}


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());   


// home route
// app.get("/",(req,res)=>{
//     res.send("Welcome to Explorica Home Page");
// })

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewRouter );
app.use("/", userRouter );

app.all(/.*/,(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
})
app.use((err,req,res,next)=>{
    const {statusCode=500 , message="Something went wrong"} = err;
    res.status(statusCode).render("listings/error.ejs",{err});
})


app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})
