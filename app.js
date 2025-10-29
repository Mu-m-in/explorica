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
const {listingSchema} = require("./schema.js");
// using ejs-mate for layouts
app.engine("ejs",ejsMate);


app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

// setting up ejs
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));




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
app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})

// home route
app.get("/",(req,res)=>{
    res.send("Welcome to Explorica Home Page");
})

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }}

// listings route
app.get("/listings",wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}))
//new route
app.get("/listings/new", (req,res)=>{
    res.render("listings/new.ejs");
})

//show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    const {id} =req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}))
//create route
app.post("/listings",validateListing,wrapAsync( async (req, res , next) => {
    
    const listingData = req.body.listing || {};
    if (typeof listingData.image === "string" && listingData.image.trim()) {
      listingData.image = { filename: "listingimage", url: listingData.image.trim() };
    }
    const newlisting = new Listing(listingData);
    await newlisting.save();
    res.redirect("/listings");
 
}))
 
//edit route
app.get("/listings/edit/:id",wrapAsync(async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}))

//update route
app.put("/listings/:id", validateListing,wrapAsync(async(req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}))

app.delete("/listings/delete/:id", wrapAsync(async(req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}))

app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
})
app.use((err,req,res,next)=>{
    const {statusCode=500 , message="Something went wrong"} = err;
    res.status(statusCode).render("listings/error.ejs",{err});
})

