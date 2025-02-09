from bs4 import BeautifulSoup
import requests
from api import extract_info_with_ai
from mongoClient import save_to_mongodb


def fetch_website_text(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=10)
        
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

def scrape_and_store(url):
    try:
        html = fetch_website_text(url)
        if not html:
            print("Failed to fetch website text")
            return False

        extracted_data = extract_info_with_ai(html)
        if not extracted_data:
            print("Failed to extract data from website")
            return False

        success = save_to_mongodb(url, extracted_data)
        return success  # Returns True if save was successful, False otherwise
        
    except Exception as e:
        print(f"Error in scrape_and_store: {e}")
        return False

# Example Usage

if __name__ == "__main__":
    # url = input("Enter the website URL: ")
    url = 'https://www.bell.ca'
    scrape_and_store(url)


# Education: https://www.conestogac.on.ca
# Telecom: https://www.fido.ca
# Banking: https://www.rbcroyalbank.com/personal.html
# Tech Manufacturing: https://www.apple.com/ca/ 
# IT: https://speakai.co, https://about.meta.com
