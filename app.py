from flask import Flask, render_template, request, jsonify
from mongoClient import get_all_website_info, get_websites_by_category, get_websites_by_location, check_duplicate_website, collection
from main import scrape_and_store
# from bson import json_util
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
        # TODO: PASS NAME AND URL IN THE BODY PARAMS
        url = request.form.get('url')
        listed_by = request.form.get('listed_by')
        print('listed by in app.py LINE 21: ', listed_by)
        if not url:
            return jsonify({"error": "URL is required"}), 400
            
        # Check for duplicate before scraping
        if check_duplicate_website(url):
            return jsonify({"error": "This business is already registered"}), 400
        
        # TODO: PASS THE BODY TO THE SCRAPE AND STORE THE NAME WITH THE URL
        success = scrape_and_store(url, listed_by)
        
        if success:
            return jsonify({"message": "Business registered successfully"})
        return jsonify({"error": "Failed to register business"}), 500
            
    except Exception as e:
        print(f"Error in scrape_website route: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/websites')
def get_websites():
    try:
        # TODO: LEARN DIFFERENCE BETWEEN QUERY AND PARAMS FOR GET REQUEST
        # TODO: FIX THIS
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
        
        # PRINT(TYPEOF BUSINESSES)
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            # If AJAX request, return only the business list partial
            return render_template('index.html', businesses=businesses)
        
        # PASS ONLY _ID, NAME, LINK, LOCATION, DESCRIPTION AND CATEGORY - NOT ANYTHING ELSE
        
        # DON"T CALL INDEX.HTML RATHER THAN PASS businesses OBJECT DIRECTLY
        
        # For regular requests, return the full page
        return render_template('index.html', businesses=businesses)
        
    except Exception as e:
        print(f"Error in get_websites route: {e}")
        return render_template('index.html', businesses=[], error=str(e))

@app.route('/business/details/<business_id>')
def business_details(business_id):
    # TODO: QUERY OR PARAMS?
    try:
        business = collection.find_one({"_id": ObjectId(business_id)})
        # TODO: DON"T PASS PHONE NUMBER INSTEAD OF PASS 0000000000 FIXED
        # TODO: WHAT ARE YOU PASSING BACK...
        if business:
            return render_template('business_details.html', business=business)
        return render_template(template_name_or_list='index.html', error="Business not found")
    except Exception as e:
        print(f"Error fetching business details: {e}")
        return render_template('index.html', error="Failed to load business details")

if __name__ == '__main__':
    app.run(debug=True) 