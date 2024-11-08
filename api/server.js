import express from "express";
import connect from "./database/conn.js";
import net from 'net';
// import Post from "./model/post.js";
import cors from "cors";
import { model1 as Matched, model2 as unMatched } from "./model/post.js";
// import fs from "fs";
// import multer from "multer";
// const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(express.json());
const port = 5000;
const clients = [];

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


const server = net.createServer((socket) => {
    console.log('New client connected');
    clients.push(socket);

    // Handle incoming data from client
    socket.on('data', (data) => {
        console.log('Received:', data.toString());

        // Broadcast data to all other clients
        clients.forEach((client) => {
            if (client !== socket) { // Avoid sending data back to sender
                client.write(data);
            }
        });
    });

    socket.on('end', () => {
        console.log('Client disconnected');
        clients.splice(clients.indexOf(socket), 1);
    });
});

// Start the server on port 65432
server.listen(65432, '0.0.0.0', () => {
    console.log('Server is listening on port 65432');
});




app.post('/api/similarity_query_api', async (req,res)=>{
    // const {file,embeddings} = req.body

    // console.log("******************************************************************embedding*************************");
    // // console.log(req.body)
    // console.log(req.body.embedding)
    // console.log(embeddings);

    try{
        const agg = [
            {
              '$vectorSearch': {
                'index': 'vector_index',
                'path': 'embeddings',
                'queryVector': req.body.embedding,
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
                // "file":req.body.file,
                // "embeddings":req.body.embedding,
                "isMatched":true
            }
            return res.status(200).send(obj);
        }
        else{
            const obj = {
                // "file":req.body.file,
                // "embeddings":req.body.embedding,
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
        // const {file,embeddings} = req.body;
        const obj ={
            "file": req.body.file,
            "embeddings":req.body.embedding
        }
        const data = await unMatched.create(obj);
        await data.save();
        res.status(200).json({ message: "New data uploaded to unmatched collection!!" })
    }
    catch(error){
        return res.status(400).json(error);
    }
})
app.post('/api/upload_to_Matched',async (req,res)=>{
    try{
        const {file,embeddings} = req.body;
        const obj ={
            "file": req.body.file,
            "embeddings":req.body.embedding
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

