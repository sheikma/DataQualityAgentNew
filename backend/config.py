"""
Configuration settings for the Data Quality Agent
"""
import os
from pathlib import Path

# Claude API Configuration
CLAUDE_API_KEY = "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"

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
]

# Data Configuration
DEFAULT_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "sample_data", "marketing_campaigns.csv")

# Logging Configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"