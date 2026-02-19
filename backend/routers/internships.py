from fastapi import APIRouter, HTTPException, BackgroundTasks
from services.scraper import InternshalaScraper
from supabase_client import supabase
from models.schemas import InternshipResponse

router = APIRouter(prefix="/api/internships", tags=["Internships"])

@router.get("/", response_model=list[InternshipResponse])
async def get_internships(work_type: str = None):
    query = supabase.table("internships").select("*")
    if work_type:
        query = query.ilike("work_type", f"%{work_type}%")
    
    response = query.order("posted_at", desc=True).limit(50).execute()
    return response.data

async def scrape_and_save(category: str):
    internships = await InternshalaScraper.scrape_internships(category)
    if internships:
        # Upsert based on some unique constraint (e.g. apply_url)
        # Supabase upsert requires unique constraint
        # For now, just insert and ignore duplicates error if possible or handle it
        for item in internships:
             try:
                 # Check if exists by apply_url
                 existing = supabase.table("internships").select("id").eq("apply_url", item["apply_url"]).execute()
                 if not existing.data:
                     # Add dummy posted_at since we don't have it
                     import datetime
                     item["posted_at"] = datetime.datetime.now().isoformat()
                     supabase.table("internships").insert(item).execute()
             except Exception as e:
                 print(f"Error saving internship: {e}")

@router.post("/scrape")
async def trigger_scrape(category: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(scrape_and_save, category)
    return {"message": f"Scraping started for {category}"}
