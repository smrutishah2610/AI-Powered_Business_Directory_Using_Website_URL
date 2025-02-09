from flask import Flask, render_template, request, jsonify
from mongoClient import get_all_website_info, get_websites_by_location, get_websites_by_category, check_duplicate_website, collection
from main import scrape_and_store
from bson import json_util
from bson.objectid import ObjectId

app = Flask(__name__)

@app.route('/')
def home():
    # Get all businesses for the listing
    businesses = get_all_website_info()
    return render_template('index.html', businesses=businesses)

@app.route('/scrape', methods=['POST'])
def scrape_website():
    try:
        url = request.form.get('url')
        if not url:
            return jsonify({"error": "URL is required"}), 400
            
        # Check for duplicate before scraping
        if check_duplicate_website(url):
            return jsonify({"error": "This business is already registered"}), 400
        
        success = scrape_and_store(url)
        
        if success:
            return jsonify({"message": "Business registered successfully"})
        return jsonify({"error": "Failed to register business"}), 500
            
    except Exception as e:
        print(f"Error in scrape_website route: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/websites')
def get_websites():
    try:
        category = request.args.get('category')
        city = request.args.get('city')
        province = request.args.get('province')
        country = request.args.get('country')
        
        # Initialize query
        query = {}
        
        # Add filters to query if they exist
        if category and category != "":
            query["category"] = category
        if city and city != "":
            query["location.city"] = city
        if province and province != "":
            query["location.province"] = province
        if country and country != "":
            query["location.country"] = country
            
        # Get filtered businesses
        businesses = list(collection.find(query))
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            # If AJAX request, return only the business list partial
            return render_template('index.html', businesses=businesses)
        
        # For regular requests, return the full page
        return render_template('index.html', businesses=businesses)
        
    except Exception as e:
        print(f"Error in get_websites route: {e}")
        return render_template('index.html', businesses=[], error=str(e))

@app.route('/business/details/<business_id>')
def business_details(business_id):
    try:
        business = collection.find_one({"_id": ObjectId(business_id)})
        if business:
            return render_template('business_details.html', business=business)
        return render_template('index.html', error="Business not found")
    except Exception as e:
        print(f"Error fetching business details: {e}")
        return render_template('index.html', error="Failed to load business details")

if __name__ == '__main__':
    app.run(debug=True) 