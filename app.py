import os
import boto3
from flask import Flask, redirect, render_template, request, jsonify
from flask_cors import CORS
from mongoClient import (
    get_all_website_info,
    get_websites_by_category,
    get_websites_by_location,
    check_duplicate_website,
    collection, credentials_collection
)
from main import scrape_and_store
import tkinter as tk
from werkzeug.utils import secure_filename



# from bson import json_util
from bson.objectid import ObjectId

app = Flask(__name__)
print("Start: app")
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow only this origin
# cors = CORS(app)

# AWS S# Configuration
# AWS_ACCESS_KEY = ""
# AWS_SECRET_KEY = ""
# AWS_BUCKET_NAME = ""
# AWS_REGION = ""

# S3 Initialize client
# s3_client = boto3.client(
#     "s3",
#     AWS_ACCESS_KEY_ID = AWS_ACCESS_KEY,
#     AWS_SECRET_ACCESS_KEY = AWS_SECRET_KEY,
#     region_name = AWS_REGION,
# )



@app.route("/business")
def home():
    print("Start: Get Businesses")
    # Get all businesses for the listing
    businesses = get_all_website_info(request)
    print("Finish: Get Businesses", businesses)
    return businesses
    # return render_template('index.html', businesses=businesses)


@app.route("/business", methods=["POST"])
def scrape_website():
    try:
        # TODO: PASS NAME AND URL IN THE BODY PARAMS
        url = request.form.get("url")
        listed_by = request.form.get("listed_by")
        print("listed by in app.py LINE 21: ", listed_by)
        if not url:
            return jsonify({"error": "URL is required"}), 400

        # Check for duplicate before scraping
        if check_duplicate_website(url):
            return jsonify({"error": "This business is already registered"}), 400

        # TODO: PASS THE BODY TO THE SCRAPE AND STORE THE NAME WITH THE URL
        success = scrape_and_store(url, listed_by)
        print("successfully scrape!", success)
        if success:
            return jsonify({"message": "Business registered successfully"})
        return jsonify({"error": "Failed to register business"}), 500

    except Exception as e:
        print(f"Error in scrape_website route: {e}")
        return jsonify({"error": str(e)}), 500

# View Details
@app.route("/business/details/<business_id>")
def business_details(business_id):
    # TODO: QUERY OR PARAMS?
    print("Process: Fetching Business Details")
    try:
        business = collection.find_one({"_id": ObjectId(business_id)})
        # TODO: DON"T PASS PHONE NUMBER INSTEAD OF PASS 0000000000 FIXED
        # TODO: WHAT ARE YOU PASSING BACK...
        if business:
            business["_id"] = str(business["_id"])  # Ensure JSON serializable
            return jsonify(business)
        return jsonify({"error": "Business not found"}), 404
        # if business:
        #     return render_template("business_details.html", business=business)
        # return render_template(
        #     template_name_or_list="index.html", error="Business not found"
    except Exception as e:
        print(f"Error fetching business details: {e}")
        return render_template("index.html", error="Failed to load business details")

# Delete Business
@app.route("/business/delete/<business_id>", methods=["DELETE"])
def delete_business(business_id):
    # print('Process: Start deleting ', business_id)
    try:
        business = collection.find_one({"_id": ObjectId(business_id)});
        if business:
            business["_id"] = str(business["_id"])
            collection.delete_one({"_id": ObjectId(business_id)});
            return jsonify({"success": "Delete successfully!"}), 200;
            
        return jsonify({"error": "Business not found"}), 404
    except Exception as e:
        return jsonify({"error": "Failed to load business details"}), e

# Update/Edit Business details
@app.route('/business/edit/<business_id>', methods=["PUT"])
def edit_business_info(business_id):
    try:
        data = request.json
        url = data.get("url")
        listed_by = data.get("listed_by")
        phone_number = data.get("phone_number")
        location = data.get("location")
        category = data.get("category")
        description = data.get("description")

        # Update the business in the database
        collection.update_one(
            {"_id": ObjectId(business_id)},
            {"$set": {
                "url": url,
                "listed_by": listed_by,
                "contact_number": phone_number,
                "location": location,
                "category": category,
                "website_description": description
            }}
        )
        
        return jsonify({"success": "Business updated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to update business info"}), 500

# Update/Edit Business LOGO
UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Check: Is upload directory exists?
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/business/edit/<business_id>/logo', methods=["POST"])
def upload_file(business_id):
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"error":"No selected file"}), 400
    
    if file:
        filename = secure_filename(f"{business_id}_{file.filename}")
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)
        
        return jsonify({"message": "File uploaded successfully", "file_path": file_path})
    
@app.route("/")
def index():
    return render_template(
        "index.html", businesses=get_all_website_info(request)
    )
#     # businesses = get_all_website_info(request)
#     # print("Finish: Get Businesses", businesses)
#     # return businesses
#     print('Process: App')
#     return redirect('/business')


@app.route("/profile")
def profile():
    name = 'Smruti'
    return render_template("profile.html", FIRST_NAME = name, LAST_NAME="Shah")

@app.route("/admin")
def admin():
    return "<h1 style='color:red'>'This is admin'</h1>"

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if credentials_collection.find_one({"username": username}):
        return jsonify({"message": "User already exists"});

    # hashed_password = generate_password_hash(password, method='sha256')
    credentials_collection.insert_one({"username": username, "password": password})
    return jsonify({"message": "User registered successfully"}), 200

@app.route('/login', methods=['POST'])
def login():
    print("Start: Login")
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = credentials_collection.find_one({"username": username, "password": password})
    if user and (user['password'], password):
        return jsonify({"success": "Login successful!"}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401    

if __name__ == "__main__":
    app.run(debug=True)