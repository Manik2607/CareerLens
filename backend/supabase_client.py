from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY
import logging

logger = logging.getLogger("supabase_client")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.warning("Supabase URL or Key not configured. Some features may not work.")
    supabase: Client = None
    supabase_admin: Client = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
