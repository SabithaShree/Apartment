const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fs = require("fs");
const multer  = require("multer");
// const mime = require("mime");
const https = require("https");
const crypto = require("crypto");
const dotenv = require("dotenv");
const $ = require("jquery");
const db = require(__dirname + "/database.js");
const util = require(__dirname + "/util.js");
const schedule = require(__dirname + "/schedule.js");

dotenv.config();
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

    let salt = user.salt;
    let text = password + "|" + salt;
	  let cryp = crypto.createHash('sha512');
    cryp.update(text);
	  let hash = cryp.digest('hex');	

    if(hash === user.password) {
      req.session.user_id = username;
      req.session.save();

        if(username == "admin"){
          res.redirect("/admin/flats")
        }
        else if(username == "security") {
  
        }
        else {
          res.redirect("/home");
        }
    }
    else {
      res.redirect("/");
    }
  });
});


app.get("/admin/flats", util.checkLogin, function(req, res) {
  db.findAllRows(collection.Flat, async function(flats) {
    let flatsObj = {"Block 1" : [], "Block 2": []};
    for(var i=0; i<flats.length; i++)
    {
      let flat = flats[i];
      let block = flat.flat_id.startsWith("B1") ? "Block 1" : "Block 2";
      flat.flat_id = flat.flat_id.slice(2);
      flatsObj[block].push(flat);
      if(i == flats.length-1)
      {
        let retObj = {};
        retObj.template = "flats";
        retObj.flats = flatsObj;
        res.render(
          await util.getRender(req, constants.ADMIN) , 
          await util.getTemplateObject(req, {"flats" : flatsObj}, constants.ADMIN)
        );
      }
    }
  });
});

app.get("/admin/expenses", util.checkLogin, function(req, res) {

  let date = new Date();
  let searchMonth = date.getMonth() + 1; /// current month [0 - 11]
  let searchYear = date.getFullYear();
  if(req.query.month && req.query.year) {
    req.url = req.url.split("?")[0];
    searchMonth = req.query.month;
    searchYear = req.query.year;
  }

  let retObj = {};
  let aggrExp = [
                  {$addFields: {"month" : {$month: '$date'}, "year" : {$year: "$date"}}}, // add fields explicitly adds all fields from input doc to output doc
                  {$match: {$and: [{month: searchMonth}, {year: searchYear}]}},
                  {$sort: {"date": -1}}
                ];
  db.aggregate(collection.Expense , aggrExp, function(response) {
    retObj.expenses = response;
    let aggr = [
                {$addFields: {"month" : {$month: '$date'}}}, 
                {$match: {$and: [{month: searchMonth}, {year: searchYear}]}}, 
                {$group: {_id: null, totalExpense: {$sum: '$amount'}}}
              ];
    db.aggregate(collection.Expense , aggr, async function(resp) {
      retObj.totalExpense = (resp.length > 0) ? resp[0].totalExpense : "NIL";
      res.render(
        await util.getRender(req, constants.ADMIN) ,
        await util.getTemplateObject(req, retObj, constants.ADMIN)
      );
    });
  });
});

app.post("/addExpense", function(req, res) {
  db.insertRow(collection.Expense, req.body, async function(response) {
    renderExpenses(req, res, "admin/" + constants.EXPENSES, constants.ADMIN);
  });
});

app.get("/admin/complaints", util.checkLogin, function(req, res) {
  db.findAndSortRows(collection.Complaint, {}, {"date": -1}, async function(complaints) {
    res.render(
      await util.getRender(req, constants.ADMIN) , 
      await util.getTemplateObject(req, {"complaints" : complaints}, constants.ADMIN)
    );
  });
});

app.get("/admin/association", util.checkLogin, function(req, res) {
  db.findAllRows(collection.Association, async function(association) {
    res.render(
      await util.getRender(req, constants.ADMIN) ,
      await util.getTemplateObject(req, {"association" : association}, constants.ADMIN)
    );
  });
});

app.post("/updateAssociation", function(req, res) {
  db.deleteAllRows(collection.Association, function() {
    db.insertMany(collection.Association, req.body.association, async function(association){
      res.render(
        "admin/" + constants.ASSOCIATION,
        await util.getTemplateObject(req, {"association" : association}, constants.ADMIN)
      );
    });
  })
});

