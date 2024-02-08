import datetime
import json
import signal
import threading
import time
import bcrypt
from flask import Flask, jsonify, request, send_from_directory, session
import uuid
import os
import subprocess
import signal
import sys
from flask_session import Session
from flask_cors import CORS
from pymongo import MongoClient
from flasgger import Swagger

app = Flask(__name__)
Swagger(app)

# Configuration
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.secret_key = os.urandom(24)
Session(app)
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True
CORS(app, origins="*", headers=['Content-Type'], expose_headers=['Access-Control-Allow-Origin'], supports_credentials=True)

# MongoDB Configuration
client = MongoClient("mongodb://localhost:27017/")
db = client["peach"]
collection = db["userData"]

# Media folder
MediaFolder = "media"

# Base video and folder for processing
baseVideo = "rtsp://rtspstream:7df2f693b79f11c694c49cb7487a2580@zephyr.rtsp.stream/movie"
baseFolder = "vid"
ffmpeg_process_pid = 0

# Login endpoint
@app.post("/api/v1/login")
def login():
    """
    User login endpoint.
    ---
    parameters:
      - name: email
        in: formData
        type: string
        required: true
        description: User's email address
      - name: password
        in: formData
        type: string
        required: true
        description: User's password
    responses:
      200:
        description: User logged in successfully
      404:
        description: User not found
    """
    data_obj = request.json
    user = collection.find_one({"email": data_obj["email"]})
    if not user:
        return {"message": "User not found"}, 404
    if bcrypt.checkpw(data_obj["password"].encode('utf-8'), user.get("password")):
        session["user_id"] = user.get("email")
        return {"message": "User logged in successfully", "imgData": user.get("profilePic"), "name": user.get("name")}
    return {"message": "User not found"}, 404

# Create job endpoint
@app.post("/api/v1/job")
def create_job():
    """
    Create a job for processing.
    ---
    parameters:
      - name: url
        in: formData
        type: string
        required: true
        description: RTSP URL for the video stream
    responses:
      200:
        description: Job created successfully
    """
    user_id = session.get("user_id")
    if not user_id:
        return {"message": "User not logged in"}, 401
    data_obj = request.json
    if "url" not in request.json:
        return {"message": "URL not provided"}, 400
    
    rtsp_url = request.json["url"]
    job_id = uuid.uuid4()
    collection.update_one({"email": user_id}, {"$push": {"user_data": {
        "id": str(job_id),
        "videourl": rtsp_url,
        "overlayData": [],
        "createdAt": datetime.datetime.now(tz=datetime.timezone.utc).isoformat(),
    }}})
    folder_path = os.path.join(MediaFolder, str(job_id))

    try:
        os.makedirs(folder_path)
    except OSError:
        return {"message": "Could not create directory"}, 500

    command = [
        "ffmpeg",
        "-rtsp_transport", "tcp",
        "-i", rtsp_url,
        "-c:v", "copy",
        "-c:a", "copy",
        "-f", "hls",
        os.path.join(folder_path, "index.m3u8")
    ]
    try:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except OSError:
        return {"message": "Could not start ffmpeg process"}, 500
    time.sleep(1)  
    Task = {"job_id": str(job_id), "processID": process.pid}
    return {"message": "Job created successfully", "job_id": str(job_id)}

# Get status of a job
@app.get("/api/v1/job/<job_id>")
def get_status(job_id):
    """
    Get the status of a job.
    ---
    parameters:
      - name: job_id
        in: path
        type: string
        required: true
        description: ID of the job
    responses:
      200:
        description: Status of the job
    """
    folderPath = os.path.join(MediaFolder, job_id)
    filpath = os.path.join(folderPath, "index.m3u8")
    if os.path.exists(filpath):
        return {"status": "running"}
    return {"status": "processing"}

# Get data of a job
@app.get("/api/v1/job/<job_id>/data")
def get_data(job_id):
    """
    Get data of a job.
    ---
    parameters:
      - name: job_id
        in: path
        type: string
        required: true
        description: ID of the job
    responses:
      200:
        description: Data of the job
      404:
        description: Job not found
    """
    data = collection.find_one({"user_data.id": job_id}, {"user_data.$": 1})
    if not data:
        return {"message": "Job not found"}, 404
    return data["user_data"][0]

# Get all videos
@app.get("/api/v1/videos")
def get_all_video():
    """
    Get all videos.
    ---
    responses:
      200:
        description: List of all videos
    """
    data = list(collection.find({}, {"user_data": 1,"name":1,"profilePic":1}))
    return json.dumps(data, default=str)



