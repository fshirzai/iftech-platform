import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {z} from "zod";
const app=express();
app.disable("x-powered-by");app.use(helmet());app.use(cors({origin:process.env.WEB_ORIGIN||"http://localhost:3000"}));app.use(express.json({limit:"40kb"}));
const schema=new mongoose.Schema({name:{type:String,required:true},email:{type:String,required:true},company:String,projectType:{type:String,required:true},budget:String,description:{type:String,required:true},status:{type:String,default:"NEW",enum:["NEW","REVIEWING","CONTACTED","CLOSED"]}},{timestamps:true});
const Request=mongoose.model("ProjectRequest",schema);
const input=z.object({name:z.string().trim().min(2).max(100),email:z.string().trim().email().max(200),company:z.string().trim().max(150).optional().default(""),projectType:z.string().trim().min(2).max(100),budget:z.string().max(50).optional().default("undecided"),description:z.string().trim().min(15).max(5000)}).strict();
app.get("/api/v1/health",(_req,res)=>res.json({status:"ok",database:mongoose.connection.readyState===1?"connected":"disconnected"}));
app.post("/api/v1/requests",rateLimit({windowMs:15*60*1000,limit:5,standardHeaders:"draft-7",legacyHeaders:false}),async(req,res)=>{const parsed=input.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:"Invalid request",details:parsed.error.flatten().fieldErrors});if(mongoose.connection.readyState!==1)return res.status(503).json({error:"Database unavailable"});try{const record=await Request.create(parsed.data);return res.status(201).json({id:record.id,message:"Request received"})}catch(err){console.error("Request persistence failed",err);return res.status(500).json({error:"Unable to save request"})}});
app.use((_req,res)=>res.status(404).json({error:"Not found"}));
const port=Number(process.env.PORT)||4000;app.listen(port,()=>console.log(`IFTECH API listening on ${port}`));
if(process.env.MONGODB_URI){mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:5000}).then(()=>console.log("MongoDB connected")).catch(err=>console.error("MongoDB connection failed:",err.message))}else{console.warn("MONGODB_URI is missing. Request submissions will return 503.")}
