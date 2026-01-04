#!/bin/bash

echo "🚀 Starting TopSkill LMS..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker found"
    
    # Check docker-compose
    if docker compose version &> /dev/null; then
        echo "✅ Docker Compose found"
        echo "Starting with Docker..."
        docker compose up --build
    elif command -v docker-compose &> /dev/null; then
        echo "✅ docker-compose found"
        echo "Starting with docker-compose..."
        docker-compose up --build
    else
        echo "❌ docker-compose not found. Install with: sudo apt install docker-compose"
        echo "Falling back to manual start..."
        start_manual
    fi
else
    echo "❌ Docker not found. Starting manually..."
    start_manual
fi

start_manual() {
    echo ""
    echo "📦 Starting Backend..."
    cd backend
    python3 manage.py migrate
    python3 manage.py seed_data
    python3 manage.py runserver &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    
    echo ""
    echo "📦 Starting Frontend..."
    cd ../frontend
    if [ ! -f .env.local ]; then
        echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
    fi
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
    
    echo ""
    echo "✅ Servers starting..."
    echo "Backend: http://localhost:8000"
    echo "Frontend: http://localhost:3000"
    echo "Admin: http://localhost:8000/admin/ (admin/admin123)"
    echo ""
    echo "Press Ctrl+C to stop"
    
    wait
}








