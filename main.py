from bs4 import BeautifulSoup
import requests
from api import extract_info_with_ai
from mongoClient import save_to_mongodb


def fetch_website_text(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.delete(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            text = soup.get_text(separator=" ", strip=True)
            return text
        else:
            print(f"Failed to fetch {url}, Status Code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def scrape_and_store(url, listed_by):
    try:
        html = fetch_website_text(url)
        if not html:
            print("Failed to fetch website text")
            return False

        extracted_data = extract_info_with_ai(html)
        print("Extracted data: ",extracted_data)
        if not extracted_data:
            print("Failed to extract data from website")
            return False

        success = save_to_mongodb(url, listed_by, extracted_data)
        print('Listed By in main.py Line 36',listed_by)
        return success  # Returns True if save was successful, False otherwise
        
    except Exception as e:
        print(f"Error in scrape_and_store: {e}")
        return False



# Education: https://www.conestogac.on.ca
# Telecom: https://www.fido.ca
# Banking: https://www.rbcroyalbank.com/personal.html
# Tech Manufacturing: https://www.apple.com/ca/ 
# IT: https://speakai.co, https://about.meta.com
