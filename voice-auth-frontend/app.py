# app.py
from flask import Flask, request, jsonify
from pymongo import MongoClient
import librosa
import numpy as np
import os
import subprocess

app = Flask(__name__)

# MongoDB connection
client = MongoClient('mongodb+srv://admin:abcd@cluster0.eparkx1.mongodb.net/?retryWrites=true&w=majority')
db = client['audio_database_test']
collection = db['audio_features']

@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    user_id = request.form.get('userId')
    prompt = request.form.get('prompt')
    audio_files = [request.files[f'audioFile{i}'] for i in range(10)]  # Expecting 10 files

    if not user_id or not prompt or not all(audio_files):
        return jsonify({"status": "false", "message": "Missing user ID, prompt, or audio files"}), 400

    embeddings = []
    index = 0
    for audio_file in audio_files:
        audio_file_path = os.path.join("uploads", audio_file.filename)
        audio_file.save(audio_file_path)
        
        embedding = process_audio(audio_file_path,index,user_id)
        index = index+1
        if embedding:
            embeddings.append(embedding)

        # os.remove(audio_file_path)

    # Store in MongoDB
    result = collection.insert_one({
        'userId': user_id,
        'prompt': prompt,
        'audio_embeddings': embeddings
    })
    
    return jsonify({"status": "success", "message": "Audio processed and saved", "id": str(result.inserted_id)})

def process_audio(file_path,index,user_id):
    output_path = "uploads/" + user_id
    
    subprocess.run(['ffmpeg', '-i', file_path, '-ar', '16000', '-ac', '1', output_path + str(index) +".wav"], check=True)
    print("ffmpeg audio conversion successful.")

    # Get speaker embedding using NeMo model
    print("Extracting embedding using NeMo model...")
    embeddings = speaker_model.get_embedding(output_path)  # Ensure output_path is in a compatible format for NeMo
    embedding_array = embeddings if isinstance(embeddings, np.ndarray) else embeddings.numpy()
    embedding_list = embedding_array.tolist()


    print("Embedding extraction successful.")
    return embedding_list


if __name__ == '__main__':
    os.makedirs('uploads', exist_ok=True)
    app.run(port=5000)
