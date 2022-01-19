require('dotenv').config(); 
const express = require("express");
const path = require("path");
const ejs = require("ejs");
const bcrypt=require("bcryptjs");
const cookieParser =require("cookie-parser");

const connectDB= require("./db/conn");
const Register = require("./models/registers");
const auth= require("./middleware/auth");
const app = express();
const port = process.env.PORT || 3000;
const DATABASE_URL=process.env.DATABASE_URL||"mongodb://localhost:27017";

connectDB(DATABASE_URL);


const static_path=path.join(__dirname,"../public");
const views_path=path.join(__dirname,"../views");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine","ejs");
app.set("views",views_path);


app.get("/",(req,res)=>{
    res.render("index");
})
app.get("/secret",auth,(req,res)=>{
    // console.log(`this is the cookie awesome ${req.cookies.jwt}`);
    res.render("secret");
})
app.get("/logout", auth ,async(req,res)=>{
    try{
        console.log(req.user);

        // for single place logout
        // req.user.tokens = req.user.tokens.filter((currElement)=>{
        //     return currElement.token !== req.token
        // })

        //logout from all devices
        req.user.tokens = [];

        res.clearCookie("jwt");
        console.log("logout successfully");

        await req.user.save();
        res.render("login");
    }catch(error){
        res.status(500).send(error);
    }
})

app.get("/register",(req,res)=>{
    res.render("register");
})

app.get("/login",(req,res)=>{
    res.render("login");
})

//create a new user in our database
app.post("/register",async(req,res)=>{
    try{
        const password =req.body.password;
        const cpassword=req.body.cpassword;
        if(password===cpassword){
            const registerEmployee= new Register({
                fname: req.body.fname,
                lname: req.body.lname,
                email:req.body.email,
                gender:req.body.gender,
                phone:req.body.phone,
                age:req.body.age,
                password:password,
                cpassword:cpassword
            })

            console.log("the success part"+registerEmployee);

            const token= await registerEmployee.generateAuthToken();

            console.log("the token part"+token);

            res.cookie("jwt",token ,{
                expires:new Date(Date.now()+30000),
                httpOnly:true,
            });

            //password hash

            const registered= await registerEmployee.save();
            console.log("the page part"+registered);
            res.status(201).render("index");
        }else{
            res.send("password is not matching");
        }

    }catch(error){
        res.status(400).send(error);
    }
})

//login check
app.post("/login",async(req,res)=>{
    try{
        const email = req.body.email;
        const password= req.body.password;

        const useremail=await Register.findOne({email:email});
        // res.send(useremail);
        // console.log(useremail);

        const isMatch=await bcrypt.compare(password,useremail.password);

        const token= await useremail.generateAuthToken();

            console.log("the token part"+token);

            res.cookie("jwt",token ,{
                expires:new Date(Date.now()+30000),
                httpOnly:true,
                secure:true,
            });


        if(isMatch){
            res.status(201).render("index");
        }else{
            res.send("invalid login details");
        }

    }catch(error){
        res.status(400).send("invalid login details");
    }
})



app.listen(port,()=>{
    console.log(`server is listening at port ${port}`);
})