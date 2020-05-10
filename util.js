const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);
const { v4: uuidv4 } = require("uuid");

exports.redirectLogin = function(req, res, next) {
  if(!req.session.user_id) {
    res.redirect("/");
  }
  else {
    next();
  }
}

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
      mongooseConnection: mongoose.connection }), // store sessionId in mongodb
    cookie: {
      secure: (app.get('env') === 'production'), // development or production
      maxAge:  24 * 60 * 60 * 1000 // 1  day
    }
  };
  app.use(session(sessionObj));
}