# Get all jobs of a user
@app.get("/api/v1/jobs")
def get_jobs():
    """
    Get all jobs of a user.
    ---
    responses:
      200:
        description: List of all jobs of the user
      401:
        description: User not logged in
    """
    user_id = session.get("user_id")
    if not user_id:
        return {"message": "User not logged in"}, 401
    data = collection.find_one({"email": user_id}, {"user_data": 1})
    return data["user_data"]

# Add or update overlay data for a job
@app.post("/api/v1/job/<job_id>/data")
def add_update_overlay(job_id):
    """
    Add or update overlay data for a job.
    ---
    parameters:
      - name: job_id
        in: path
        type: string
        required: true
        description: ID of the job
      - name: overlayData
        in: body
        type: 
        required: true
        description: Overlay data to be added or updated
    responses:
      200:
        description: Overlay data updated successfully
      401:
        description: User not logged in
    """
    data = request.json
    user_id = session.get("user_id")
    OverlayData = data["overlayData"]
    if not user_id:
        return {"message": "User not logged in"}, 401
    collection.update_one({"user_data.id": job_id}, {"$set": {"user_data.$.overlayData": OverlayData}})
    return {"message": "Overlay data updated successfully"}

# Stream endpoint
@app.get("/api/v1/stream/<job_id>/<path:path>")
def send_stream(job_id, path):
    """
    Stream endpoint.
    ---
    parameters:
      - name: job_id
        in: path
        type: string
        required: true
        description: ID of the job
      - name: path
        in: path
        type: string
        required: true
        description: Path to the file
    responses:
      200:
        description: File stream
      404:
        description: File not found
    """
    folderPath = os.path.join(MediaFolder, job_id)
    filpath = os.path.join(folderPath, path)
    if os.path.exists(filpath):
        return send_from_directory(folderPath, path)
    return {"message": "File not found"}, 404

# Signup endpoint
@app.post("/api/v1/signup")
def signup():
    """
    User signup endpoint.
    ---
    parameters:
      - name: email
        in: formData
        type: string
        required: true
        description: User's email address
      - name: password
        in: formData
        type: string
        required: true
        description: User's password
      - name: name
        in: formData
        type: string
        required: true
        description: User's name
      - name: profilePic
        in: formData
        type: string
        required: true
        description: URL to user's profile picture
    responses:
      200:
        description: User created successfully
      400:
        description: User already exists
      500:
        description: User not created
    """
    data_obj = request.json
    SignUpData = {
        "email": data_obj["email"],
        "password": bcrypt.hashpw(data_obj["password"].encode('utf-8'), bcrypt.gensalt()),
        "name": data_obj["name"],
        "profilePic": data_obj["profilePic"],
        "createdAt": datetime.datetime.now(tz=datetime.timezone.utc),
        "user_data": []
    }
    finder = collection.find_one({"email": data_obj["email"]})
    if finder:
        return {"message": "User already exists"}, 400
    insertedValue = collection.insert_one(SignUpData)
    if not insertedValue:
        return {"message": "User not created"}, 500
    return {"message": "User created successfully"}

# Logout endpoint
@app.get("/api/v1/logout")
def logout():
    """
    User logout endpoint.
    ---
    responses:
      200:
        description: User logged out successfully
    """
    session.pop("user_id", None)
    return {"message": "User logged out successfully"}

# Ready endpoint
@app.get("/api/v1/ready")
def ready():
    """
    Check if the system is ready.
    ---
    responses:
      200:
        description: System status
    """
    if os.path.exists(os.path.join("static", baseFolder, "index.m3u8")):
        return {"status": "ready"}
    else:
        return {"status": "processing"}

# Function to start static home video
def startup_ffmpeg():
    global ffmpeg_process_pid

    if not os.path.exists(os.path.join("static", baseFolder)):
        os.makedirs(os.path.join("static", baseFolder))
    else:
        for file in os.listdir(os.path.join("static", baseFolder)):
            os.remove(os.path.join("static", baseFolder, file))

    command = [
        "ffmpeg",
        "-rtsp_transport", "tcp",
        "-i", baseVideo,
        "-c:v", "copy",
        "-c:a", "copy",
        "-f", "hls",
        os.path.join("static", baseFolder, "index.m3u8")
    ]

      




    if ffmpeg_process_pid != 0:
        try:
            os.kill(ffmpeg_process_pid, signal.SIGTERM)
            print("Terminated previous ffmpeg process with PID:", ffmpeg_process_pid)
        except OSError:
            pass

    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(1)
    print("New ffmpeg process started with PID:", process.pid)
    ffmpeg_process_pid = process.pid
startup_ffmpeg()