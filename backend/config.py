import os
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load .env from the same directory as this file
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL:
    print(f"CRITICAL WARNING: SUPABASE_URL is not set in {env_path}")
if not SUPABASE_KEY:
    print(f"CRITICAL WARNING: SUPABASE_KEY is not set in {env_path}")
