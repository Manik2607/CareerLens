from fastapi import APIRouter, HTTPException, Depends
from models.schemas import UserSignup, UserLogin, UserProfile
from supabase_client import supabase

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/signup", response_model=UserProfile)
async def signup(user: UserSignup):
    try:
        # Sign up with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": {
                "data": {
                    "full_name": user.full_name
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Signup failed")
            
        # Create profile entry
        # Note: If Supabase trigger is set up, this might be redundant, but good to ensure
        try:
            supabase.table("profiles").insert({
                "id": auth_response.user.id,
                "email": user.email,
                "full_name": user.full_name
            }).execute()
        except Exception as e:
            # If profile creation fails, we might want to rollback auth user or just log
            print(f"Error creating profile: {e}")
            
        return UserProfile(
            id=auth_response.user.id,
            email=user.email,
            full_name=user.full_name,
            created_at=auth_response.user.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(user: UserLogin):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        
        if not auth_response.session:
             raise HTTPException(status_code=401, detail="Invalid credentials")
             
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer",
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "full_name": auth_response.user.user_metadata.get("full_name")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logout")
async def logout():
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
