const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

// using ejs-mate for layouts
app.engine("ejs",ejsMate);


app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));


// setting up ejs
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));


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

// listings route
app.get("/listings",async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
})
//new route
app.get("/listings/new", (req,res)=>{
    res.render("listings/new.ejs");
})

//show route
app.get("/listings/:id",async(req,res)=>{
    const {id} =req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
})
//create route
app.post("/listings", async (req, res) => {
  try {
    const listingData = req.body.listing || {};
    if (typeof listingData.image === "string" && listingData.image.trim()) {
      listingData.image = { filename: "listingimage", url: listingData.image.trim() };
    }
    const newlisting = new Listing(listingData);
    await newlisting.save();
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    res.status(400).send("Error creating listing");
  }
})
 
//edit route
app.get("/listings/edit/:id", async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
})

//update route
app.put("/listings/:id", async(req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
})

app.delete("/listings/delete/:id", async(req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})

// app.get("/listings", async(req,res)=>{
//     let SampleListing = new Listing({
//     title :"Beautiful Beach House",
//     description :"A lovely beach house with stunning ocean views.",
//     price :1250,
//     location :"Malibu, CA",
//     country :"USA"
//     });
//     await SampleListing.save();
//     console.log("Sample listing saved to database");
//     res.send("Sample listing added to the database");
// })