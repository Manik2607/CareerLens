import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, resume, preferences, internships, recommendations, stats, profile, skill_gap

logger = logging.getLogger("main")
logger.setLevel(logging.INFO)

if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    ch.setFormatter(logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s"))
    logger.addHandler(ch)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup tasks (like scraping) when the server boots."""
    logger.info("🚀 CareerLens Backend starting up...")

    # Auto-scrape internships on startup (in background so it doesn't block)
    asyncio.create_task(startup_scrape())

    yield  # Server runs here

    logger.info("👋 CareerLens Backend shutting down...")


async def startup_scrape():
    """Scrape internships in the background on server startup."""
    # Small delay to let the server finish starting
    await asyncio.sleep(2)

    from supabase_client import supabase

    # Check if we already have fresh data (scraped in last 6 hours)
    try:
        recent = supabase.table("internships").select("id", count="exact").execute()
        count = len(recent.data) if recent.data else 0
        logger.info(f"Current internships in DB: {count}")

        if count >= 20:
            logger.info("✅ Enough internship data exists, skipping auto-scrape")
            return
    except Exception as e:
        logger.warning(f"Could not check existing internships: {e}")

    logger.info("📡 Auto-scraping internships from Internshala...")
    categories = [
        "web development",
        "python",
        "machine learning",
        "frontend development",
    ]

    await internships.scrape_and_save(categories)


app = FastAPI(title="CareerLens Backend", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(preferences.router)
app.include_router(internships.router)
app.include_router(recommendations.router)
app.include_router(stats.router)
app.include_router(profile.router)
app.include_router(skill_gap.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to CareerLens API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
