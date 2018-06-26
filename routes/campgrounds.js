var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");



//INDEX - show all campgrounds
router.get("/", function(req, res){
    
    //Get all campground from DB
    Campground.find({}, function(err, allcampgrounds){
        if(err){
            console.log(err);
        }else {
            res.render("campgrounds/index", {campgrounds:allcampgrounds, page: 'campgrounds'});
        }
    });
  
});
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    //get data from form and add to campground array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    
    //Create a new campground  and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            req.flash("error", "Leider ist ein Problem aufgetreten: " + err);
        }else {
            console.log(newlyCreated);
            res.redirect("/campgrounds"); //redirct to campground page - redirect ist immer ein get!!
        }
    });
});
//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

//SHOW - show one campground incl. details
router.get("/:id", function(req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        }else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
     
    
});

// EDIT CAMPGROUD ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
         Campground.findById(req.params.id, function(err, foundCampground){
             res.render("campgrounds/edit", {campground: foundCampground});
         });
});
// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership,function(req, res){
   //find and update the correct campground
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       }else {
           res.redirect("/campgrounds/" + req.params.id);
       }
   });
   //redirect somewhere (showpage)
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership,function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        }else {
            res.redirect("/campgrounds");
        }
    });
});


module.exports = router;