const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/apartment"; // const url = mongodb+srv://admin-sabitha:Test123@cluster0-ywl9n.mongodb.net/blogdb?retryWrites=true&w=majority
mongoose.connect(url, {useNewUrlParser : true, useUnifiedTopology: true, useFindAndModify: false});

exports.User = function()
{
  const Schema = mongoose.Schema;
  const userSchema = new Schema({
    username : String,
    password : String
  });
  return mongoose.model("User", userSchema);
}

exports.Flat = function()
{
  const Schema = mongoose.Schema;
  const flatSchema = new Schema({
    flat_id : String,
    name : String,
    phone : Number,
    email : String,
    family : Number,
    twowheeler : String,
    fourwheeler : String,
    photo : String
  });
  return mongoose.model("Flat", flatSchema);
}

exports.Association = function()
{
  const Schema = mongoose.Schema;
  const associationSchema = new Schema({
    title : String,
    members : [String]
  });
  return mongoose.model("Association", associationSchema);
}

exports.Forum = function()
{
  const Schema = mongoose.Schema;
  const forumSchema = new Schema({
    title: String,
    content: String,
    author: String, // flat_id
    date: Date,
    likes: [String], // array of flat_id
    comments: [{
      author: String, // flat_id
      content: String,
      date: Date
    }]
  });
  return mongoose.model("Forum", forumSchema);
}

exports.Complaint = function()
{
  const Schema = mongoose.Schema;
  const complaintSchema = new Schema({
    flat_id: String,
    title: String,
    description: String,
    date: Date,
    status: {
      type: String,
      enum: ["Open", "In-progress", "Close"]
    }
  });
  return mongoose.model("Complaint", complaintSchema);
}

exports.Payment = function()
{
  const Schema = mongoose.Schema;
  const paymentSchema = new Schema({
    txn_id: String,
    flat_id: String,
    period: String,
    date: Date,
    amount: Number,
    status: String,
    message: String
  });
  return mongoose.model("Payment", paymentSchema);
}