import os
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load .env from the same directory as this file
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# MongoDB Configuration
MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "careerlens")

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-this-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

if not MONGODB_URI:
    print(f"CRITICAL WARNING: MONGODB_URI is not set in {env_path}")
if JWT_SECRET_KEY == "your-super-secret-key-change-this-in-production":
    print(f"WARNING: Using default JWT_SECRET_KEY. Change this in production!")
