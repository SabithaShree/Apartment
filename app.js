const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fs = require("fs");
const https = require("https");
const $ = require("jquery")
const model = require(__dirname + "/model.js");
const db = require(__dirname + "/database.js");
const util = require(__dirname + "/util.js");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
util.setSession(app);

const collection = util.collection;

app.get("/", function(req,res) {
  res.render("index");
});

app.post("/login",  function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  db.findRow(collection.User, {"username" : username}, function(user) {
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
  db.findRow(collection.Flat, {"flat_id" : req.session.user_id}, function(flat) {
    res.render(util.getTemplate(req),  util.getTemplateObject(req, flat));
  });
});

app.get("/maintanance", util.redirectLogin, function(req, res) {
  res.render(util.getTemplate(req),  util.getTemplateObject(req, {}));
});

app.get("/forums", util.redirectLogin, function(req, res) {
  db.findAllRows(collection.Forum, function(forums) {
    res.render(util.getTemplate(req), util.getTemplateObject(req, {"forums" : forums}));
  });
});

app.get("/forum/compose", util.redirectLogin, function(req, res) {
  res.render(constants.COMPOSE);
});

app.get("/forum/:forum_id", util.redirectLogin, function(req, res) {
  db.findRow(collection.Forum, {"_id": req.params.forum_id}, async function(forum) {
    let forumObj = await util.getForumObject(forum);
    res.render(constants.FORUM , forumObj);
  });
});

app.get("/contacts",  util.redirectLogin,  function(req,res) {
  db.findAllRows(Contact, function(contacts) {
    res.render(util.getTemplate(req) , util.getTemplateObject(req, {"contacts" : contacts}));
  });
});

app.get("/settings", util.redirectLogin,  function(req,res) {
  db.findRow(collection.Flat, {"flat_id" : req.session.user_id}, function(flat) {
    res.render(util.getTemplate(req) ,  util.getTemplateObject(req, flat));
  });
});


app.post("/updateProfile", util.redirectLogin, function(req, res) {
  db.updateRow(collection.Flat, {"flat_id": req.session.user_id}, req.body , function(updateResult) {
    res.redirect("/home");
  });
});

app.post("/updatePassword", util.redirectLogin, function(req, res) {
  db.findRow(collection.User, {"username" : req.session.user_id}, function(user) {
    if(req.body.oldPassword === user.password) {
      db.updateRow(collection.User, {"username" : req.session.user_id}, {"password": req.body.password}, function(updatedResult) {
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

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app)
.listen(port, function () {
  console.log("Server started on port 5000");
})
