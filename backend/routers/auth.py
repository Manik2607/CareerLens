from fastapi import APIRouter, HTTPException
from models.schemas import UserSignup, UserLogin, UserProfile, TokenResponse
from mongodb import get_users_collection
from jwt_utils import hash_password, verify_password, create_access_token
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/signup", response_model=TokenResponse)
async def signup(user: UserSignup):
    try:
        users_col = get_users_collection()
        
        # Check if user already exists
        existing_user = users_col.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = hash_password(user.password)
        
        # Create new user
        new_user = {
            "email": user.email,
            "password": hashed_password,
            "full_name": user.full_name,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = users_col.insert_one(new_user)
        user_id = str(result.inserted_id)
        
        # Create JWT token
        token = create_access_token(user_id)
        
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user_id=user_id,
            email=user.email
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signup failed: {str(e)}")

@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin):
    try:
        users_col = get_users_collection()
        
        # Find user by email
        db_user = users_col.find_one({"email": user.email})
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(user.password, db_user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create JWT token
        user_id = str(db_user["_id"])
        token = create_access_token(user_id)
        
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user_id=user_id,
            email=db_user["email"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Login failed: {str(e)}")

@router.post("/logout")
async def logout():
    """Logout endpoint (token invalidation handled on frontend)"""
    try:
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

