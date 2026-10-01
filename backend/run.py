import sys
import os
from pathlib import Path
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Proactively load .env from backend_dir or project root
for candidate in [backend_dir / ".env", backend_dir.parent / ".env"]:
    if candidate.exists():
        load_dotenv(candidate, override=True)
        break

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
