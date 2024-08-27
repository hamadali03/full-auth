import mongoose from "mongoose";

const Connect = async()=>{
   try {
     const conn=await mongoose.connect(process.env.DATABASE_URl)
       console.log(`MongoDB Connect: ${conn.connection.host}`)
   } catch (error) {
      console.log("Error Connection to MongoDB: ",error.message)
      process.exit(1)
   }

}

export default Connect; 