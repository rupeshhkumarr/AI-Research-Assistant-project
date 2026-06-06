"""Configuration for the FastAPI application.

Uses Pydantic BaseSettings to load environment variables.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
import pathlib


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env file."""

    # Directory where uploaded files are stored
    upload_dir: pathlib.Path = Field(
        default=pathlib.Path(__file__).parents[2] / "uploads",
        env="UPLOAD_DIR"
    )

    # Maximum allowed upload size (20 MB)
    max_upload_size: int = Field(
        default=20 * 1024 * 1024,
        env="MAX_UPLOAD_SIZE"
    )

    # Allowed file extensions
    allowed_extensions: list[str] = [
        ".pdf",
        ".docx",
        ".txt"
    ]

    # Google Gemini API Key
    google_api_key: str = Field(
        default="",
        env="GOOGLE_API_KEY"
    )

    # Embedding model
    embedding_model: str = Field(
        default="gemini-embedding-2",
        env="EMBEDDING_MODEL"
    )
    

    # Gemini chat model
    gemini_model: str = Field(
        default="gemini-flash-latest",
        env="GEMINI_MODEL"
    )

    # Automatically ingest uploaded files
    auto_ingest: bool = Field(
        default=True,
        env="AUTO_INGEST"
    )

    # FAISS vectorstore location
    vectorstore_dir: pathlib.Path = Field(
        default=pathlib.Path(__file__).parents[2] / "vectorstore",
        env="VECTORSTORE_DIR"
    )

    # Supabase Configuration
    supabase_url: str = Field(default="", env="SUPABASE_URL")
    supabase_anon_key: str = Field(default="", env="SUPABASE_ANON_KEY")
    supabase_service_role_key: str = Field(default="", env="SUPABASE_SERVICE_ROLE_KEY")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Singleton settings instance
settings = Settings()

# Set environment variable for langchain components
import os
if settings.google_api_key:
    os.environ["GOOGLE_API_KEY"] = settings.google_api_key
# Trigger reload