app.get("/getFlats", util.checkLogin, function(req, res) {
  db.findAllRows(collection.Flat, async function(flats) {
    res.send(flats);
  });
});


app.get("/admin/maintanance", util.checkLogin, function(req, res) {
  let searchObj = {};
  if(req.query.period) {
    searchObj.period = req.query.period;
    searchObj.status = "SUCCESS";
    req.url = req.url.split("?")[0];
  }
  else {
    let date = new Date();
    let month = date.toLocaleString('default', { month: 'long' });
    let year = date.getFullYear();
    searchObj = {"period": month + " " + year, "status": "SUCCESS"};
  }

  let retObj = {};
  let group = {_id: null, totalMaintanance: {$sum: '$amount'}};
  let aggrExp = [{$match: searchObj}, {$group: group}];
  db.aggregate(collection.Payment , aggrExp, function(response) {
    retObj.totalMaintanance = (response.length > 0) ? response[0].totalMaintanance : "NIL";
    db.findRows(collection.Payment, searchObj, async function(payments) {
      retObj.payments = payments;
      res.render(
        await util.getRender(req, constants.ADMIN) ,
        await util.getTemplateObject(req, retObj, constants.ADMIN)
      );
    });
  });
});

app.get("/home", util.checkLogin, function(req, res) {
  db.findRow(collection.Flat, {"flat_id" : req.session.user_id}, async function(flat) {
    req.session.user_name = flat.name;
    req.session.user_photo = flat.photo;
    res.render(
      await util.getRender(req, constants.USER),  
      await util.getTemplateObject(req, flat, constants.USER)
    );
  });
});

app.get("/maintanance", util.checkLogin, function(req, res) {
  db.findAndSortRows(collection.Payment, {"flat_id" : req.session.user_id}, {"date": -1}, async function(payments) {
    res.render(
      await util.getRender(req, constants.USER),  
      await util.getTemplateObject(req, {"payments" : payments},  constants.USER)
    );
  })
});

app.post("/initiatePayment", util.checkLogin,  async function(req, res) {
  
	let transactionId = req.session.user_id + "_" + (new Date()).getMilliseconds();
	let amt = req.body.amount;
	let paymentInfo = req.body.period;
	let user_id = req.session.user_id; // firstname
  let emailId = (await util.getUserDetails(user_id)).email;
  let phoneNo = (await util.getUserDetails(user_id)).phone;
  
  
	let text = process.env.PAYU_KEY +'|'+ transactionId +'|'+ amt + '|' + paymentInfo +'|'+ user_id +'|'+ emailId +'|||||||||||'+ process.env.PAYU_KEY;
	let cryp = crypto.createHash('sha512');
  cryp.update(text);
	let hashCode = cryp.digest('hex');		
	res.setHeader("Content-Type", "text/json");
  res.setHeader("Access-Control-Allow-Origin", "*");


  let paymentReq = {
    key: process.env.PAYU_KEY,
    txnid: process.env.PAYU_SALT,
    hash: hashCode,
    amount: amt,
    firstname: user_id,
    email: emailId,
    phone: phoneNo,
    productinfo: paymentInfo,
    surl : "http://localhost:5000/paymentSuccess",
    furl: "http://localhost:5000/paymentSuccess", // they return same type of response. only values differ. so same url is ok.
    mode:"dropout"
  }
  res.send(paymentReq);	
});

