const mongoose= require("mongoose");
const validator=require("validator");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");


const employeeSchema= new mongoose.Schema({
    fname:{
        type:String,
        required:true,
    },
    lname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:[true,"email id is already present"],
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("invalid email");
            }
        }
    },
    gender:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
       
    },
    age:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true,
    },
    tokens:[{
        token:{
        type:String,
        required:true,
        }

    }]


})
//generating token
employeeSchema.methods.generateAuthToken=async function(){
    try {
        const token=jwt.sign({_id:this._id},process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (error) {
        res.send("the error part"+error);
        console.log("the error part"+error);
    }

}

//converting password into hash
employeeSchema.pre("save",async function(next){

    if(this.isModified("password")){
        // console.log(`the current password is ${this.password}`);
        this.password=await bcrypt.hash(this.password,10);
        // console.log(`the current password is ${this.password}`);
        this.cpassword=await bcrypt.hash(this.password,10);
    }
    next();
})

const Register = new mongoose.model("Register",employeeSchema);

module.exports=Register;