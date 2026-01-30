#!/bin/bash

# Kill any existing processes on ports 3000 and 4000
echo "Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "node.*index.js" 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 2

# Start backend
echo "Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "Starting frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Application starting..."
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:3000"

# Keep script running
wait