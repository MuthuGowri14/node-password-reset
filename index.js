
const express = require("express");
const mongodb = require("mongodb");
const cors = require("cors");
const cryptoRandomString=require("crypto-random-string");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();

const mongoClient = mongodb.MongoClient;
const objectId = mongodb.ObjectID;

const app = express();
const dbURL = process.env.DB_URL || "mongodb://127.0.0.1:27017";
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  try {
    let clientInfo = await mongoClient.connect(dbURL);
    let db = clientInfo.db("studentDetails");
    let data = await db.collection("users").find().toArray();
    res.status(200).json({ data });
    clientInfo.close();
  } catch (error) {
    console.log(error);
    res.send(500);
  }
});

app.post("/add-user", async (req, res) => {
  try {
    let clientInfo = await mongoClient.connect(dbURL);
    let db = clientInfo.db("studentDetails");
    let data = await db.collection("users").insertOne(req.body);
    res.status(200).json({ message: "User created" });
    clientInfo.close();
  } catch (error) {
    console.log(error);
    res.send(500);
  }
});

app.get("/get-user/:id", async (req, res) => {
  try {
    let clientInfo = await mongoClient.connect(dbURL);
    let db = clientInfo.db("studentDetails");
    let data = await db
      .collection("users")
      .findOne({ _id: objectId(req.params.id) });
    res.status(200).json({ data });
    clientInfo.close();
  } catch (error) {
    console.log(error);
    res.send(500);
  }
});

app.post("/register", async (req, res) => {
  try {
    let clientInfo = await mongoClient.connect(dbURL);
    let db = clientInfo.db("studentDetails");
    let result = await db
      .collection("users")
      .findOne({ email: req.body.email });
    if (result) {
      cosnole.log(result)
      res.status(400).json({ message: "User already registered" });
      alert("User already registered")
      clientInfo.close();
    } else {
      let salt = await bcrypt.genSalt(15);
      let hash = await bcrypt.hash(req.body.password, salt);
      req.body.password = hash;
      await db.collection("users").insertOne(req.body);
      res.status(200).json({ message: "User registered" });
      clientInfo.close();
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    let clientInfo = await mongoClient.connect(dbURL);
    let db = clientInfo.db("studentDetails");
    let result = await db
      .collection("users")
      .findOne({ email: req.body.email });
    if (result) {
      let isTrue = await bcrypt.compare(req.body.password, result.password);
      if (isTrue) {
        res.status(200).json({ message: "Login success" });
      } else {
        res.status(200).json({ message: "Login unsuccessful" });
      }
    } else {
      res.status(400).json({ message: "User not registered" });
    }
  } catch (error) {
    console.log(error);
  }
  clientInfo.close();
});

app.post("/forgot_password", async (req, res) => {
  try {
    let clientInfo = await mongoClient.connect(dbURL);
    let db = clientInfo.db("studentDetails");
    let result = await db
      .collection("users")
      .findOne({ email: req.body.email });
      if (result) {
        let pw=cryptoRandomString({length: 10, type: 'url-safe'});
        await forgot_password(req.body.email,pw);
        res.status(200).json({ message: "success" , "password":`${pw}`});
    } else {
      res.status(400).json({ message: "User not registered" });
    }
  } catch (error) {
    console.log(error);
  }
  clientInfo.close();
});

app.put("/forgot_password/:email", async (req, res) => {
    try {
      let clientInfo = await mongoClient.connect(dbURL);
      let db = clientInfo.db("studentDetails");
      let result = await db
        .collection("users")
        .findOne({ email: req.params.email},{$set:{"password":req.body.password}});
      res.status(200);
    clientInfo.close();
    } catch (error) {
      console.log(error);
    }
  });

app.listen(3000);

async function forgot_password(email,pass){
    try{
        let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.User_name, // generated ethereal user
          pass: process.env.User_pass, // generated ethereal password
        },
      });
    
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"mnshakib79@gmail.com', // sender address
        to: `${email}`, // list of receivers
        subject: "Reset Password ✔", // Subject line
        text: "Reset Password Key Send To You", // plain text body
        html: `<b>Reset Password Key=>${pass}</b>`, // html body
      });
    }catch(err){
      res.send(500);
    }
}