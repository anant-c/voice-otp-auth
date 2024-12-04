# app.py
from flask import Flask, request, jsonify
from pymongo import MongoClient
import librosa
import numpy as np
import os
import subprocess
import nemo.collections.asr as nemo_asr
from scipy.spatial.distance import cosine


app = Flask(__name__)

# MongoDB connection
client = MongoClient('mongodb+srv://admin:abcd@cluster0.eparkx1.mongodb.net/?retryWrites=true&w=majority')
db = client['audio_database_test']
collection = db['audio_features']
speaker_model = nemo_asr.models.EncDecSpeakerLabelModel.from_pretrained(model_name='ecapa_tdnn')


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
        audio_file_path = os.path.join("uploads", user_id + "_db_" +audio_file.filename)
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
    output_path = "uploads/" + user_id +"_" + str(index) + ".wav"
    
    subprocess.run(['ffmpeg', '-i', file_path, '-ar', '16000', '-ac', '1', output_path ], check=True)
    print("ffmpeg audio conversion successful.")

    # # Get speaker embedding using NeMo model
    # print("Extracting embedding using NeMo model...")
    # embeddings = speaker_model.get_embedding(output_path)  # Ensure output_path is in a compatible format for NeMo
    # embedding_array = embeddings if isinstance(embeddings, np.ndarray) else embeddings.numpy()
    # embedding_list = embedding_array.tolist()

    
    print("Embedding extraction successful.")
    return output_path
@app.route('/authenticate', methods=['POST'])
def authenticate_user():
    user_id = request.form.get('user_id')
    prompt = request.form.get('prompt')
    audio_sample = request.files.get('audio_sample')

    if not user_id or not prompt or not audio_sample:
        return jsonify({"status": "false", "message": "Missing user ID, prompt, or audio sample"}), 400

    # Check if user exists
    user_data = collection.find_one({'userId': user_id})
    if not user_data:
        return jsonify({"status": "false", "message": "User ID not found"}), 404

    # Save audio sample and process
    audio_sample_path = os.path.join("uploads", "temp_" + audio_sample.filename)
    audio_sample.save(audio_sample_path)

    # Convert the uploaded audio sample to required format (16kHz, mono)
    processed_sample_path = "uploads/" + "auth_" + user_id + "_" + audio_sample.filename
    subprocess.run(['ffmpeg', '-i', audio_sample_path, '-ar', '16000', '-ac', '1', processed_sample_path], check=True)

    # Get the decision (True or False) for each stored audio file against the new audio sample
    decisions = []
    stored_audio_files = user_data['audio_embeddings']

    for stored_file_path in stored_audio_files:
        try:
            # Verify speakers using NeMo speaker verification model
            decision = speaker_model.verify_speakers(processed_sample_path, stored_file_path)
            decisions.append(1 if decision else 0)  # Convert True/False to 1/0
        except Exception as e:
            print(f"Error verifying speakers: {e}")
            return jsonify({"status": "false", "message": "Error during speaker verification"}), 500

    # Cleanup the uploaded temp file
    os.remove(audio_sample_path)

    # Compute the average decision
    avg_decision = sum(decisions) / len(decisions)

    # Decide authentication based on threshold
    threshold = 0.5  # Threshold for average decision (this can be adjusted based on model performance)
    if avg_decision >= threshold:  # Average decision above threshold means authentication success
        return jsonify({
            "status": "success",
            "message": "Authentication successful",
            "avg_decision": avg_decision
        })
    else:
        return jsonify({
            "status": "false",
            "message": "Authentication failed",
            "avg_decision": avg_decision
        })

if __name__ == '__main__':
    os.makedirs('uploads', exist_ok=True)
    app.run(port=5000)