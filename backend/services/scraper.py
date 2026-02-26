import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import logging

logger = logging.getLogger("scraper")
logger.setLevel(logging.DEBUG)

if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s"))
    logger.addHandler(ch)


class InternshalaScraper:
    BASE_URL = "https://internshala.com/internships"

    @staticmethod
    async def scrape_internships(
        category: str = "",
        work_type: Optional[str] = None,
        location: Optional[str] = None,
    ) -> List[Dict]:
        """Scrape internships from Internshala for a given category.

        Args:
            category: e.g. "python", "web development"
            work_type: "remote" or "work from home" → prepends 'work-from-home-' to slug
            location: city name → appends '/in-<city>' to URL
        """
        # Build the URL slug
        slug_parts = []
        # Work-from-home prefix
        if work_type and work_type.lower() in ("remote", "work from home"):
            slug_parts.append("work-from-home")

        # Category
        if category:
            slug_parts.append(category.lower().replace(" ", "-"))

        slug_parts.append("internships")
        slug = "-".join(slug_parts)
        url = f"{InternshalaScraper.BASE_URL}/{slug}"

        # Location suffix
        if location and location.strip():
            loc_slug = location.strip().lower().replace(" ", "-")
            url = f"{url}/in-{loc_slug}"

        logger.info(f"Scraping: {url}")

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        internships = []

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(url, headers=headers, follow_redirects=True)

            if response.status_code != 200:
                logger.error(f"Failed to fetch Internshala: {response.status_code}")
                return []

            soup = BeautifulSoup(response.text, 'html.parser')
            listings = soup.find_all('div', class_='individual_internship')
            logger.info(f"Found {len(listings)} listing containers")

            for listing in listings:
                try:
                    # Company name
                    company_elem = listing.find('p', class_='company-name')
                    company = company_elem.get_text(strip=True) if company_elem else "Unknown"

                    # Role / title
                    role_elem = listing.find('h3', class_='job-internship-name')
                    role = role_elem.get_text(strip=True) if role_elem else "Unknown"

                    # Location
                    location_elem = listing.find('div', class_='locations')
                    loc = location_elem.get_text(strip=True) if location_elem else "Unknown"

                    # Work type
                    intern_work_type = "In-office"
                    if "work from home" in loc.lower() or "remote" in loc.lower():
                        intern_work_type = "Remote"
                        loc = "Remote"
                    # Check for "Work From Home" tag
                    status_tags = listing.find_all(class_='status-success')
                    for tag in status_tags:
                        tag_text = tag.get_text(strip=True).lower()
                        if 'work from home' in tag_text or 'remote' in tag_text:
                            intern_work_type = "Remote"

                    # Stipend
                    stipend_elem = listing.find('span', class_='stipend')
                    salary = stipend_elem.get_text(strip=True) if stipend_elem else "Unpaid"

                    # Duration
                    duration_elem = listing.find('div', class_='item_body')
                    duration = duration_elem.get_text(strip=True) if duration_elem else ""

                    # Skills
                    skill_elems = listing.find_all('div', class_='job_skill')
                    skills = [s.get_text(strip=True).lower() for s in skill_elems]

                    # Apply link
                    link_elem = listing.find('a', class_='job-title-href')
                    apply_url = ""
                    if link_elem and link_elem.get('href'):
                        apply_url = "https://internshala.com" + link_elem['href']

                    # Skip if no valid role or company
                    if company == "Unknown" and role == "Unknown":
                        continue

                    internships.append({
                        "company": company,
                        "role": role,
                        "location": loc,
                        "work_type": intern_work_type,
                        "salary": salary,
                        "apply_url": apply_url,
                        "source": "internshala",
                        "skills": skills,
                        "posted_at": None
                    })
                except Exception as e:
                    logger.warning(f"Error parsing listing: {e}")
                    continue

        except Exception as e:
            logger.error(f"Scraping error: {e}")

        logger.info(f"Successfully scraped {len(internships)} internships")
        return internships
