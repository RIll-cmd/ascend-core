import sys
import os
import subprocess

# Ensure root and server directories are in python path for serverless imports
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERVER_DIR = os.path.join(BASE_DIR, "server")

if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

# Auto-generate Prisma client if not yet generated in serverless environment
try:
    from prisma import Prisma
except (ImportError, RuntimeError) as e:
    schema_path = os.path.join(SERVER_DIR, "prisma", "schema.prisma")
    if os.path.exists(schema_path):
        try:
            print("[Vercel Serverless] Generating Prisma client...")
            subprocess.run([sys.executable, "-m", "prisma", "generate", f"--schema={schema_path}"], check=True)
            print("[Vercel Serverless] Successfully generated Prisma client.")
        except Exception as gen_err:
            print(f"[Vercel Serverless Warning] Automatic prisma generate failed: {gen_err}")

# Import the configured FastAPI application instance
try:
    from server.main import app
except ImportError:
    from main import app

# Expose app for Vercel Python runtime
__all__ = ["app"]
