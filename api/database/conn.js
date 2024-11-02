import mongoose from "mongoose";

export default async function connect(){
    //const mongoServer= await MongoMemoryServer.create();
    const mongoUri="mongodb+srv://kaushik:kaushik@cluster0.e1nju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    await mongoose.connect(mongoUri,{dbName:"Cluster0"});
    console.log(`MongoDB successfully connected to ${mongoUri}`)
}