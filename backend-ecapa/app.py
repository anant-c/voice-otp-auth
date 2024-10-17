from flask import Flask, render_template, request, redirect, url_for, jsonify
import os
from backend import enroll_user, authenticate_user

app = Flask(__name__)

# Ensure temp folder exists for uploaded files
if not os.path.exists('temp'):
    os.makedirs('temp')


# Route for the home page
@app.route('/')
def home():
    return render_template('home.html')


# Route for user enrollment
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        user_id = request.form['user_id']
        audio_files = request.files.getlist('audio_samples')

        temp_files = []
        for file in audio_files:
            temp_path = os.path.join('temp', file.filename)
            file.save(temp_path)
            temp_files.append(temp_path)

        success, message = enroll_user(user_id, temp_files)

        # Remove temporary files
        for temp_file in temp_files:
            os.remove(temp_file)

        return jsonify({"success": success, "message": message})

    return render_template('signup.html')


# Route for user authentication
@app.route('/authenticate', methods=['GET', 'POST'])
def verification():
    if request.method == 'POST':
        user_id = request.form['user_id']
        audio_file = request.files['audio_sample']

        temp_path = os.path.join('temp', audio_file.filename)
        audio_file.save(temp_path)

        success, message = authenticate_user(user_id, temp_path)

        # Remove temporary file
        os.remove(temp_path)

        return jsonify({"success": success, "message": message})

    return render_template('verification.html')


if __name__ == '__main__':
    app.run(debug=True)
