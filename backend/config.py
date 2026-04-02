import os
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load .env from the same directory as this file
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-this-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

if not SUPABASE_URL or not SUPABASE_KEY:
    print(f"CRITICAL WARNING: SUPABASE_URL or SUPABASE_KEY not set in {env_path}")
if JWT_SECRET_KEY == "your-super-secret-key-change-this-in-production":
    print(f"WARNING: Using default JWT_SECRET_KEY. Change this in production!")
