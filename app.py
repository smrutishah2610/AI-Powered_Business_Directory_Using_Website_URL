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

# from bson import json_util
from bson.objectid import ObjectId

app = Flask(__name__)
print("Start: app")
CORS(app, origins=["http://127.0.0.1:5500"])  # Allow only this origin
# cors = CORS(app)

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


@app.route("/business/details/<business_id>")
def business_details(business_id):
    # TODO: QUERY OR PARAMS?
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


@app.route("/")
def index():
    return render_template(
        "index.html", businesses=get_all_website_info(request)
    )
    # businesses = get_all_website_info(request)
    # print("Finish: Get Businesses", businesses)
    # return businesses


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
        return jsonify({"message": "User already exists"}), 400

    # hashed_password = generate_password_hash(password, method='sha256')
    credentials_collection.insert_one({"username": username, "password": password})
    return jsonify({"message": "User registered successfully"}), 200

    

if __name__ == "__main__":
    app.run(debug=True, port=5000)
