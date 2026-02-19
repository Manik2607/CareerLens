from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY

if not SUPABASE_URL or not SUPABASE_KEY:
    # raising error might stop the server ifenv not set, maybe just warn?
    # actually better to fail fast for critical config
    print("Warning: Supabase URL or Key not set. Supabase client will fail.")

try:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY")
    # Using 'key' argument for clarity if needed, but positional is (url, key)
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"CRITICAL ERROR initializing Supabase client: {e}")
    # Don't silence it, otherwise imports will fail with confusing NoneType error
    raise e

# Use service role key for admin tasks if available
supabase_admin: Client = None
if SUPABASE_SERVICE_KEY:
    try:
        supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception as e:
        print(f"Error initializing Supabase admin client: {e}")
