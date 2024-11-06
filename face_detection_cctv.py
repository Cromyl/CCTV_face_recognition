# Import necessary libraries
import cv2
import time
import numpy as np
import yt_dlp as youtube_dl
import os
from facenet_pytorch import MTCNN, InceptionResnetV1
import torch
import csv
import requests
import base64
import json

# Create a directory to store detected faces
os.makedirs("detected_faces", exist_ok=True)

# Step 1: Retrieve the YouTube video stream URL
def get_youtube_video_url(youtube_url):
    ydl_opts = {
        'format': 'best',
        'quiet': True,
        'noplaylist': True,
        'extract_flat': True,
    }
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=False)
        return info['url']

# Step 2: Load YOLO model
def load_yolo_model():
    net = cv2.dnn.readNet("yolov3.weights", "yolov3.cfg")
    layer_names = net.getLayerNames()
    output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]
    return net, output_layers


# Detect people in the frame
def detect_people_in_frame(frame, net, output_layers):
    height, width = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(frame, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
    net.setInput(blob)
    outputs = net.forward(output_layers)

    boxes = []
    confidences = []
    class_ids = []

    for output in outputs:
        for detection in output:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            if confidence > 0.5 and class_id == 0:
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width)
                h = int(detection[3] * height)
                x = int(center_x - w / 2)
                y = int(center_y - h / 2)
                boxes.append([x, y, w, h])
                confidences.append(float(confidence))
                class_ids.append(class_id)

    indices = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)
    headcount = len(indices)

    for i in indices:
        box = boxes[i]
        x, y, w, h = box
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

    return headcount

# Step 3: Capture frames and detect faces
def capture_and_detect_faces(stream_url, mtcnn, face_model, yolo_net, output_layers, interval=3):
    cap = cv2.VideoCapture(stream_url)
    if not cap.isOpened():
        print("Error: Could not open video stream.")
        return

    frame_rate = cap.get(cv2.CAP_PROP_FPS)
    if frame_rate == 0:
        print("Error: Could not retrieve frame rate.")
        return

    frame_interval = int(frame_rate * interval)
    frame_count = 0
    capture_count = 0

    with open('headcount_data.csv', mode='w+', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['FrameNumber', 'Headcount'])

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % frame_interval == 0:
                capture_count += 1
                frame_with_faces = detect_faces_in_frame(frame, mtcnn, face_model, capture_count)
                headcount = detect_people_in_frame(frame, yolo_net, output_layers)

                writer.writerow([capture_count, headcount])
                file.flush()
                print(f'Processed and saved detected faces for frame {capture_count}.')

            frame_count += 1
            time.sleep(1 / frame_rate)

    cap.release()
    cv2.destroyAllWindows()

# Step 4: Load the FaceNet and embedding model
def load_face_detection_model():
    mtcnn = MTCNN(keep_all=True)  # MTCNN face detector
    face_model = InceptionResnetV1(pretrained='vggface2').eval()  # Load pretrained FaceNet model
    return mtcnn, face_model

def image_to_base64(image):
    _, buffer = cv2.imencode('.jpg', image)
    image_base64 = base64.b64encode(buffer).decode('utf-8')
    return image_base64

def similarity_query_api(img_base_64,embedding):
    url = "http://localhost:5000/api/similarity_query_api"
    headers = {'Content-Type':'application/json'}
    data = {"file": img_base_64,"embedding":embedding}
    response = requests.post(url,headers=headers,json=data)
    return response.json()

def upload_to_collection_api(img_base_64,face_embedding,collection_type):
    url = f"http://localhost:5000/api/upload_to_{collection_type}"
    headers = {'Content-Type':'application/json'}
    data = {"file": img_base_64, "embedding": face_embedding}
    response = requests.post(url,headers=headers,json=data)
    return response.status_code==200


def detect_faces_in_frame(frame, mtcnn, face_model, frame_index):
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    boxes, _ = mtcnn.detect(frame_rgb)

    if boxes is not None:
        for i, box in enumerate(boxes):
            startX, startY, endX, endY = box.astype(int)
            face = frame[startY:endY, startX:endX]
            face_filename = f"detected_faces/frame_{frame_index}_face_{i + 1}.jpg"
            try:
                cv2.imwrite(face_filename, face)
            except Exception as e:
                continue
            
            print(f"Saved detected face to {face_filename}")

            # Calculate the embedding
            face_rgb = cv2.resize(face, (160, 160))
            face_tensor = torch.from_numpy(face_rgb).permute(2, 0, 1).float().unsqueeze(0)
            face_embedding = face_model(face_tensor)
            print(face_filename," embedding = ",face_embedding[0].tolist())
            embedding = face_embedding[0].tolist()
            img_base_64 = image_to_base64(face)
            similarity_result = similarity_query_api(img_base_64,embedding)
            is_match = similarity_result.get("is_matched",False)
            collection_type = "Matched" if is_match else "unMatched"
            if collection_type=="unMatched":
                uploaded = upload_to_collection_api(img_base_64,embedding,collection_type)
                if uploaded:
                    print("Succesfully uploaded")
                else:
                    print("Uploading failed")
        



            # Save the embedding as a .npy file
            # embedding_filename = f"detected_faces/frame_{frame_index}_face_{i + 1}_embedding.npy"
            # np.save(embedding_filename, face_embedding.detach().numpy())
            # print(f"Saved embedding to {embedding_filename}")


            # call query
            # push into collection wala api
            
            cv2.rectangle(frame, (startX, startY), (endX, endY), (0, 255, 0), 2)

    return frame

# Execution
youtube_url = 'https://www.youtube.com/watch?v=dN64IzvC8FI'
stream_url = get_youtube_video_url(youtube_url)
print("Stream URL:", stream_url)

# Load models
mtcnn, face_model = load_face_detection_model()
yolo_net, output_layers = load_yolo_model()

# Capture frames and detect faces
capture_and_detect_faces(stream_url, mtcnn, face_model, yolo_net, output_layers, interval=3)
