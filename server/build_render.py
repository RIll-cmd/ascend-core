import os
import sys
import shutil
import subprocess
from pathlib import Path

def main():
    print("[Build Script] Starting Render backend build...")
    
    # 1. Fetch Prisma CLI & Query Engine binaries
    print("[Build Script] Fetching Prisma engine binaries...")
    subprocess.run([sys.executable, "-m", "prisma", "py", "fetch"], check=True)
    
    # 2. Generate Prisma Python Client
    print("[Build Script] Generating Prisma Python client...")
    subprocess.run([sys.executable, "-m", "prisma", "generate", "--schema=prisma/schema.prisma"], check=True)
    
    # 3. Locate downloaded query engine in cache and copy to current working directory
    try:
        from prisma.engine.utils import query_engine_name
        from prisma._config import config
        
        name = query_engine_name()
        dest = Path(__file__).parent / name
        print(f"[Build Script] Looking for query engine '{name}' to bundle into '{dest}'...")
        
        cache_dir = config.binary_cache_dir
        found = False
        if cache_dir and cache_dir.exists():
            for p in cache_dir.rglob("*query-engine*"):
                if p.is_file():
                    shutil.copy2(p, dest)
                    try:
                        os.chmod(dest, 0o755)
                    except Exception:
                        pass
                    print(f"[Build Script] Successfully bundled '{p.name}' into '{dest}' (size: {dest.stat().st_size} bytes)")
                    found = True
                    break
        
        if not found:
            home_cache = Path.home() / ".cache"
            if home_cache.exists():
                for p in home_cache.rglob("*query-engine*"):
                    if p.is_file():
                        shutil.copy2(p, dest)
                        try:
                            os.chmod(dest, 0o755)
                        except Exception:
                            pass
                        print(f"[Build Script] Found and copied from home cache: '{dest}'")
                        found = True
                        break
        
        if not found:
            print("[Build Script] Warning: Could not locate engine file in cache.")
    except Exception as e:
        print(f"[Build Script] Warning while bundling query engine: {e}")

    print("[Build Script] Render backend build finished successfully!")

if __name__ == "__main__":
    main()
