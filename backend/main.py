from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, resume, preferences, internships, recommendations, stats

app = FastAPI(title="CareerLens Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, specify frontend URL
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

@app.get("/")
def read_root():
    return {"message": "Welcome to CareerLens API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
