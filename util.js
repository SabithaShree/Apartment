const session = require("express-session");
const mongoose = require("mongoose");
const model = require(__dirname + "/model.js");
const db = require(__dirname + "/database.js");
const MongoStore = require("connect-mongo")(session);
const { v4: uuidv4 } = require("uuid");

const User = model.User();
const Flat = model.Flat();
const Association = model.Association();
const Forum = model.Forum();
const Complaint = model.Complaint();
const Payment = model.Payment();
const Expense = model.Expense();

global.constants = Object.freeze({
  "ADMIN": "admin",
  "USER": "user",
  "HOME": "home",
  "PROFILE": "profile",
  "MAINTANANCE": "maintanance",
  "SETTINGS": "settings",
  "ASSOCIATION": "association",
  "FORUMS": "forums",
  "EXPENSES": "expenses",
  "FORUM": "forum",
  "COMPOSE": "compose",
  "COMPLAINTS": "complaints",
  "VEHICLES": "vehicles"
});


exports.checkLogin = function(req, res, next) { // middleware function
  if(!req.session.user_id) {
    res.redirect("/");
  }
  else {
    next();
  }
}

exports.collection = {
  "User": User,
  "Flat": Flat,
  "Association": Association,
  "Forum": Forum,
  "Complaint": Complaint,
  "Payment" : Payment,
  "Expense" : Expense
};

exports.setSession = function(app) {
  app.set("trust proxy", 1) // trust first proxy

  let sessionObj = {
    name: "sid", // name of sessionid, default : connect.sid
    secret: process.env.SESSION_SECRET, // some random word used for hashing.
    resave: false, //don't save session if unmodified
    saveUninitialized: true, // don't create session until something store
    genid: function(req) {
      return uuidv4() // use UUIDs for session IDs
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    }), // store sessionId in mongodb
    cookie: {
      secure: (app.get('env') === 'production'), // development or production
      maxAge:  24 * 60 * 60 * 1000 // 1  day
    }
  };
  app.use(session(sessionObj));

  app.use(function(req, res, next) {
    res.locals.user_id = req.session.user_id; // make it access globally across all templates

    db.findAllRowsWithFields(Flat, "flat_id name email phone photo area", function(flatsList) {
        let flats = {};
        flatsList.forEach((flat) => {
          flats[flat.flat_id] = flat;
        });
        res.locals.flats = flats;
        next();
    });
  });

}

function isAjaxRequest(req)
{
  return req.xhr;
}

exports.getRender =  function(req, loginType)
{
  return new Promise((resolve) => {
    const isAjax = isAjaxRequest(req);
    let url = req.url;
    url = (url.charAt(0) == "/") ? url.substr(1, url.length) : url; // non-ajax urls start with /
    url = url.replace(loginType + "/", ""); // admin urls start with 'admin'
    url = (url.indexOf("/") > -1) ? url.substr(0, url.indexOf("/")) : url; // forum url has 2 sections in forum
    let template = isAjax ? url : loginType;
    resolve(loginType + "/" + template);
  });
}

exports.getTemplateObject = function(req, templateObj, loginType)
{
  return new Promise((resolve) => {
    let url = req.url;
    url = (url.charAt(0) == "/") ? url.substr(1, url.length) : url;
    url = url.replace(loginType + "/", ""); // admin urls start with 'admin'
    url = (url.indexOf("/") > -1) ? url.substr(0, url.indexOf("/")) : url;
    templateObj.template = url;
    resolve(templateObj);
  });
}

exports.getUserDetails = function(flat_id)
{
  return new Promise((resolve) => {
    db.findRow(Flat, {"flat_id": flat_id}, function(flat) {
      resolve(flat);
    })
  });
}


// javascript is a synchronous programming language. only one thread execution.
// it wont wait for a function to finish executing.
// so async await is introduced.
// async is used to define a function as an asynchronous function. Only inside that function
// await key word can be used. await says that it will wait for a particular
// task to get completed.
// to get a returned value from that await function, that particular function
// must return a Promise object
// Promise is an object that takes 2 functions as params.
// One is resolve function, another is reject function.
// do the necessary async task inside this Promise section and call the resolve method
// by passing the value to be returned.
// if there is any error in that task, call reject method by passing the error details
