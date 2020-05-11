const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/apartment"; // const url = "mongodb+srv://admin-sabitha:Test123@cluster0-ywl9n.mongodb.net/blogdb?retryWrites=true&w=majority"
mongoose.connect(url, {useNewUrlParser : true, useUnifiedTopology: true});

exports.User = function()
{
  const Schema = mongoose.Schema;
  const userSchema = new Schema({
    "username" : "String",
    "password" : "String"
  });
  return mongoose.model("User", userSchema);
}

exports.Flat = function()
{
  const Schema = mongoose.Schema;
  const flatSchema = new Schema({
    "flat_id" : "String",
    "name" : "String",
    "phone" : "Number",
    "email" : "String",
    "family" : "Number",
    "vehicles" : {"car" : "String", "bike" : "String"}
  });
  return mongoose.model("Flat", flatSchema);
}

exports.Contact = function()
{
  const Schema = mongoose.Schema;
  const contactSchema = new Schema({
    "title" : "String",
    "members" : [{
        "name" : "String",
        "contact" : "Number"
      }]
  });
  return mongoose.model("Contact", contactSchema);
}

exports.Forum = function()
{
  const Schema = mongoose.Schema;
  const forumSchema = new Schema({
    "title": "String",
    "content": "String",
    "author": "String",
    "date": "Date",
    "comments": [{
      "author": "String",
      "content": "String",
      "date": "Date"
    }]
  });
  return mongoose.model("Forum", forumSchema);
}
