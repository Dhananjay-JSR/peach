import datetime
import signal
import threading
import time
import bcrypt
from flask import Flask, request, send_from_directory, session
import uuid
import os
import subprocess
import signal
import sys
from flask_session import Session
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.server_api import ServerApi

app = Flask(__name__)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.secret_key = os.urandom(24)
Session(app)
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True
CORS(app,origins="*", headers=['Content-Type'], expose_headers=['Access-Control-Allow-Origin'], supports_credentials=True)



MONGO_URL="mongodb+srv://dhananjay:j1WuQHddtxF4rQbr@cluster0.ayaywaj.mongodb.net/?retryWrites=true&w=majority"


# userData
#  {
#       type: "text" | "sticker";
#       content: string | undefined;
#       id: string;
#       position: { x: number; y: number };
#     }[]
# client = MongoClient(MONGO_URL, server_api=ServerApi('1'))
client = MongoClient("localhost", 27017)
db = client["peach"]
collection = db["userData"]

try:
    client.admin.command('ping')
    print("DB Connected Successfully!")
except Exception as e:
    print(e)
    print("DB Connection Failed!")
    sys.exit(1)
# print(client.list_database_names())



# def signal_handler(sig, frame):
#     print('Killing all spawned FFMPEG processes...')
#     for task in storage:
#         print(task)
#         os.kill(task["processID"], signal.SIGTERM)
#     sys.exit(0)

# signal.signal(signal.SIGINT, signal_handler)

MediaFolder = "media"

storage = []

# baseVideo = "rtsp://rtspstream:7df2f693b79f11c694c49cb7487a2580@zephyr.rtsp.stream/movie"
baseVideo = "rtsp://localhost:8554/live/1"
baseFolder = "vid"
ffmpeg_process_pid = 0


@app.post("/api/v1/login")
def login():
    data_obj = request.json
    user = collection.find_one({"email": data_obj["email"]})
    if not user:
        return {"message": "User not found"}, 404
    if bcrypt.checkpw(data_obj["password"].encode('utf-8'), user.get("password")):
        session["user_id"] = user.get("email")
        print("User logged in. Session:", session)
        return {"message": "User logged in successfully","imgData" : user.get("profilePic") , "name": user.get("name")}
    return {"message": "User not found"}, 404


@app.post("/api/v1/job")
def create_job():
    user_id = session.get("user_id")
    if not user_id:
        return {"message": "User not logged in"}, 401
    data_obj = request.json
    print(data_obj)

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
    # command = ["ffmpeg", "-fflags","flush_packets","-max_delay","1","-flags","-global_header","-rtsp_transport","tcp","-i",rtsp_url,"-hls_time","5","-hls_list_size","3","-vcodec","copy","-y", os.path.join(folder_path,"index.m3u8")]
    try:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except OSError:
        return {"message": "Could not start ffmpeg process"}, 500
    time.sleep(1)  
    print(process.pid)
    Task = {"job_id": str(job_id), "processID": process.pid}
    return {"message": "Job created successfully", "job_id": str(job_id)}
@app.get("/api/v1/job/<job_id>")
def get_status(job_id):
    # we create 
    folderPath = os.path.join(MediaFolder, job_id)
    filpath = os.path.join(folderPath, "index.m3u8")
    if os.path.exists(filpath):
        return {"status": "running"}
    return {"status": "processing"}

@app.get("/api/v1/job/<job_id>/data")
def get_data(job_id):
    data = collection.find_one({"user_data.id": job_id}, {"user_data.$": 1})
    if not data:
        return {"message": "Job not found"}, 404
    return data["user_data"][0]

@app.get("/api/v1/videos")
def get_all_video():
    data = collection.find({}, {"user_data": 1,"name":1,"profilePic":1})
    return data

@app.get("/api/v1/jobs")
def get_jobs():
    user_id = session.get("user_id")
    if not user_id:
        return {"message": "User not logged in"}, 401
    data = collection.find_one({"email": user_id}, {"user_data": 1})
    return data["user_data"]

@app.post("/api/v1/job/<job_id>/data")
def add_update_overlay(job_id):
    data = request.json
    user_id = session.get("user_id")
    OverlayData = data["overlayData"]
    if not user_id:
        return {"message": "User not logged in"}, 401
    collection.update_one({"user_data.id": job_id}, {"$set": {"user_data.$.overlayData": OverlayData}})
    return {"message": "Overlay data updated successfully"}

@app.get("/api/v1/stream/<job_id>/<path:path>")
def send_stream(job_id, path):
    folderPath = os.path.join(MediaFolder, job_id)
    filpath = os.path.join(folderPath, path)
    if os.path.exists(filpath):
        return send_from_directory(folderPath, path)
    return {"message": "File not found"}, 404

@app.post("/api/v1/signup")
def signup():
    data_obj = request.json
    # print(data_obj)
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

@app.get("/api/v1/logout")
def logout():
    session.pop("user_id", None)
    return {"message": "User logged out successfully"}

@app.get("/api/v1/ready")
def ready():
    if os.path.exists(os.path.join("static", baseFolder, "index.m3u8")):
        return {"status": "ready"}
    else :
        return {"status": "processing"}

def startup_ffmpeg():
    global ffmpeg_process_pid

    if not os.path.exists(os.path.join("static", baseFolder)):
        os.makedirs(os.path.join("static", baseFolder))
    else:
        for file in os.listdir(os.path.join("static", baseFolder)):
            os.remove(os.path.join("static", baseFolder, file))

    command = [
        "ffmpeg", "-fflags", "flush_packets", "-max_delay", "1", "-flags", "-global_header",
        "-rtsp_transport", "tcp", "-i", baseVideo, "-hls_time", "5", "-hls_list_size", "3",
        "-vcodec", "copy", "-y", os.path.join("static", baseFolder, "index.m3u8")
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
# startup_ffmpeg()



    



