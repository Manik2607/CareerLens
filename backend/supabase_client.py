# Compatibility layer - all routers use MongoDB now via mongodb.py
# This file is deprecated but kept for backward compatibility with older router files
# All new code should import from mongodb.py instead

class StubSupabaseClient:
    """Stub Supabase client - not used, kept for backward compatibility"""
    def __init__(self):
        pass
    
    def table(self, name):
        return self
    
    def select(self, *args, **kwargs):
        return self
    
    def eq(self, *args, **kwargs):
        return self
    
    def insert(self, data):
        return self
    
    def update(self, data):
        return self
    
    def order(self, column, desc=False):
        return self
    
    def limit(self, num):
        return self
    
    def execute(self):
        return StubResponse()

class StubResponse:
    def __init__(self):
        self.data = []

# Create stub instances
supabase = StubSupabaseClient()
supabase_admin = StubSupabaseClient()
