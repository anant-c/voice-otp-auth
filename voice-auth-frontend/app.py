# app.py
from flask import Flask, request
from pymongo import MongoClient
import librosa
import numpy as np
import os
import soundfile as sf
import subprocess



app = Flask(__name__)


# MongoDB connection
client = MongoClient('mongodb+srv://admin:abcd@cluster0.eparkx1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

db = client['audio_database_test']  # Replace with your database name
print("Connected to DB.....")
collection = db['audio_features']  # Replace with your collection name

@app.route('/upload_audio', methods=['GET','POST'])
def upload_audio():
    if 'audioFile' not in request.files:
        print("No audio file found in the request")
        return {
            "status":"false"
        }

    audio_file = request.files['audioFile']
    file_path = os.path.join("uploads", audio_file.filename)
    audio_file.save(file_path)

    print("Audio file saved successfully.")

    # Process the audio file
    processed_audio = process_audio(file_path)

    print(processed_audio)
    # Save to MongoDB
    save_to_database(processed_audio)

    return {
            "status":"false"
        }

@app.route('/test', methods= ['GET'])
def test():
    return {
        "message":"working"
    }



import subprocess

def process_audio(file_path):
    print("Starting audio processing...")

    # Define paths
    output_path = "uploads/output_audio.wav"

    # Run ffmpeg to resample the audio to 16kHz and convert it to mono
    try:
        print("Running ffmpeg to convert audio...")
        subprocess.run([
            'ffmpeg', '-i', file_path, '-ar', '16000', '-ac', '1', output_path
        ], check=True)
        print("ffmpeg audio conversion successful.")

        # Get speaker embedding using NeMo model
        print("Extracting embedding using NeMo model...")
        embeddings = speaker_model.get_embedding(output_path)  # Ensure output_path is in a compatible format for NeMo
        embedding_array = embeddings.cpu().numpy()
        embedding_list = embedding_array.tolist()

        print("Embedding extraction successful.")
        return embedding_list

    except subprocess.CalledProcessError as e:
        print(f"ffmpeg processing failed: {e}")
        return None
    except Exception as e:
        print(f"Error during audio processing: {e}")
        return None




def save_to_database(features):
    print("DB insertion ...")
    result = collection.insert_one({'features': features})
    print(f'Document inserted with id: {result.inserted_id}')

if __name__ == '__main__':
    os.makedirs('uploads', exist_ok=True)
    app.run(port=port)
