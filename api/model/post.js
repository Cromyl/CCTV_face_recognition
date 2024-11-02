import mongoose from "mongoose";

const  postSchema=mongoose.Schema({
    file:String,
    embeddings: [Number]
});

export const model1=mongoose.model('Matched',postSchema)

  
export const model2=  mongoose.model('unMatched',postSchema);