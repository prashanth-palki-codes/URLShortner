const express=require("express")
const mongodb=require("mongodb")
const cors=require("cors")
const nodemailer = require("nodemailer")
require("dotenv").config()

const mongoClient=mongodb.MongoClient
const objectId=mongodb.ObjectID

const app=express()

const dbURL = process.env.DB_URL || "mongodb://127.0.0.1:27017"

const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())


app.post("/createNewUser/:useremail",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("URLShortnerDB")
        let data = await db.collection('UsersDetails').insertOne(req.body)
        res.status(200).json({message : "User Created"})
        clientInfo.close()

        async function mailer() {

            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASS
                }
            });
        
            let info = await transporter.sendMail({
                from: process.env.EMAIL, 
                to: req.params.useremail,
                subject: "Activate your Account", 
                text: "Click the below link to activate your account "+" https://prashanth-shorturl.netlify.app/activationpage"
            });
        
            console.log("<------------Mail sent: %s------------->", info.response);
        }
        mailer().catch(console.error);

    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.get("/checkUser/:useremail",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("URLShortnerDB")
        let data = await db.collection("UsersDetails").find({ email : { $eq : req.params.useremail }}).toArray();
        res.status(200).json({data})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.put("/activate/:useremail",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("URLShortnerDB")
        let data = await db.collection('UsersDetails').updateOne( { email : req.params.useremail } , { $set : { activation : "active" } });
        res.status(200).json({message : "Account activated"})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.put("/changePassword/:useremail",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("URLShortnerDB")
        let data = await db.collection('UsersDetails').updateOne( { email : req.params.useremail } , { $set : { password : req.body.password } });
        res.status(200).json({message : "Password Changed"})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.put("/addOTP/:useremail",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("URLShortnerDB")
        await db.collection('UsersDetails').updateOne( { email : req.params.useremail } , { $unset : { OTP : 1} });
        let data = await db.collection('UsersDetails').updateOne( { email : req.params.useremail } , { $set : { OTP : req.body.OTP } });
        res.status(200).json({message : "OTP Added"})
        clientInfo.close()

        async function mailer() {

            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASS
                }
            });
        
            let info = await transporter.sendMail({
                from: process.env.EMAIL, 
                to: req.params.useremail,
                subject: "Reset Password", 
                text: "Your OTP for Password Reset is: "+req.body.OTP
            });
        
            console.log("<------------Mail sent: %s------------->", info.response);
        }
        mailer().catch(console.error);

    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.put("/removeOTP/:useremail",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("URLShortnerDB")
        let data = await db.collection('UsersDetails').updateOne( { email : req.params.useremail } , { $unset : { OTP : 1} });
        res.status(200).json({message : "OTP Removed"})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.get("/checkOTP/:useremail",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("URLShortnerDB")
        let data = await db.collection("UsersDetails").find({ email : { $eq : req.params.useremail }}).toArray();
        res.status(200).json({data})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.get("/checkUserInURLDB/:useremail",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("URLShortnerDB")
        let data = await db.collection("URLsCollection").find({ email : { $eq : req.params.useremail }}).toArray();
        res.status(200).json({data})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.post("/addNewURLs/:useremail",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("URLShortnerDB")
        let data = await db.collection('URLsCollection').insertOne(req.body)
        res.status(200).json({message:"New user added with URLs"})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.put("/addURLs/:useremail",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("URLShortnerDB")
        let data = await db.collection('URLsCollection').updateOne( { email : req.params.useremail } , { $push : { URLsList : req.body } });
        res.status(200).json({message:"URLs appened"})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.get("/:myshortURL",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("URLShortnerDB")
        let data = await db.collection("URLsCollection").find().toArray();
        let fullURL=""
        for(let i=0;i<data.length;i++){
            data[i].URLsList.forEach(element => {
                if(element.shortURL===req.params.myshortURL){
                    fullURL=element.fullURL
                }
            });
        }
        res.redirect(fullURL)
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})




app.listen(port,()=>{
    console.log("App started at port :",port)
})