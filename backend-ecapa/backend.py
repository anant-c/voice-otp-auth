import os
import numpy as np
from scipy.spatial.distance import cosine
import nemo.collections.asr as nemo_asr
import pickle

# Path to store the user embeddings
EMBEDDINGS_DB = 'embeddings_db.pkl'

# Load ECAPA-TDNN model for speaker embedding extraction
ECAPA_TDNN = nemo_asr.models.EncDecSpeakerLabelModel.from_pretrained(model_name='ecapa_tdnn')

# Load embeddings from the database (pickle file)
def load_embeddings_db():
    if os.path.exists(EMBEDDINGS_DB):
        with open(EMBEDDINGS_DB, 'rb') as f:
            return pickle.load(f)
    return {}

# Save embeddings to the database (pickle file)
def save_embeddings_db(embeddings_db):
    with open(EMBEDDINGS_DB, 'wb') as f:
        pickle.dump(embeddings_db, f)

# Extract speaker embedding from the input audio file
def extract_embedding(input_file):
    embs = ECAPA_TDNN.get_embedding(input_file)
    embedding = embs.detach().cpu().numpy()
    return embedding

# Function to enroll a user by storing their voice embeddings
def enroll_user(user_id, input_files):
    embeddings_db = load_embeddings_db()
    
    if user_id in embeddings_db:
        return False, "User already enrolled!"

    embeddings = []
    for file_path in input_files:
        embedding = extract_embedding(file_path)
        embeddings.append(embedding)

    # Store the average embedding for the user
    avg_embedding = np.mean(embeddings, axis=0)
    embeddings_db[user_id] = avg_embedding

    # Save updated embeddings to database
    save_embeddings_db(embeddings_db)
    
    return True, "User enrolled successfully!"

# Function to authenticate a user based on voice sample
def authenticate_user(user_id, input_file):
    embeddings_db = load_embeddings_db()
    
    if user_id not in embeddings_db:
        return False, "User not found!"

    # Get stored embedding for the user
    stored_embedding = embeddings_db[user_id]

    # Extract embedding from the input audio file for verification
    verification_embedding = extract_embedding(input_file)

    # Compute cosine similarity between stored embedding and new embedding
    similarity = 1 - cosine(stored_embedding, verification_embedding)
    threshold = 0.7  # Adjust threshold for similarity matching

    if similarity > threshold:
        return True, f"Authentication successful! Similarity: {similarity:.2f}"
    else:
        return False, f"Authentication failed! Similarity: {similarity:.2f}"

