from pymongo import MongoClient

from api import websiteInformation


client = MongoClient("localhost", 27017)
db = client["test"]
collection = db["testUI"]


def check_duplicate_website(url):
    # Normalize URL by removing trailing slash and protocol
    normalized_url = url.rstrip("/").replace("http://", "").replace("https://", "")
    existing = collection.find_one({"url": {"$regex": normalized_url, "$options": "i"}})
    return existing is not None


def save_to_mongodb(url, listed_by, extracted_data):
    print('Start: Save Record to MongoDB')
    if extracted_data is None:
        print(f"Warning: No data extracted for URL: {url}")
        return False, "No data extracted"
    
    try:
        # Check for duplicate
        if check_duplicate_website(url):
            return False, "This business is already registered"

        print(f'Data?', extracted_data['website_name'])
        data = {
            "url": url,
            "listed_by": listed_by,
            "website_name": extracted_data['website_name'],
            "contact_number": extracted_data['contact_number'],
            "website_description": extracted_data['website_description'],
            "location": {
                "city": extracted_data['city'],
                "province": extracted_data['province'],
                "country": extracted_data['country']
            },
            "category": extracted_data['category']
        }
        
        print('listed by in mongoClient Line 40: ', listed_by)
        collection.insert_one(data)
        return True, "Business registered successfully"
    except Exception as e:
        print(f"Error: Save Record to MongoDB: {e}")
        return False, str(e)


def get_all_website_info():
    try:
        # TODO: WRITE SEARCH QUERY
        findWebsiteList = collection.find({})
        formatted_websites = []
        for site in findWebsiteList:
            site['location'] = site.get("location", {"city": "Unknown", "province": "Unknown", "country": "Unknown"})
            formatted_websites.append(site)
        return formatted_websites
    except Exception as e:
        print(f"Error fetching all websites: {e}")
        return []


def get_websites_by_category(category):
    try:
        # TODO: WRITE SEARCH QUERY
        return list(collection.find({"category": category}))
    except Exception as e:
        print(f"Error fetching websites by category: {e}")
        return []


def get_websites_by_location(city=None, province=None, country=None):
    query = {f"location.{key}": value for key, value in [("city", city), ("province", province), ("country", country)] if value}
    try:
        # TODO: WRITE QUERY
        return list(collection.find(query))
    except Exception as e:
        print(f"Error fetching websites by location: {e}")
        return []
