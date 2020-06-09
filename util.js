const session = require("express-session");
const mongoose = require("mongoose");
const model = require(__dirname + "/model.js");
const db = require(__dirname + "/database.js");
const MongoStore = require("connect-mongo")(session);
const { v4: uuidv4 } = require("uuid");

const User = model.User();
const Flat = model.Flat();
const Contact = model.Contact();
const Forum = model.Forum();
const Complaint = model.Complaint();

global.constants = Object.freeze({
  "WELCOME": "welcome",
  "HOME": "home",
  "PROFILE": "profile",
  "MAINTANANCE": "maintanance",
  "SETTINGS": "settings",
  "CONTACTS": "contacts",
  "FORUMS": "forums",
  "EXPENSES": "expenses",
  "FORUM": "forum",
  "COMPOSE": "compose",
  "COMPLAINTS": "complaints"
});


exports.redirectLogin = function(req, res, next) { // middleware function
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
  "Contact": Contact,
  "Forum": Forum,
  "Complaint": Complaint
};

exports.setSession = function(app) {
  app.set("trust proxy", 1) // trust first proxy

  let sessionObj = {
    name: "sid", // name of sessionid, default : connect.sid
    secret: "k*a$v1i&n", // some random word used for hashing. TODO: store it in .env file not in source code
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
    res.locals.user_name = req.session.user_photo;
    res.locals.user_name = req.session.user_photo;
    next();
  });
}

function isAjaxRequest(req)
{
  return req.xhr;
}

exports.getTemplate =  function(req)
{
  return new Promise((resolve) => {
    const isAjax = isAjaxRequest(req);
    let url = req.url;
    url = (url.charAt(0) == "/") ? url.substr(1, url.length) : url;
    url = (url.indexOf("/") > -1) ? url.substr(0, url.indexOf("/")) : url;
    let template = isAjax ? url : constants.WELCOME;
    resolve(template);
  });
}

exports.getTemplateObject = function(req, templateObj)
{
  return new Promise((resolve) => {
    let url = req.url;
    url = (url.charAt(0) == "/") ? url.substr(1, url.length) : url;
    url = (url.indexOf("/") > -1) ? url.substr(0, url.indexOf("/")) : url;
    templateObj.template = url;
    resolve(templateObj);
  });
}

exports.getForumsObject = async function(forums)
{
  return new Promise(async (resolve) => {
    let forumsArr = forums;
    for(let i=0; i<forumsArr.length; i++) {
      forumsArr[i].photo = await getUserPhoto(forumsArr[i].author);
    }
    resolve(forumsArr);
  });
}

exports.getForumObject = function(forum)
{
  return new Promise(async (resolve) => {
    let forumObj = forum;
    let username = await getUserName(forumObj.author);
    let userPic = await getUserPhoto(forumObj.author);
    forumObj.author_id = forumObj.author;
    forumObj.author = username;
    forumObj.photo = userPic;

    for(var i=0; i<forumObj.comments.length; i++)
    {
      let cmtUserName = await getUserName(forumObj.comments[i].author);
      let commentUserPic = await getUserPhoto(forumObj.comments[i].author);
      forumObj.comments[i].author_id = forumObj.comments[i].author;
      forumObj.comments[i].author = cmtUserName;
      forumObj.comments[i].photo = commentUserPic;
    };
    resolve(forumObj);
  });
}

async function getUserName(flat_id)
{
  return new Promise((resolve) => {
    db.findRow(Flat, {"flat_id": flat_id}, function(flat)  {
      resolve(flat.name);
    });
  });
}

async function getUserPhoto(flat_id)
{
  return new Promise((resolve) => {
    db.findRow(Flat, {"flat_id": flat_id}, function(flat)  {
      resolve(flat.photo);
    });
  })
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
