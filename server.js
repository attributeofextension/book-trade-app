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
  imgurl: String,
  userid: String,
  requesterid: String,
  tradeapproved: Boolean
},{collection:'books'});
var Book = mongoose.model("Book",bookSchema);

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

//Configure Request
const request = require('request');
//var googleBooksURL = ""; //AIzaSyBF06H26PGnVzbs589ujAX_FnEL7V4ELbs API KEY
// https://www.googleapis.com/books/v1/volumes?q=search+terms q= <bookname>
function makeRequestURL(title) {
  return "https://www.googleapis.com/books/v1/volumes?q=" + encodeURI(title) + "&key=AIzaSyBF06H26PGnVzbs589ujAX_FnEL7V4ELbs";
}
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
    User.findOne({'email':username},function(err,user) {
      if(err) {
        console.log("Error looking up User: " + err);
        return done(err);
      }
      if(!user) {
        console.log("Email not found!");
        return done(null,false,req.flash("user","Email not found!"));
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
  res.render('home',{front: true,user:req.user});
});
app.get("/signup",function(req,res) {
  res.render('signup',{front:true,user:req.user,usermsg: req.flash("user") });
});
app.post('/signup', passport.authenticate('signup', {
  successRedirect: '/',
  failureRedirect: '/signup',
  failureFlash : true
}));
app.get('/login',function(req,res){
  res.render('login',{front:true,user:req.user,usermsg:req.flash("user"),passmsg:req.flash("password")});
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
    res.render('settings',{front:true,user:req.user});
  } else {
    redirect('/');
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
    res.redirect('/');
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
    res.redirect('/');
  }
});
app.get('/mybooks',function (req,res) {
  if(req.user) {
    Book.find({userid:req.user._id}, function(err,books) {
      if(err) {
          console.log("Error looking up Books: " + err);
          res.redirect('/');
      }     
      Book.find({requesterid:req.user._id}, function(err,myRequests) {
        if(err) {
          console.log("Error looking up Requests: " + err);
          res.redirect('/');
        }
        var yourRequests = [];
        var myAccepted = [];
        var yourAccepted = [];
        for( var j = 0; j < myRequests.length; j++) {
          if(myRequests[j].tradeapproved) {
            console.log(j);
            myAccepted.push(myRequests[j]);
            myRequests.splice(j,1);
            j--;
          }
        }
        for( var i = 0; i < books.length; i++ ) {
          if(books[i].requesterid) {
            if(books[i].tradeapproved) {
              yourAccepted.push(books[i]);
            } else {
              yourRequests.push(books[i]);
            }
          }
        }
        res.render('mybooks', {front:false,user:req.user,books:books,myrequests:myRequests,yourrequests:yourRequests,myaccepted:myAccepted,youraccepted:yourAccepted});
        });
      });
  } else {
    res.redirect('/');
  }
});
app.post('/mybooks', function (req,res) {
  if(req.user) {
    request(makeRequestURL(req.body.book), function (error, response, body) {
      var parsed = JSON.parse(body);
      var newBook = new Book();
      
      newBook.title = parsed.items[0].volumeInfo.title;
      newBook.imgurl = parsed.items[0].volumeInfo.imageLinks.thumbnail;
      newBook.userid = req.user._id;
      newBook.requesterid = null;
      newBook.tradeapproved = false;

      newBook.save( function(err){
        if(err) {
          console.log("Error saving newBook to Database: " + err);
        }
        res.redirect('/mybooks');
      });
    });
  } else {
    res.redirect('/');
  }
});
app.post('/mybooks/remove', function(req,res) {
  if(req.user) {
    Book.remove({_id:req.body.bookid}, function(err){
      if(err) {
        console.log("Error removing book from Database: " + err);
        res.redirect('/mybooks');
      }
      res.redirect('/mybooks');
    });
  } else {
    res.redirect('/');
  }
});
app.get('/allbooks', function(req,res) {
  if(req.user) {
    Book.find({}, function(err,books) {
      if(err) {
        console.log("Error looking up Books: " + err);
        res.redirect('/');
      }
      var myRequests = [];
      var yourRequests = [];
      var myAccepted = [];
      var yourAccepted = [];

      for(var i = 0; i < books.length; i++) {
        if(books[i].requesterid) {
          if(books[i].tradeapproved ) {
            yourAccepted.push(books[i]);
          } else {
            yourRequests.push(books[i]);
          }
          if(books[i].requesterid == req.user._id) {
            if(books[i].tradeapproved) {
              myAccepted.push(books[i]);
            } else {
              myRequests.push(books[i]);
            }
          }    
        }
      }
      res.render('allbooks', {front:false,user:req.user,books:books,myrequests:myRequests,yourrequests:yourRequests,myaccepted:myAccepted,youraccepted:yourAccepted});
    });
  }else {
    res.redirect('/');
  }
});
app.post('/allbooks/request', function(req,res) {
  Book.findOne({_id:req.body.bookid}, function(err, book) {
    if(err) {
      console.log("Error looking up Book: " + err);
      res.redirect("/");
    }
    book.requesterid = req.user._id;
    book.tradeapproved = false;
    book.save( function(err) {
      if(err) {
        console.log("Error saving book request: " + err);
        res.redirect("/");
      }
      res.redirect('/allbooks');
    });
  });
})
app.post("/trade/remove", function (req,res) {
  Book.findOne({_id:req.body.bookid}, function(err, book) {
    if(err) {
      console.log("Error looking up Book: " + err);
      res.redirect('/');
    }
    book.requesterid = null;
    book.tradeapproved = false;

    book.save( function(err){
      if(err) {
        console.log("Error saving Book: " + err);
        res.redirect('/');
      }
      res.redirect('/allbooks');
    });
  }); 
});
app.post('/trade/approve', function(req,res) {
  Book.findOne({_id:req.body.bookid},function(err,book) {
    if(err) {
      console.log("Error looking up Book: " + err);
      res.redirect("/");
    }
    book.tradeapproved = true;
    book.save(function(err){
      if(err) { 
        console.log("Error saving Book: " + err);
        res.redirect('/');
      }
      res.redirect('/allbooks');
    });
  });
});
//PORT========================================================================
var listener = app.listen(process.env.PORT,function() {
    console.log("Your app is listening on port " + listener.address().port);
});