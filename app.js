const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fs = require("fs");
const multer  = require("multer");
const mime = require("mime");
const https = require("https");
const $ = require("jquery")
const model = require(__dirname + "/model.js");
const db = require(__dirname + "/database.js");
const util = require(__dirname + "/util.js");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use("/jquery-autogrow-textarea",express.static(__dirname + "/node_modules/jquery-autogrow-textarea"));
app.use("/froala-editor", express.static(__dirname + "/node_modules/froala-editor"));
let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null,  __dirname + "/public/uploads/");
  },
  filename: function (req, file, cb) {
     const photoName = "profile-" + req.session.user_id;
     cb(null, photoName + ".jpg");
   }
 });
 let upload = multer({ storage: storage });

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
  db.findRow(collection.Flat, {"flat_id" : req.session.user_id}, async function(flat) {
    req.session.user_name = flat.name;
    req.session.user_photo = flat.photo;
    res.render(await util.getTemplate(req),  await util.getTemplateObject(req, flat));
  });
});

app.get("/maintanance", util.redirectLogin, async function(req, res) {
  res.render(await util.getTemplate(req),  await util.getTemplateObject(req, {}));
});

app.get("/forums", util.redirectLogin, function(req, res) {
  db.findAndSortRows(collection.Forum, {"date": -1}, async function(forums) {
    let forumsObj = await util.getForumsObject(forums);
    res.render(await util.getTemplate(req), await util.getTemplateObject(req, {"forums" : forumsObj}));
  });
});

app.get("/forum/compose", util.redirectLogin, function(req, res) {
  res.render(constants.COMPOSE);
});

app.post("/forums/delete", util.redirectLogin, function(req, res) {
  db.deleteRow(collection.Forum, req.body, function(resp) {
    db.findAndSortRows(collection.Forum, {"date": -1}, async function(forums) {
      res.render(constants.FORUMS, await util.getTemplateObject(req, {"forums" : forums}));
    });
  });
});

app.get("/forum/:forum_id", util.redirectLogin, function(req, res) {
  db.findRow(collection.Forum, {"_id": req.params.forum_id}, async function(forum) {
    let forumObj = await util.getForumObject(forum);
    res.render(await util.getTemplate(req) , await util.getTemplateObject(req, forumObj));
  });
});

app.post("/newforum", util.redirectLogin, function(req, res) {
  let forumObj = req.body;
  Object.assign(forumObj,
    {"author" : req.session.user_id,
     "comments" : [],
     "likes" : [],
     "date" : new Date()
   });
  db.insertRow(collection.Forum, forumObj, function(response) {
    db.findAndSortRows(collection.Forum, {"date": -1}, async function(forums) {
      res.render(constants.FORUMS, await util.getTemplateObject(req, {"forums" : forums}));
    });
  });
});

app.post("/updateforum", util.redirectLogin, function(req, res) {
  let newData = {
    "title" : req.body.title,
    "content" : req.body.content
  };
  db.findAndUpdateRow(collection.Forum, {"_id": req.body.forum_id}, newData, function(forum) {
    db.findAndSortRows(collection.Forum, {"date": -1}, async function(forums) {
      res.render(constants.FORUMS, await util.getTemplateObject(req, {"forums" : forums}));
    });
  });
});

app.post("/comment", util.redirectLogin, function(req, res) {
  db.findRow(collection.Forum, {"_id": req.body.forum_id}, function(forum) {
    forum.comments.push({
      "author": req.session.user_id,
      "content": req.body.content,
      "date": new Date()
    });
    db.updateRow(collection.Forum, {"_id": req.body.forum_id}, forum, async function(response) {
      let forumObj = await util.getForumObject(forum);
      res.render(constants.FORUM , forumObj);
    });
  });
});

app.post("/deletecomment", util.redirectLogin, function(req, res) {
  db.findRow(collection.Forum, {"_id": req.body.forum_id}, function(forum) {
    forum.comments = forum.comments.filter((comment) => comment._id != req.body.comment_id);
    db.updateRow(collection.Forum, {"_id": req.body.forum_id}, forum, async function(response) {
      let forumObj = await util.getForumObject(forum);
      res.render(constants.FORUM , forumObj);
    });
  });
});


app.post("/like", util.redirectLogin, function(req, res) {
  db.findRow(collection.Forum, {"_id": req.body.forum_id}, function(forum) {
    let loginuser = req.session.user_id;
    if(forum.likes.indexOf(loginuser)  === -1 ) {
      forum.likes.push(loginuser);
    }
    else {
      let filteredArr = forum.likes.filter((user) => user !== loginuser);
      forum.likes = filteredArr;
    }
    db.updateRow(collection.Forum, {"_id": req.body.forum_id}, forum, async function(response) {
      let forumObj = await util.getForumObject(forum);
      res.render(constants.FORUM , forumObj);
    });
  });
});

app.get("/contacts",  util.redirectLogin,  function(req,res) {
  db.findAllRows(collection.Contact, async function(contacts) {
    res.render(await util.getTemplate(req) ,await util.getTemplateObject(req, {"contacts" : contacts}));
  });
});

app.get("/settings", util.redirectLogin,  function(req,res) {
  db.findRow(collection.Flat, {"flat_id" : req.session.user_id}, async function(flat) {
    res.render(await util.getTemplate(req) ,  await util.getTemplateObject(req, flat));
  });
});


app.post("/updateProfile", upload.single("photo"), function(req, res) {
  if(req.file != undefined) {
    req.body.photo = req.file.filename;
  }
  db.findAndUpdateRow(collection.Flat, {"flat_id": req.session.user_id}, req.body , function(flat) {
    flat.template = constants.HOME;
    res.render(constants.HOME, flat)
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

// https.createServer({
//   key: fs.readFileSync('server.key'),
//   cert: fs.readFileSync('server.cert')
// }, app)
app.listen(port, function () {
  console.log("Server started on port 5000");
})
