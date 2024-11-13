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
import socket
import threading
import websockets
import asyncio
from queue import Queue
import re

message_queue = Queue()

# Create a directory to store detected faces
os.makedirs("detected_faces", exist_ok=True)

async def connect_to_server():
    uri = "ws://localhost:5000"
    async with websockets.connect(uri) as websocket:
        print("Connected to the WebSocket server")

        # Start listening for messages from the server in a separate task
        # asyncio.create_task(listen_for_messages(websocket))

        # Continuously check for messages to send
        await handle_outgoing_messages(websocket)


async def handle_outgoing_messages(websocket):
    while True:
        if not message_queue.empty():
            # Retrieve the next message from the queue and send it
            message = message_queue.get()
            await websocket.send(message)
            # print(f"Sent: {message}")
        
        # Sleep briefly to prevent busy-waiting
        await asyncio.sleep(0.1)


def receive_messages(sock):
    while True:
        try:
            data = sock.recv(1024)
            if data:
                print("Broadcast received:", data.decode())
            else:
                break
        except Exception as e:
            print("Error:", e)
            break


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



    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            capture_count += 1
            known_headcount = detect_faces_in_frame(frame, mtcnn, face_model, capture_count)
            headcount = detect_people_in_frame(frame, yolo_net, output_layers)
            # timestamp= extract_timestamp_from_image(frame)
            # data = json.dumps([capture_count, headcount,timestamp]).encode('utf-8')
            data = json.dumps([capture_count, headcount,known_headcount]).encode('utf-8')
            write(data)
            upload_people_count_api(capture_count,headcount,known_headcount)
            # writer.writerow([capture_count, headcount])
            # file.flush()
            # print(f'Processed and saved detected faces for frame {capture_count}.')

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

def upload_people_count_api(frame_no,count,known):
    # url="https://cctv-face-recognition-apis.onrender.com/api/uploadChartData"
    url="http://localhost:5000/api/uploadChartData"
    headers = {'Content-Type':'application/json'}
    data={"frame_no":frame_no,"count":count,"known_headcount":known}
    response=requests.post(url,headers=headers,json=data)
    return response.json()

def similarity_query_api(img_base_64,embedding):
    url = "http://localhost:5000/api/similarity_query_api"
    headers = {'Content-Type':'application/json'}
    # print("file = ",img_base_64," embeddings =  ",embedding)
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
    count_known=0
    if boxes is not None:
        for i, box in enumerate(boxes):
            startX, startY, endX, endY = box.astype(int)
            face = frame[startY:endY, startX:endX]
            size=((startX-endX)*(startY-endY))
            if(size<1000):
                continue
            face_filename = f"detected_faces/frame_{frame_index}_face_{i + 1}.jpg"
            # try:
            #     cv2.imwrite(face_filename, face)
            # except Exception as e:
            #     continue;
            
            # print(f"Saved detected face to {face_filename}")

            # Calculate the embedding
            face_rgb = cv2.resize(face, (160, 160))
            face_tensor = torch.from_numpy(face_rgb).permute(2, 0, 1).float().unsqueeze(0)
            face_embedding = face_model(face_tensor)
            # print(face_filename," embedding = ",face_embedding[0].tolist())
            embedding = face_embedding[0].tolist()
            img_base_64 = image_to_base64(face)
            similarity_result = similarity_query_api(img_base_64,embedding)
            is_match = similarity_result.get("is_matched",False)
            collection_type = "Matched" if is_match else "unMatched"
            if collection_type=="unMatched":
                uploaded = upload_to_collection_api(img_base_64,embedding,collection_type)
                # if uploaded:
                #     print("Succesfully uploaded")
                # else:
                #     print("Uploading failed")
            else:
                count_known+=1
        



            # Save the embedding as a .npy file
            
            # embedding_filename = f"detected_faces/frame_{frame_index}_face_{i + 1}_embedding.npy"
            # np.save(embedding_filename, face_embedding.detach().numpy())
            # print(f"Saved embedding to {embedding_filename}")

            cv2.rectangle(frame, (startX, startY), (endX, endY), (0, 255, 0), 2)

    return count_known


def start_websocket_client():
    # Run the event loop for the WebSocket client in this thread
    asyncio.run(connect_to_server())

def write(message):
    message_queue.put(message)

# Execution
response = requests.delete("https://cctv-face-recognition-apis.onrender.com/api/deleteChartData")
# print(response)
# client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# client_socket.connect(('127.0.0.1', 65432))
# asyncio.run(connect_to_server())
# asyncio.create_task(connect_to_server())
websocket_thread = threading.Thread(target=start_websocket_client)
websocket_thread.start()

# thread = threading.Thread(target=receive_messages, args=(client_socket,))
# thread.start()
youtube_url = 'https://www.youtube.com/watch?v=vAZcPhMACeo'
# youtube_url='https://www.youtube.com/watch?v=tcUSoJMU2AQ'
# youtube_url="https://www.youtube.com/watch?v=9LyZGu_Lrg8"
stream_url = get_youtube_video_url(youtube_url)
# print("Stream URL:", stream_url)
match = re.search(r'[?&]t=(\d+)s?', youtube_url)
# print("Time = ",match)

# Load models
mtcnn, face_model = load_face_detection_model()
yolo_net, output_layers = load_yolo_model()

# Capture frames and detect faces
capture_and_detect_faces(stream_url, mtcnn, face_model, yolo_net, output_layers, interval=3)
