#!/usr/bin/env bash
echo "===================================================="
echo "Starting VentureBlueprint Platform (Local Dev Mode)"
echo "===================================================="

export PYTHONPATH="$(pwd)/backend"

# Start Backend
echo "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ..."
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# Start Frontend
echo "[2/2] Starting Vite React Frontend on http://localhost:5173 ..."
npm run dev &
FRONTEND_PID=$!

echo "VentureBlueprint running. Press CTRL+C to stop."
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
