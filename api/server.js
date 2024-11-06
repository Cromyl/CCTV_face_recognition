import express from "express";
import connect from "./database/conn.js";
// import Post from "./model/post.js";
import cors from "cors";
import { model1 as Matched, model2 as unMatched } from "./model/post.js";
// import fs from "fs";
// import multer from "multer";
// const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(express.json());
const port = 5000;

app.use(cors({
    origin: '*' // Allow requests from this origin
  }));


  connect().then(() => {
    try {
        app.listen(port, () => {
            console.log(`Server connected to port ${port}`)
        })
    } catch (error) {
        console.log("Cannot connect to the server");
    }
}).catch((error) => {
    console.log(error)
    console.log("Invalid DB Connection")
})

app.post('/api/similarity_query_api', async (req,res)=>{
    const {file,embeddings} = req.body
    console.log("******************************************************************embedding*************************");
    console.log(embeddings);

    try{
        const agg = [
            {
              '$vectorSearch': {
                'index': 'vector_index',
                'path': 'embeddings',
                'queryVector': embeddings,
                'numCandidates': 150,
                'limit': 1
              }
            }, {
              '$project': {
                '_id': 0,
                'file': 1,
                'score': {
                  '$meta': 'vectorSearchScore'
                }
              }
            }
          ];
        // run pipeline
        const result = await Matched.aggregate(agg);
        var score = 0;
        result.forEach(elem => {
            score = elem.score;
        });
        console.log("SCORE_____________",score);
        if(score>0.7){
            const obj = {
                "file":file,
                "embeddings":embeddings,
                "isMatched":true
            }
            return res.status(200).send(obj);
        }
        else{
            const obj = {
                "file":file,
                "embeddings":embeddings,
                "isMatched":false
            }
            return res.status(200).send(obj)
        }
    }catch (err){
        console.log(err);
        return res.status(400).json(err);
    }

})
app.post('/api/upload_to_unMatched',async (req,res)=>{
    try{
        const {file,embeddings} = req.body;
        const obj ={
            "file": file,
            "embeddings":embeddings
        }
        const data = await unMatched.create(obj);
        await data.save();
        res.status(200).json({ message: "New data uploaded to unmatched collection!!" })
    }
    catch(error){
        return res.status(400).json(error);
    }
})
app.post('/api/upload_to_Matched_if_recognised',async (req,res)=>{
    try{
        const {file,embeddings} = req.body;
        const obj ={
            "file": file,
            "embeddings":embeddings
        }
        const deleted = await unMatched.findOneAndDelete(obj);
        const data = await Matched.create(obj);
        await data.save();
        res.status(200).json({ message: "New data uploaded to matched collection!!" })
    }
    catch(error){
        return res.status(400).json(error);
    }
})
app.get('/api/fetch_all_unMatched',async (req,res)=>{
    try {
        const doc = await unMatched.find({});
        return res.status(200).json(doc);
    } catch (error) {
        console.error("Error fetching unmatched documents:", error);
        return res.status(500).json({ message: "An error occurred while retrieving data." });
    }
});
// app.post('/api/upload', async (req, res) => {
//     try {
//         //console.log(req.body)
//         const { file, embeddings } = req.body;
//         //console.log("file",file," embeddings ",embeddings);
//         //if(file===undefined) return res.status(400).send("file undefined");
//         const obj = {
//             file: file,
//             embeddings: embeddings
//         }
//         const data = await Matched.create(obj);
//         data.save();
//         res.status(200).json({ message: "New data uploaded !!" })
//     } catch (error) {
//         return res.status(400).json(error);
//     }
// })

