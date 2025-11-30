#!/usr/bin/env python3
"""
Start Jac server with environment variables loaded from .env
Usage: python start_server.py
"""

import os
import subprocess
import sys
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Check for Gemini API key (litellm expects GEMINI_API_KEY)
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    print(f"✓ GEMINI_API_KEY is set ({api_key[:10]}...)")
else:
    print("⚠ GEMINI_API_KEY not found!")
    print("  Add to backend/.env: GEMINI_API_KEY=your-key-here")
    print("  Get one at: https://aistudio.google.com/apikey")
    print()

# Debug: Print all env vars that might be relevant
print("\n📋 Environment check:")
for key in ["GEMINI_API_KEY", "GOOGLE_API_KEY", "OPENAI_API_KEY"]:
    val = os.getenv(key)
    if val:
        print(f"   {key}: {val[:10]}...")
    else:
        print(f"   {key}: not set")

# Set auth bypass
os.environ["REQUIRE_AUTH_BY_DEFAULT"] = "false"

print("\n🚀 Starting Jac server...")
print("   Press Ctrl+C to stop\n")

# Start jac serve
try:
    subprocess.run(["jac", "serve", "main.jac"], check=True)
except KeyboardInterrupt:
    print("\n👋 Server stopped")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
