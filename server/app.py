import signal
import threading
import time
from flask import Flask,request, send_from_directory
import uuid
import os
import subprocess
import signal
import sys
app = Flask(__name__)




def signal_handler(sig, frame):
    print('Killing all spawned FFMPEG processes...')
    for task in storage:
        print(task)
        os.kill(task["processID"], signal.SIGTERM)
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

MediaFolder = "media"

# # Fake Storage Cache
storage = []

baseVideo = "rtsp://rtspstream:7df2f693b79f11c694c49cb7487a2580@zephyr.rtsp.stream/movie"
baseFolder = "vid"
ffmpeg_process_pid = 0


@app.post("/api/v1/job")
def create_job():
    if "url" not in request.json:
        return {"message": "URL not provided"}, 400

    rtsp_url = request.json["url"]
    job_id = uuid.uuid4()
    folder_path = os.path.join(MediaFolder, str(job_id))

    try:
        os.makedirs(folder_path)
    except OSError:
        return {"message": "Could not create directory"}, 500

    command = ["ffmpeg", "-fflags","flush_packets","-max_delay","1","-flags","-global_header","-rtsp_transport","tcp","-i",rtsp_url,"-hls_time","5","-hls_list_size","3","-vcodec","copy","-y", os.path.join(folder_path,"index.m3u8")]
    try:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except OSError:
        return {"message": "Could not start ffmpeg process"}, 500
    time.sleep(1)  
    print(process.pid)
    Task = {"job_id": str(job_id), "processID": process.pid}
    storage.append(Task)

    return {"message": "Job created successfully", "job_id": str(job_id)}
@app.get("/api/v1/job/<job_id>")
def get_status(job_id):
    # we create 
    folderPath = os.path.join(MediaFolder, job_id)
    filpath = os.path.join(folderPath, "index.m3u8")
    if os.path.exists(filpath):
        return {"status": "running"}
    return {"status": "processing"}

@app.get("/api/v1/stream/<job_id>/<path:path>")
def send_stream(job_id, path):
    folderPath = os.path.join(MediaFolder, job_id)
    filpath = os.path.join(folderPath, path)
    if os.path.exists(filpath):
        return send_from_directory(folderPath, path)
    return {"message": "File not found"}, 404

def startup_ffmpeg():
    global ffmpeg_process_pid

    if not os.path.exists(os.path.join("static", baseFolder)):
        os.makedirs(os.path.join("static", baseFolder))

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
startup_ffmpeg()

        

    



