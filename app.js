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
    if(file.fieldname == "photo") { // profile image
     const photoName = "profile-" + req.session.user_id;
     cb(null, photoName + ".jpg");
   }
   else if(file.fieldname == "image") { // forum images
      cb(null, req.session.user_id + Math.floor(Math.random()*100) + file.originalname);
   }
   else if(file.fieldname == "file") {
     cb(null, file.originalname);
   }
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

app.get("/forums", util.redirectLogin, async function(req, res) {
  renderForums(req, res, await util.getTemplate(req));
});

app.get("/composeForum", util.redirectLogin, function(req, res) {
  res.render(constants.COMPOSE);
});

app.post("/uploadImgForum", upload.single("image"), function(req, res) {
  if(req.file != undefined) {
    let resObj = {"link": "/uploads/" + req.file.filename};
    res.send(resObj);
  }
});

app.post("/deleteForumImg", function(req, res) {
  fs.unlinkSync(__dirname + "/public" + req.body.image);
  res.send({status: 200, msg: "success"});
});

app.post("/deleteforum", util.redirectLogin, function(req, res) {
  db.deleteRow(collection.Forum, req.body, function(resp) {
    let images = req.body.images;
    if(images != undefined) {
      for(var i=0; i<images.length; i++) {
        fs.unlinkSync(__dirname + "/public" + images[i]);
      }
    }
    renderForums(req, res, constants.FORUMS);
  });
});

app.get("/forum/:forum_id", util.redirectLogin, function(req, res) {
  db.findRow(collection.Forum, {"_id": req.params.forum_id}, async function(forum) {
    let forumObj = await util.getForumObject(forum);
    res.render(await util.getTemplate(req) , await util.getTemplateObject(req, forumObj));
  });
});

app.post("/newforum", function(req, res) {
  let forumObj = req.body;
  Object.assign(forumObj,
    {"author" : req.session.user_id,
     "comments" : [],
     "likes" : [],
     "date" : new Date()
   });
  db.insertRow(collection.Forum, forumObj, function(response) {
    renderForums(req, res, constants.FORUMS);
  });
});

app.post("/updateforum", function(req, res) {
  let newData = {
    "title" : req.body.title,
    "content" : req.body.content
  };
  db.findAndUpdateRow(collection.Forum, {"_id": req.body.forum_id}, newData, function(forum) {
    renderForums(req, res, constants.FORUMS);
  });
});

app.post("/comment", function(req, res) {
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

app.post("/deletecomment", function(req, res) {
  db.findRow(collection.Forum, {"_id": req.body.forum_id}, function(forum) {
    forum.comments = forum.comments.filter((comment) => comment._id != req.body.comment_id);
    db.updateRow(collection.Forum, {"_id": req.body.forum_id}, forum, async function(response) {
      let forumObj = await util.getForumObject(forum);
      res.render(constants.FORUM , forumObj);
    });
  });
});


app.post("/like",  function(req, res) {
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

app.get("/complaints", util.redirectLogin, async function(req, res) {
  renderComplaints(req, res, await util.getTemplate(req));
});

app.post("/newComplaint", function(req, res) {
    req.body.status = "Open";
    req.body.flat_id = req.session.user_id;
    req.body.date = new Date();
    db.insertRow(collection.Complaint, req.body, function(complaint) {
      renderComplaints(req, res, constants.COMPLAINTS);
    });
});

app.get("/editComplaint", function(req, res) {
  db.findRow(collection.Complaint, req.query, function(complaint) {
    res.send(complaint);
  });
});

app.post("/updateComplaint", function(req, res) {
  let complaintId = req.body.complaintId;
  delete req.body.complaintId;
  db.findAndUpdateRow(collection.Complaint, {"_id": complaintId}, req.body, function(complaint) {
    renderComplaints(req, res, constants.COMPLAINTS);
  });
});

app.post("/deleteComplaint", function(req, res){
  db.deleteRow(collection.Complaint, req.body, function(response) {
    renderComplaints(req, res, constants.COMPLAINTS);
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

app.post("/updatePassword", function(req, res) {
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


function renderForums(req, res, render)
{
  db.findAndSortRows(collection.Forum, {}, {"date": -1}, async function(forums) {
    let forumsObj = await util.getForumsObject(forums);
    res.render(render, await util.getTemplateObject(req, {"forums" : forumsObj}));
  });
}

function renderComplaints(req, res, render)
{
  db.findAndSortRows(collection.Complaint, {"flat_id": req.session.user_id}, {"date": -1}, async function(complaints) {
    res.render(render, await util.getTemplateObject(req, {"complaints" : complaints}));
  });
}


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
});
