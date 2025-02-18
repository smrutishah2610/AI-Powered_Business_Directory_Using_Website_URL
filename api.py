import json
import os
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
def get_openai_api_key():
    return os.environ.get("API_KEY")


client = OpenAI(api_key=get_openai_api_key())

class websiteInformation(BaseModel):
    website_name: str
    contact_number: str
    website_description: str
    city: str
    province: str
    country: str
    category: str = Field(..., description="Category must be one of: IT, Healthcare, Automation, Education, E-commerce, Telecom, Banking & Finance, Other")


Prompt = """Extract the following information from the given text. The Location must in the format of City, State, Country to comile with the Google Search and break down into city, province/state, and country. Analyze the website content and determine its primary business category.

Choose EXACTLY ONE category from this list:
- IT: For companies focused on software development, technology services, digital solutions, web development, IT consulting, cybersecurity, cloud services, or tech products
- Tech Manufacturing: For companies that manufacture and sell technology hardware, devices, computers, smartphones, or consumer electronics
- Healthcare: For medical services, hospitals, clinics, healthcare providers, wellness centers, pharmacies, or medical equipment
- Automation: For industrial automation, robotics, manufacturing systems, process automation, or smart factory solutions
- Education: For educational institutions, online learning platforms, training centers, schools, universities, or educational technology
- E-commerce: For online retail stores, digital marketplaces, online shopping platforms selling physical or digital products
- Telecom: For mobile service providers, internet service providers, telecommunications companies, network services, or mobile operators
- Banking & Finance: For banks, financial institutions, investment services, insurance companies, payment services, or fintech solutions
- Other: If none of the above categories clearly fit

Based on the following indicators:
1. Main services or products offered
2. Industry-specific terminology used
3. Target audience and use cases
4. Core business purpose"""


def extract_info_with_ai(text):
    print(f"Start: Extract the following info from the given text")
    extracted_data = {
        "website_name":'Smruti Shah', 
        "contact_number":'',
        "website_description": 'Data Analyst specializing in data cleaning, analyzing, and visualizing with tools such as SQL, Python, Tableau, and Power BI. Offers services in database management, automation, financial analysis, security, and troubleshooting, with projects in sales data analysis, IT dashboard analysis, ETL pipeline development, AI-powered business directories, and Airbnb data visualization.',
        "city": '' ,
        "province": '' ,
        "country": '' ,
        "category": 'IT'
    }
    return extracted_data
    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",
            messages=[
                {
                    "role": "system",
                    "content": Prompt,
                },
                {"role": "user", "content": text},
            ],
            response_format=websiteInformation,
        )

        # Extract JSON-formatted response
        response = completion.choices[0].message.parsed
        extracted_data = {
            "website_name":response.website_name, 
            "contact_number":response.contact_number,
            "website_description": response.website_description,
            "city": response.city,
            "province": response.province ,
            "country": response.country,
            "category": response.category
        }

    except json.JSONDecodeError:
        print("Error: OpenAI response is not valid JSON")
        extracted_data = {}

    print('Finish: Extract Data')
    print(extracted_data)
    return extracted_data  # Returning JSON dictionary