app.post("/paymentSuccess", util.checkLogin, async function(req, res) {
	let txnid = req.body.txnid;
	let amount = req.body.amount;
	let productinfo = req.body.productinfo;
	let firstname = req.body.firstname;
	let email = req.body.email;
	let status = req.body.status;
	let resphash = req.body.hash;
	
	let keyString = process.env.PAYU_KEY +'|'+txnid+'|'+amount+'|'+productinfo+'|'+firstname+'|'+email+'|||||||||||' + status + '|' + process.env.PAYU_SALT;
	let keyArray = keyString.split('|');
	let reverseKeyArray	= keyArray.reverse();
	let reverseKeyString = reverseKeyArray.join('|');
	
	let cryp = crypto.createHash('sha512');	
	cryp.update(reverseKeyString);
	let calchash = cryp.digest('hex');
  
	let msg = (calchash == resphash) ? 'Transaction Successful and Hash Verified...' :'Payment failed for Hash not verified...';
  
  if(calchash == resphash) {
    let paymentObj = {
      "txn_id": req.body.payuMoneyId,
      "flat_id": req.body.firstname,
      "date": req.body.addedon,
      "amount": req.body.amount,
      "period": req.body.productinfo,
      "status": req.body.txnStatus,
      "message": req.body.txnMessage
    };
    db.insertRow(collection.Payment, paymentObj, function(row) {
      let url = "https://uat-accounts.payu.in/oauth/token";
      const options = {
        method: "POST",
        headers: { 'Content-Type' : 'application/json' }
      }
      let reqData = {
        client_id: process.env.PAYU_KEY,
        client_secret: process.env.PAYU_SALT,
        grant_type: "client_credentials",
        scope: "create_invoice_payumoney"
      }

      let callback = function(response) {
        response.on("data", function(apiResp) {
          process.stdout.write(apiResp);
          res.redirect("/maintanance");
        });
      }

      const request = https.request(url, options, callback);
      request.write(JSON.stringify(reqData));
      request.end();
    });
  }
  else {
    console.log(msg);
    res.redirect("/maintanance");
  }
  
});

app.get("/expenses", util.checkLogin, async function(req, res) {
  res.render(
    await util.getRender(req, constants.USER),  
    await util.getTemplateObject(req, {}, constants.USER)
  );
});

app.get("/forums", util.checkLogin, async function(req, res) {
  renderForums(req, res, await util.getRender(req, constants.USER));
});

