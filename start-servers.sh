#!/bin/bash

# Coffee Beans World - Server Starter Script
# This script starts both backend and frontend servers in the background

echo "🚀 Starting Coffee Beans World servers..."

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
lsof -ti:4000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 1

# Start backend
echo "🔧 Starting backend server..."
cd "/Volumes/PERSONAL/CBW WEBSITE/coffee-beans-world/backend"
nohup npm start > /tmp/cbw-backend.log 2>&1 &
BACKEND_PID=$!
sleep 2

# Start frontend
echo "🎨 Starting frontend server..."
cd "/Volumes/PERSONAL/CBW WEBSITE/coffee-beans-world/frontend"
nohup npm start > /tmp/cbw-frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 2

echo ""
echo "✅ Servers started successfully!"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "📍 URLs:"
echo "   Backend:  http://localhost:4000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f /tmp/cbw-backend.log"
echo "   Frontend: tail -f /tmp/cbw-frontend.log"
echo ""
echo "🛑 To stop servers, run: lsof -ti:4000,5173 | xargs kill -9"
echo ""
