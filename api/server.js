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
    console.log("Invalid DB Connection")
})



app.post('/api/upload', async (req, res) => {


    try {
        //console.log(req.body)
        const { file, embeddings } = req.body;
        //console.log("file",file," embeddings ",embeddings);
        //if(file===undefined) return res.status(400).send("file undefined");
        const obj = {
            file: file,
            embeddings: embeddings
        }
        const data = await Matched.create(obj);
        data.save();
        res.status(200).json({ message: "New data uploaded !!" })
    } catch (error) {
        return res.status(400).json(error);
    }
})