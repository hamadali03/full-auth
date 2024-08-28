import express from "express"
// import cors from "cors"
import cors from "cors";
import dotenv from 'dotenv';
import Connect from "./config/ConnectDb.js";
import authRoutes from "./routes/auth.js"
import cookieParser from "cookie-parser";
import path from "path";
dotenv.config();

Connect()
//app config
const app=express()
const __dirname = path.resolve();
// const port=process.env.PORT||4000
app.use(cors({origin:'http://localhost:5173', credentials: true}));
  //  'https://full-auth-front.vercel.app/',
// app.use(cors());
 
//middleware

app.use(express.json())  // allows us to parse incoming request:req.body
app.use(cookieParser()); // allows us to parse incoming cookies
// app.use(cors())


//initializing route
app.use("/api/auth",authRoutes)
 
app.get("/",(req,resp)=>{
    resp.send("API WORKING")
  })
  
  // if (process.env.NODE_ENV === "production") {
  //   app.use(express.static(path.join(__dirname, "/frontend/dist")));
  
  //   app.get("*", (req, res) => {
  //     res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  //   });
  // }
app.listen(process.env.PORT,()=>{
    console.log(`Server Started on ${process.env.PORT}`)
})
