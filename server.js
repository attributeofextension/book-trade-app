//Book Trading App - https://www.freecodecamp.org/challenges/manage-a-book-trading-club
//Configure Express
const express = require("express");
const app = express();

app.use(express.static('public'));

//Configure MongoDB and Mongoose
const mongo = require("mongodb").MongoClient;
const mongoose = require("mongoose");
var dbURL = "mongodb://book-trader-app:c4rr07qu33n@ds141657.mlab.com:41657/book-trader"

mongoose.connect(dbURL,{ useMongoClient: true });
mongoose.Promise = global.Promise;
//Mongoose schema
//Users
var userSchema = new mongoose.Schema({
	name:String,
	email:String,
	password: String,
  city: String,
  state: String
},{collection:'users'});
var User = mongoose.model("User",userSchema);

var bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  imgurl: String,
  userid: String
},{collection:'books'});
var Books = mongoose.model("Books",bookSchema);

//Configure Handlebars
const exphbs = require("express-handlebars")
app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');

//Configure Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Configure Cookie Parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//Configure Flash
const flash = require("connect-flash");
app.use(flash());

//Configure BCrypt
const bcrypt = require("bcrypt");
const saltRounds = 10;

//Configure Express Session
const expressSession = require('express-session');
app.use(expressSession({secret:'carrot'}));

//Passport Configuration
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id,done) {
  User.findById(id, function(err,user) {
    done(err,user);
  });
});

//PASSPORT STRATEGIES=========================================================
passport.use('signup', new LocalStrategy({
    passReqToCallback : true,
    usernameField: "email",
    passwordField: "password1"
  },
  function(req,username,password,done) {
    console.log("this far");
    User.findOne({"email":username},function(err, user) {
      if(err) { 
        console.log("Error in SignUp: " + err);
        return done(err);
      }
      // already exists
      if(user) {
        console.log('User already exists');
        
        return done(null, false,req.flash('user','User Already Exists'));
      } else {
       
        bcrypt.hash(password, 10, function(err, hash) {
          // Store hash in database

          //if there is no user with that email            
          //create user
          var newUser = new User();
          //set the user's local credentials
          newUser.name = req.param("name");
          newUser.email = username;
          newUser.password = hash;
          
          newUser.save( function(err) {
            if(err) {
              console.log('Error in Saving user: ' + err);
              throw err;
            }
            console.log('User Registration successful');
            return done(null, newUser);
           
          });
        });
      }
    });  
}));
passport.use('login', new LocalStrategy(
  {passReqToCallback:true,
   usernameField:"email",
   passwordField:"password"},
   function(req,username,password,done) {
    console.log("here");
    User.findOne({'email':username},function(err,user) {
      if(err) {
        console.log("Error looking up User: " + err);
        return done(err);
      }
      if(!user) {
        console.log("Email not found!");
        done(null,false,req.flash("user","Email not found!"));
      }
     bcrypt.compare(password,user.password,function(err, res){
        if(!res) {
          console.log("Password does not match database");
          return done(null,false,req.flash("password","Incorrect password!"));
        } else {
          console.log("User login successful");
          return done(null,user);
        }
      });
    }); 
   }));

//ROUTES======================================================================
app.get("/", function(req,res) {
  res.render('home',{user:req.user});
});
app.get("/signup",function(req,res) {
  res.render('signup',{user:req.user,usermsg: req.flash("user") });
});
app.post('/signup', passport.authenticate('signup', {
  successRedirect: '/',
  failureRedirect: '/signup',
  failureFlash : true
}));
app.get('/login',function(req,res){
  res.render('login',{user:req.user,usermsg:req.flash("user"),passmsg:req.flash("password")});
});
app.post("/login",passport.authenticate('login', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash : true
}));
app.get('/logout', function(req,res) {
  if(req.user) {
    req.logout();
    res.redirect('/');
  }
});
app.get('/settings', function(req,res) {
  if(req.user) {
    res.render('settings',{user:req.user});
  } else {
    redirect('/logout');
  }
});
app.post('/updateprofile' ,function(req,res) {
  if(req.user) {
    req.user.city = req.body.city;
    req.user.state = req.body.state;

    req.user.save(function (err) {
      if(err) {
        console.log("Error saving new profile to User: " + err);
        req.flash("homealert","Error saving new profile info!");
        res.redirect('/');
      }
      req.flash("homemessage","Your profile has been updated");
      res.redirect('/');
    });
  } else {
    res.redirect('/logout');
  }
});
app.post('/changepassword', function(req,res) {
  if(req.user) {
    bcrypt.compare(req.body.oldpassword,req.user.password,function(err, check) {
      if(!check) {
        console.log("Old password does not match database");
        req.flash("oldpass","Incorrect password!");
        res.redirect('/settings');
      } else {
        bcrypt.hash(req.body.password1, 10, function(err, hash) {          
          req.user.password = hash;
          req.user.save(function(err) {
            if(err) {
              console.log("Error updating new password: " + err);
              req.flash("homealert","Error updating new password! Your password has not been changed.");
              res.redirect('/');
            }
            console.log("Password change successful!");
            req.flash("homemessage","Your password has been changed");
            res.redirect('/');
          });       
        });
      }
    });
  } else {
    res.redirect('/logout');
  }
});
app.get('/mybooks',function (req,res) {
  if(req.user) {
    res.render('mybooks', {user:req.user});
  } else {
    res.redirect('/logout');
  }
});
app.post('/mybooks', function (req,res) {
  if(req.user) {
    
    res.redirect('/mybooks');
  } else {
    res.redirect('/logout');
  }
});
//PORT========================================================================
var listener = app.listen(8080,function() {
    console.log("Your app is listening on port " + listener.address().port);
});