import httpx
from bs4 import BeautifulSoup
from typing import List, Dict
import asyncio

class InternshalaScraper:
    BASE_URL = "https://internshala.com/internships"
    
    @staticmethod
    async def scrape_internships(category: str = "") -> List[Dict]:
        # Internshala URL structure: /<category>-internships
        url = InternshalaScraper.BASE_URL
        if category:
            # simplistic mapping, might need more robust slugification
            slug = category.lower().replace(" ", "-")
            url = f"{InternshalaScraper.BASE_URL}/{slug}-internships"
            
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        internships = []
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, follow_redirects=True)
                
            if response.status_code != 200:
                print(f"Failed to fetch Internshala: {response.status_code}")
                return []
                
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # This selector is based on Internshala's structure (might change)
            listings = soup.find_all('div', class_='individual_internship')
            
            for listing in listings:
                try:
                    # Skip if it's just a promotional container
                    if 'marketing_contain' in listing.get('class', []):
                         continue

                    # Extract ID to avoid duplicates if possible, or just use as is
                    id_attr = listing.get('internshipid')
                    
                    company_elem = listing.find('a', class_='link_display_like_text')
                    company = company_elem.text.strip() if company_elem else "Unknown Company"
                    
                    role_elem = listing.find('h3', class_='job-title-heading')
                    role = role_elem.text.strip() if role_elem else "Unknown Role"
                    
                    location_elem = listing.find('a', class_='location_link')
                    location = location_elem.text.strip() if location_elem else "Unknown Location"
                    
                    # Work type (remote/in-office) often in location or separate label
                    work_type = "In-office"
                    if "Remote" in location:
                        work_type = "Remote"
                    # Also check status tags
                    status_tags = listing.select('.status-small')
                    for tag in status_tags:
                        if 'Remote' in tag.text:
                            work_type = "Remote"

                    
                    # stipend
                    stipend_elem = listing.find('span', class_='stipend')
                    salary = stipend_elem.text.strip() if stipend_elem else "Unpaid"
                    
                    # Apply link
                    link_elem = listing.find('a', class_='view_detail_button')
                    apply_url = "https://internshala.com" + link_elem['href'] if link_elem else ""

                    internships.append({
                        "company": company,
                        "role": role,
                        "location": location,
                        "work_type": work_type,
                        "salary": salary,
                        "apply_url": apply_url,
                        "source": "internshala",
                        "skills": [], # Parsing skills from listing requires visiting detail page often
                        "posted_at": None 
                    })
                except Exception as e:
                    print(f"Error parsing listing: {e}")
                    continue
                    
        except Exception as e:
            print(f"Scraping error: {e}")
            
        return internships
