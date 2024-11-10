import mongoose from "mongoose";

const  postSchema=mongoose.Schema({
    file:String,
    embeddings: [Number]
},{ capped: { size: 5242880, max: 2000 } });

export const model1=mongoose.model('Matched',postSchema)

  
export const model2=  mongoose.model('unMatched',postSchema);