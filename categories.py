import re


WEBSITE_CATEGORIES = {
    'IT': [
        'software', 'technology', 'programming', 'development', 'web', 'cloud',
        'digital', 'it', 'computing', 'tech', 'artificial intelligence', 'ai',
        'data', 'cyber', 'computer', 'internet', 'app', 'application'
    ],
    'Healthcare': [
        'health', 'medical', 'hospital', 'clinic', 'doctor', 'healthcare',
        'wellness', 'pharmacy', 'medicine', 'dental', 'patient', 'care',
        'treatment', 'therapy'
    ],
    'Automation': [
        'automation', 'robotics', 'industrial', 'manufacturing', 'smart',
        'iot', 'control systems', 'automated', 'industry 4.0', 'robot',
        'process automation', 'machine'
    ],
    'Education': [
        'education', 'school', 'university', 'learning', 'training',
        'academy', 'course', 'teaching', 'student', 'college', 'institute',
        'tutor', 'class'
    ],
    'E-commerce': [
        'shop', 'store', 'retail', 'commerce', 'marketplace',
        'buy', 'sell', 'products', 'shopping', 'ecommerce', 'e-commerce',
        'online store', 'purchase'
    ],
    'Telecom': [
        'mobile service', 'telecom', 'telecommunications', 'network provider',
        'cellular', 'mobile operator', 'internet provider', 'broadband',
        'wireless', 'data plan', 'sim card', 'prepaid', 'postpaid', '4g', '5g',
        'voice call', 'sms', 'mobile network'
    ],
    'Banking & Finance': [
        'bank', 'banking', 'finance', 'financial', 'investment', 'insurance',
        'loan', 'credit', 'debit', 'payment', 'transaction', 'money transfer',
        'fintech', 'mutual fund', 'savings', 'account', 'upi', 'net banking',
        'mobile banking', 'online banking'
    ],
    'Other': []  # Default category
}

def determine_category(website_description: str) -> str:
    if not website_description:
        return 'Other'
        
    description_lower = website_description.lower()
    
    # Count matches for each category
    category_scores = {category: 0 for category in WEBSITE_CATEGORIES.keys()}
    
    for category, keywords in WEBSITE_CATEGORIES.items():
        for keyword in keywords:
            # Use word boundary to match whole words only
            pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
            matches = len(re.findall(pattern, description_lower))
            category_scores[category] += matches
    
    # Get category with highest score
    best_category = max(category_scores.items(), key=lambda x: x[1])
    
    # If no matches found, return 'Other'
    if best_category[1] == 0:
        return 'Other'
    
    return best_category[0] 