from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jwt_utils import decode_access_token

security = HTTPBearer()


async def get_current_user(credentials = Depends(security)) -> str:
    """
    Extract and validate the user_id from the JWT token in the Authorization header.
    Returns the user_id string.
    """
    token = credentials.credentials
    
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id
