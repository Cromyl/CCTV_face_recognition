
# 📸 CCTV Face Recognition Security System

A real-time CCTV-based security system that detects faces, recognizes known individuals, and alerts the user of unknown entries. The system provides analytical insights through various graphs, such as crowd density and known vs. unknown headcount. This project integrates React.js for the frontend, Node.js for the backend, and Python for face detection and recognition. All data, including face images and their embeddings, are stored in MongoDB Atlas.

## 🚀 Key Features
**Real-Time Face Detection & Recognition:** Detects faces from CCTV camera feeds and classifies them as known or unknown.

**Unmatched Faces Alert:** Displays unmatched faces to the user, allowing them to accept or reject entries.

**Dynamic Database Management:** Known faces are stored in a "matched" collection, while new/unknown faces are shown to the user.

Users can manually move faces between the matched and unmatched collections.

**Analytics Dashboard:** 

**Crowd Density:** Monitors the number of people detected in each frame.

**Rolling Average (Last 40 Frames):** Provides a moving average for crowd count over time.

**Known vs. Unknown Headcount:** Visualizes the proportion of known vs. unknown individuals detected.

## Technology Stack:
**Frontend:** React.js

**Backend:** Node.js with Express

**Face Detection & Recognition:** Python (OpenCV,YOLO (YOLOv3) for detecting people in frames,MTCNN model for detecting faces in frames,FaceNet (InceptionResnetV1)	Generating embeddings for face recognition )

**Database:** MongoDB Atlas (storing images in Base64 format with embeddings)

## ⚙️ Installation & Setup
**Prerequisites**

Node.js (v16+)

Python (v3.8+)

MongoDB Atlas account

npm & pip package managers

## Step 1

```bash
git clone https://github.com/Cromyl/CCTV_face_recognition.git
cd CCTV_face_recognition

```
## Step 2: Set Up the Python Environment
Download following files.

https://github.com/pjreddie/darknet/blob/master/cfg/yolov3.cfg

https://github.com/patrick013/Object-Detection---Yolov3/blob/master/model/yolov3.weights

```bash
pip install -r requirements.txt

```
## Step 3: Set Up the Backend

```bash
cd api
npm install
npm start

```

## Step 4 : Set up the frontend

```bash
cd frontend
npm install
npm start

```
## Step 5 : To run face detectection script
```bash
python face_detection_cctv.py
```

## 🖥️ How It Works
**1. Face Detection & Recognition**

The system uses OpenCV and the face_recognition library to detect faces in real-time from CCTV camera feeds.
If a detected face matches an entry in the database (based on embeddings), it is considered "known"; otherwise, it is flagged as "unknown".

**2. Database Management**
MongoDB Atlas is used to store:
Face images in Base64 format
Corresponding embeddings for efficient face matching
Real-time analytics data (crowd count, known vs. unknown headcount, etc.)
When an unmatched face is detected, the user can manually accept it as a known person, moving the entry from the "unmatched" collection to the "matched" collection.

**3. Analytics Dashboard**

Crowd Density: Number of faces detected per frame.

Rolling Average (Last 40 Frames): Averages the crowd density over the last 40 frames.

Known vs. Unknown Headcount: A graph that visualizes the ratio of known to unknown individuals.


**4. API Endpoints**

**/api/similarity_query_api** -	Performs a vector search on the Matched collection. Returns isMatched: true if score > 0.97.

**/api/upload_to_unMatched** -Uploads a new document to the unMatched collection if it doesn't already exist.

**/api/upload_to_Matched**	-Moves a document from unMatched to Matched collection. Deletes from unMatched if found.

**/api/delete_from_unmatched**-	Deletes a document from the unMatched collection based on file and embedding.

**/api/fetch_all_unMatched**-	Fetches all documents from the unMatched collection with pagination (default limit: 100).

**/api/fetch_all_Matched**-	Fetches all documents from the Matched collection with pagination (default limit: 100).

**/api/delete_from_matched**-	Deletes documents from the Matched collection based on file and embedding.

**/api/uploadChartData**-	Uploads chart data (frame number, count, known headcount) to the chartModel collection.

**/api/fetchChartData**	-Fetches all chart data from the chartModel collection.

**/api/deleteChartData**-	Deletes all documents in the chartModel collection.


## 📧 Contact
Shruti - shrutibilolikar2003@gmail.com

Kaushik - as920078.kaushikmullick@gmail.com

