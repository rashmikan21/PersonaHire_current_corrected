import os
import sys

# Ensure project backend directory is in the Python search path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "project", "backend"))
if not os.path.exists(backend_dir):
    backend_dir = os.path.abspath(os.path.join(current_dir, "..", "project", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app
