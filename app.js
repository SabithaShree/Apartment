const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const $ = require("jquery")
const model = require(__dirname + "/model.js");
const db = require(__dirname + "/database.js");
const util = require(__dirname + "/util.js");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
util.setSession(app);

const User = model.User();
const Flat = model.Flat();
const Contact = model.Contact();


app.get("/", function(req,res) {
  res.render("index");
});

app.post("/login",  function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  db.findRow(User, {"username" : username}, function(user) {
    if(password === user.password) {
      req.session.user_id = username;
      req.session.save();
      res.redirect("/home");
    }
    else {
      res.redirect("/");
    }
  });
});

app.get("/home", util.redirectLogin, function(req, res) {
  db.findRow(Flat, {"flat_id" : req.session.user_id}, function(flat) {
    res.render("home", flat);
  });
});

app.get("/profile", util.redirectLogin, function(req, res) {
  db.findRow(Flat, {"flat_id" : req.session.user_id}, function(flat) {
    res.render("profile", flat);
  });
});

app.get("/settings", util.redirectLogin,  function(req,res) {
  db.findRow(Flat, {"flat_id" : req.session.user_id}, function(flat) {
    res.render("settings", flat);
  });
});

app.get("/contacts",  util.redirectLogin,  function(req,res) {
  db.findAllRows(Contact, function(contacts) {
    console.log(contacts);
    res.render("contacts", {"contacts": contacts});
  });
});

app.post("/updateProfile", util.redirectLogin, function(req, res) {
  db.updateRow(Flat, {"flat_id": req.session.user_id}, req.body , function(updateResult) {
    res.redirect("/home");
  });
});

app.post("/updatePassword", util.redirectLogin, function(req, res) {
  db.findRow(User, {"username" : req.session.user_id}, function(user) {
    if(req.body.oldPassword === user.password) {
      db.updateRow(User, {"username" : req.session.user_id}, {"password": req.body.password}, function(updatedResult) {
        res.redirect("/home");
      });
    }
    else {

    }
  });
});

app.post("/logout", function(req, res) {
  req.session.destroy( (err) => {
   res.clearCookie("sid");
   res.send("success");
 });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 5000;
}
app.listen(port, function() {
  console.log("Server started on port 5000");
});