app.get("/composeForum", util.checkLogin, function(req, res) {
  res.render( "user/" + constants.COMPOSE);
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

app.post("/deleteforum", util.checkLogin, function(req, res) {
  db.deleteRow(collection.Forum, req.body, function(resp) {
    let images = req.body.images;
    if(images != undefined) {
      for(var i=0; i<images.length; i++) {
        fs.unlinkSync(__dirname + "/public" + images[i]);
      }
    }
    renderForums(req, res, "user/"+ constants.FORUMS);
  });
});

app.get("/forum/:forum_id", util.checkLogin, function(req, res) {
  db.findRow(collection.Forum, {"_id": req.params.forum_id}, async function(forumObj) {
    res.render(
      await util.getRender(req, constants.USER) , 
      await util.getTemplateObject(req, forumObj, constants.USER)
    );
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
    renderForums(req, res, "user/"+  constants.FORUMS);
  });
});

app.post("/updateforum", function(req, res) {
  let newData = {
    "title" : req.body.title,
    "content" : req.body.content
  };
  db.findAndUpdateRow(collection.Forum, {"_id": req.body.forum_id}, newData, function(forum) {
    renderForums(req, res, "user/"+  constants.FORUMS);
  });
});

app.post("/comment", function(req, res) {
  db.findRow(collection.Forum, {"_id": req.body.forum_id}, function(forum) {
    forum.comments.push({
      "author": req.session.user_id,
      "content": req.body.content,
      "date": new Date()
    });
    db.findAndUpdateRow(collection.Forum, {"_id": req.body.forum_id}, forum, async function(forumObj) {
      res.render("user/" + constants.FORUM , forumObj);
    });
  });
});

app.post("/deletecomment", function(req, res) {
  db.findRow(collection.Forum, {"_id": req.body.forum_id}, function(forum) {
    forum.comments = forum.comments.filter((comment) => comment._id != req.body.comment_id);
    db.findAndUpdateRow(collection.Forum, {"_id": req.body.forum_id}, forum, async function(forumObj) {
      res.render("user/" + constants.FORUM , forumObj);
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
    db.findAndUpdateRow(collection.Forum, {"_id": req.body.forum_id}, forum, async function(forumObj) {
      res.render("user/" + constants.FORUM , forumObj);
    });
  });
});

app.get("/vehicles", util.checkLogin, async function(req, res) {
  res.render(
    await util.getRender(req, constants.USER), 
    await util.getTemplateObject(req, {}, constants.USER)
  );
});

app.get("/searchVehicle", util.checkLogin, function(req, res) {
  let vehicleNo = req.query.vehicleNo;
  let vehicleType = req.query.vehicleType;
  let conditionObj = {[vehicleType] : {$regex: ".*" + [vehicleNo] + ".*"}};
  db.findRow(collection.Flat, conditionObj, function(flat) {
    res.send(flat);
  });
});

app.get("/complaints", util.checkLogin, async function(req, res) {
  renderComplaints(req, res, await util.getRender(req, constants.USER));
});

app.post("/newComplaint", function(req, res) {
    req.body.status = "Open";
    req.body.flat_id = req.session.user_id;
    req.body.date = new Date();
    db.insertRow(collection.Complaint, req.body, function(complaint) {
      renderComplaints(req, res, "user/" +  constants.COMPLAINTS);
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
    renderComplaints(req, res, "user/" +  constants.COMPLAINTS);
  });
});

app.post("/deleteComplaint", function(req, res){
  db.deleteRow(collection.Complaint, req.body, function(response) {
    renderComplaints(req, res, "user/" + constants.COMPLAINTS);
  });
});

app.get("/association",  util.checkLogin,  function(req,res) {
  db.findAllRows(collection.Association, async function(association) {
    res.render(
      await util.getRender(req, constants.USER) ,
      await util.getTemplateObject(req, {"association" : association}, constants.USER)
    );
  });
});

app.get("/settings", util.checkLogin,  function(req,res) {
  db.findRow(collection.Flat, {"flat_id" : req.session.user_id}, async function(flat) {
    res.render(
      await util.getRender(req, constants.USER) ,  
      await util.getTemplateObject(req, flat, constants.USER)
    );
  });
});


app.post("/updateProfile", upload.single("photo"), function(req, res) {
  if(req.file != undefined) {
    req.body.photo = req.file.filename;
  }
  db.findAndUpdateRow(collection.Flat, {"flat_id": req.session.user_id}, req.body , function(flat) {
    flat.template = constants.HOME;
    res.render("user/" + constants.HOME, flat);
  });
});

app.post("/updatePassword", function(req, res) {
  db.findRow(collection.User, {"username" : req.session.user_id}, function(user) {

    let oldPwd = req.body.oldPassword;
    let oldText = oldPwd + "|" + user.salt;
    let cryp = crypto.createHash('sha512');
    cryp.update(oldText);
    let oldHash = cryp.digest('hex');

    if(oldHash === user.password) {

      let newPwd = req.body.password;
      let newText = newPwd + "|" + user.salt;
      let newcryp = crypto.createHash('sha512');
      newcryp.update(newText);
      let newHash = newcryp.digest('hex');

      db.findAndUpdateRow(collection.User, {"username" : req.session.user_id}, {"password": newHash}, function(user) {
        db.findRow(collection.Flat, {"flat_id": req.session.user_id}, function(flat) {
          flat.template = constants.HOME;
          res.render("user/" + constants.HOME, flat);
        });
      });
    }
    else {
      res.send("Old password is incorrect. Please try again.");
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
    res.render(
      render, 
      await util.getTemplateObject(req, {"forums" : forums}, constants.USER)
    );
  });
}

function renderComplaints(req, res, render)
{
  db.findAndSortRows(collection.Complaint, {"flat_id": req.session.user_id}, {"date": -1}, async function(complaints) {
    res.render(
      render, 
      await util.getTemplateObject(req, {"complaints" : complaints}, constants.USER)
    );
  });
}

function renderExpenses(req, res, render, loginType)
{
  db.findAndSortRows(collection.Expense, {}, {"date": -1}, async function(expenses) {
    res.render(
      render, 
      await util.getTemplateObject(req, {"expenses" : expenses}, loginType)
    );
  });
}

app.get("/migration", function(req, res) {
  db.findAllRows(collection.User, function(users) {
    users.forEach((user) => {
      let password = user.username + "*123";
      let salt = crypto.randomBytes(12).toString('base64');
      let saltPwd = password + "|" + salt;
      let cryp = crypto.createHash('sha512');
      cryp.update(saltPwd);
      let pwdHash = cryp.digest('hex');
      db.findAndUpdateRow(collection.User, {username: user.username}, {password: pwdHash, salt: salt}, function(updated) {
      });
    });
  });
});

app.listen(process.env.PORT, function () {
  console.log("Server started on port 5000");
});
