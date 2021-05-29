//jshint esversion:6

//These are all the downloaded packages
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

//this is to connect to the needed database. In this case, we are connecting to userDB.
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});

//create user database and what the schema will consist of
//adding new mongoose schema allows you to create a userSchema with the mongoose schema class
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});



//this is to add encrypt package as our plugin. encryptedFields will encrypt the password field.
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

//set up a new user model based on the schema.
const User = new mongoose.model("User", userSchema);

//Here you render the home page
app.get("/", function(req, res){
  res.render("home");
});

//Here you render the login page
app.get("/login", function(req, res){
  res.render("login");
});

//Here you render the register page
app.get("/register", function(req, res){
  res.render("register");
});

//create your register route. This allows the user to register but not login.
app.post("/register", function(req, res){
  //create a new user based on the declared schema
  const newUser = new User({
    //you get username because in the form for the inut tag, the name is username
    email:req.body.username,
    password: req.body.password
  });
  newUser.save(function(err){
    if(err){
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

//we are validating that we have a user with the credentials put in
app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

//the username field comes from the user trying to login and the email field is in our database
  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        //if the found user password is equal to the password created
        if (foundUser.password === password) {
          res.render("secrets");
        }
      }
    }
  });
});

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
