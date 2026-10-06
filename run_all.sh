#!/bin/bash
echo "🌊 Starting AquaSentinel Full-Stack in VS Code..."

# Setup backend
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
python app.py &
BACKEND_PID=$!
cd ..

# Setup frontend
cd frontend
npm install
npm run dev

kill $BACKEND_PID
