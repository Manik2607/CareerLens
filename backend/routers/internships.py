from fastapi import APIRouter, HTTPException, BackgroundTasks
from services.scraper import InternshalaScraper
from supabase_client import supabase
import datetime
import logging
import traceback

logger = logging.getLogger("internships_router")
logger.setLevel(logging.DEBUG)

if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s"))
    logger.addHandler(ch)

router = APIRouter(prefix="/api/internships", tags=["Internships"])


@router.get("/")
async def get_internships(work_type: str = None):
    """Get all internships, optionally filtered by work type."""
    try:
        query = supabase.table("internships").select("*")
        if work_type:
            query = query.ilike("work_type", f"%{work_type}%")

        response = query.order("scraped_at", desc=True).limit(50).execute()
        logger.info(f"Returning {len(response.data)} internships")
        return response.data
    except Exception as e:
        logger.error(f"Error fetching internships: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def scrape_and_save(categories: list[str]):
    """Background task: scrape internships from Internshala and save to DB."""
    total_saved = 0

    for category in categories:
        logger.info(f"Scraping category: {category}")
        try:
            internships = await InternshalaScraper.scrape_internships(category)
            logger.info(f"Found {len(internships)} internships for '{category}'")

            for item in internships:
                try:
                    # Skip entries with no apply_url (can't upsert without unique key)
                    if not item.get("apply_url"):
                        continue

                    # Check if already exists by apply_url
                    existing = supabase.table("internships").select("id").eq(
                        "apply_url", item["apply_url"]
                    ).execute()

                    if not existing.data:
                        item["posted_at"] = item.get("posted_at") or datetime.datetime.now().isoformat()
                        supabase.table("internships").insert(item).execute()
                        total_saved += 1
                except Exception as e:
                    logger.warning(f"Error saving internship '{item.get('role')}': {e}")
                    continue

        except Exception as e:
            logger.error(f"Error scraping category '{category}': {e}")
            logger.error(traceback.format_exc())

    logger.info(f"✅ Scraping complete! Saved {total_saved} new internships")


@router.post("/scrape")
async def trigger_scrape(background_tasks: BackgroundTasks, category: str = ""):
    """Manually trigger scraping. If no category, scrapes multiple defaults."""
    if category:
        categories = [category]
    else:
        categories = [
            "web development",
            "python",
            "machine learning",
            "data science",
            "frontend development",
            "backend development",
            "mobile app development",
        ]

    background_tasks.add_task(scrape_and_save, categories)
    return {
        "message": f"Scraping started for categories: {categories}",
        "categories": categories
    }
