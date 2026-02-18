from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CareerLens API",
    description="Backend API for CareerLens",
    version="0.1.0",
)

# CORS configuration — allows the Next.js frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to the CareerLens API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
