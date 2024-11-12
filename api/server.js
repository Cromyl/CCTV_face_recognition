import express from "express";
import connect from "./database/conn.js";
import net from 'net';
// import Post from "./model/post.js";
import cors from "cors";
// import { WebSocket } from "ws";
import WebSocket, {WebSocketServer} from 'ws';

import { model1 as Matched, model2 as unMatched, chartModel as lineGraph, chartModel } from "./model/post.js";
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

const wss = new WebSocketServer({ port: 65432 });

wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.push(ws);

    ws.on('message', (data) => {
        console.log('Received:', data.toString());

        // Broadcast data to all other clients
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.splice(clients.indexOf(ws), 1);
    });
});





app.post('/api/similarity_query_api', async (req,res)=>{

    try{
        const agg = [
            {
              '$vectorSearch': {
                'index': 'default',
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
        if(score>0.97){
            const obj = {
                // "file":req.body.file,
                // "embeddings":req.body.embedding,
                "isMatched":true,
                "score":score
            }
            return res.status(200).send(obj);
        }
        else{
            const obj = {
                // "file":req.body.file,
                // "embeddings":req.body.embedding,
                "isMatched":false,
                "score":score
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
        // const {file,embeddings} = req.body;
        const obj ={
            "file": req.body.file,
            "embeddings":req.body.embedding
        }
        // console.log("INSIDE UPLOAD TO MATCHED **********************************************")
        console.log(req.body.embedding)
        const deleted = await unMatched.findOneAndDelete(obj);
        const data = await Matched.create(obj);
        await data.save();
        res.status(200).json({ message: "New data uploaded to matched collection!!" })
    }
    catch(error){
        return res.status(400).json(error);
    }
})


app.get('/api/fetch_all_unMatched', async (req, res) => {
    try {
        const limit = 100;  // Limit the number of entries fetched to 100
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if not specified
        const skip = (page - 1) * limit;  // Calculate offset based on page number

        const docs = await unMatched.find({}).sort({_id:-1}).skip(skip).limit(limit);

        // Optional: Get the total count of documents for pagination metadata
        const totalDocs = await unMatched.countDocuments();
        const totalPages = Math.ceil(totalDocs / limit);

        return res.status(200).json({
            data: docs,
            currentPage: page,
            totalPages: totalPages,
            totalEntries: totalDocs
        });
    } catch (error) {
        console.error("Error fetching unmatched documents:", error);
        return res.status(500).json({ message: "An error occurred while retrieving data." });
    }
});
app.get('/api/fetch_all_Matched', async (req, res) => {
    try {
        const limit = 100;  // Limit the number of entries fetched to 100
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if not specified
        const skip = (page - 1) * limit;  // Calculate offset based on page number

        const docs = await Matched.find({}).sort({_id:-1}).skip(skip).limit(limit);

        // Optional: Get the total count of documents for pagination metadata
        const totalDocs = await Matched.countDocuments();
        const totalPages = Math.ceil(totalDocs / limit);

        return res.status(200).json({
            data: docs,
            currentPage: page,
            totalPages: totalPages,
            totalEntries: totalDocs
        });
    } catch (error) {
        console.error("Error fetching matched documents:", error);
        return res.status(500).json({ message: "An error occurred while retrieving data." });
    }
});
app.post('/api/delete_from_matched', async (req, res) => {
    try {
        // console.log("*********************************************************************")
        // console.log(req.body.file)
        const obj ={
            file: req.body.file,
            embeddings :req.body.embedding
        }
        
        // Use JSON.stringify for exact matching in case embedding is an array
        const result = await Matched.deleteMany(obj);

        if (result) {
            res.status(200).json({ message: 'Entry deleted successfully', deleted: result });
        } else {
            res.status(404).json({ message: 'Entry not found' });
        }
    } catch (error) {
        console.error('Error deleting entry:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/uploadChartData',async (req,res)=>{
    try{
        // const {file,embeddings} = req.body;
        // console.log("Known = "+req.body.known_headcount)
        const obj ={
            "frame_no": req.body.frame_no,
            "count":req.body.count,
            "known_headcount":req.body.known_headcount
        }
        // console.log(req.body.embedding)
        // const deleted = await unMatched.findOneAndDelete(obj);
        const data = await chartModel.create(obj);
        await data.save();
        // res.status(200).json({ message: "New data uploaded to matched collection!!" })
        return res.status(200).json("uploaded")
    }
    catch(error){
        return res.status(400).json(error);
    }
    
})
app.get('/api/fetchChartData',async (req,res)=>{
    try {
        const doc = await chartModel.find({});
        // console.log(doc);
        return res.status(200).json(doc);
    } catch (error) {
        // console.error("Error fetching unmatched documents:", error);
        return res.status(500).json({ message: "An error occurred while retrieving data." });
    }
});


app.delete('/api/deleteChartData', async (req, res) => {
    try {
        await chartModel.deleteMany({});  // Deletes all documents in the collection
        return res.status(200).json({ message: "All data from chartModel deleted successfully!" });
    } catch (error) {
        console.error("Error deleting data from chartModel:", error);
        return res.status(500).json({ message: "An error occurred while deleting data." });
    }
});
