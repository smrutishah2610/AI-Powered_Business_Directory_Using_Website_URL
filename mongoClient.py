from pymongo import MongoClient


client = MongoClient("localhost", 27017)
db = client["test"]
collection = db["testUI"]


def check_duplicate_website(url):
    # Normalize URL by removing trailing slash and protocol
    normalized_url = url.rstrip("/").replace("http://", "").replace("https://", "")
    existing = collection.find_one({"url": {"$regex": normalized_url, "$options": "i"}})
    return existing is not None


def save_to_mongodb(url, extracted_data):
    if extracted_data is None:
        print(f"Warning: No data extracted for URL: {url}")
        return False, "No data extracted"

    try:
        # Check for duplicate
        if check_duplicate_website(url):
            return False, "This business is already registered"

        data = {
            "url": url,
            "website_Name": extracted_data.website_name,
            "contact_number": extracted_data.contact_number1,
            "website_description": extracted_data.website_description,
            "Location": {
                "city": extracted_data.city,
                "province": extracted_data.province,
                "country": extracted_data.country,
            },
            "category": extracted_data.category,
        }

        collection.insert_one(data)
        return True, "Business registered successfully"
    except Exception as e:
        print(f"Error saving to MongoDB: {e}")
        return False, str(e)


def get_all_website_info():
    try:
        # TODO: WRITE SEARCH QUERY
        return
    except Exception as e:
        print(f"Error fetching all websites: {e}")
        return []


def get_websites_by_category(category):
    try:
        # TODO: WRITE SEARCH QUERY
        return
    except Exception as e:
        print(f"Error fetching websites by category: {e}")
        return []


def get_websites_by_location(city=None, province=None, country=None):
    try:
        # TODO: WRITE QUERY
        return
    except Exception as e:
        print(f"Error fetching websites by location: {e}")
        return []
