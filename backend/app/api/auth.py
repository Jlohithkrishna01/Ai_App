from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User, UserSettings
from app.schemas.auth import (
    UserSignupRequest,
    UserLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.schemas.user import UserResponse
from app.services.security import (
    hash_password,
    verify_password,
    create_access_token,
    generate_random_token,
)
from app.middleware.auth_deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(req: UserSignupRequest, db: Session = Depends(get_db)):
    # Check duplicate email
    existing_user = db.query(User).filter(User.email == req.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    pw_hash = hash_password(req.password)
    user = User(
        name=req.name.strip(),
        email=req.email.lower(),
        password_hash=pw_hash
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create default settings for user
    settings = UserSettings(user_id=user.id)
    db.add(settings)
    db.commit()

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials and try again."
        )

    # 30 days if remember_me, else standard 7 days
    expires_delta = timedelta(days=30) if req.remember_me else None
    token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=expires_delta
    )
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        # Avoid user enumeration in public API
        return {
            "message": "If this email is registered, password reset instructions have been created.",
            "reset_token": None
        }

    token = generate_random_token(32)
    user.reset_token = token
    user.reset_token_expiry = datetime.now(timezone.utc) + timedelta(hours=1)
    db.commit()

    return {
        "message": "Password reset token generated successfully.",
        "reset_token": token,
        "reset_url": f"/reset-password?token={token}"
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == req.token).first()
    if not user or not user.reset_token_expiry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset link. Please request a new one."
        )

    # Check expiry
    expiry = user.reset_token_expiry
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expiry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset token has expired. Please request a new one."
        )

    user.password_hash = hash_password(req.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()

    return {"message": "Your password has been successfully reset! You can now log in."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
