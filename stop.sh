#!/bin/bash

echo "Stopping Life-Tag application..."

# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:4000 | xargs kill -9 2>/dev/null || true

# Kill specific process types
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true

echo "All Life-Tag processes stopped."