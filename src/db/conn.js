const mongoose= require("mongoose");

const connectDB=async (DATABASE_URL)=>{
    try{
    const DB_OPTIONS={
        dbname:'registration-login',
    }
    await mongoose.connect(DATABASE_URL,DB_OPTIONS);
    console.log("connected successfully");
    }catch(err){
        console.log("error is"+err);
    }
}
module.exports=connectDB;