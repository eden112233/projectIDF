#!/bin/bash

# Define paths
PROJECT_DIR="$HOME/Documents/projects/private/itzik/flight-simulator-monitor"
MONGO_DATA="$HOME/mongo-data"
SERVER_DIR="$PROJECT_DIR/server"
CLIENT_DIR="$PROJECT_DIR/client"
MONGO_PORT=27017
SERVER_PORT=5001
LOG_FILE="$HOME/monitor-startup.log"

echo "📝 Logging to $LOG_FILE" | tee "$LOG_FILE"

# Kill any existing MongoDB processes
echo "🔁 Killing any existing MongoDB processes..." | tee -a "$LOG_FILE"
pkill mongod

# Clean old MongoDB data
echo "🗑️  Removing old MongoDB data..." | tee -a "$LOG_FILE"
sudo rm -rf "$MONGO_DATA"
mkdir -p "$MONGO_DATA"
sudo chown -R "$USER" "$MONGO_DATA"


# Start MongoDB
echo "🚀 Starting MongoDB..." | tee -a "$LOG_FILE"
mongod --dbpath "$MONGO_DATA" >> "$LOG_FILE" 2>&1 &
sleep 2
echo "✅ MongoDB started at $MONGO_DATA" | tee -a "$LOG_FILE"

# Start backend
echo "📦 Installing server dependencies (if needed)..." | tee -a "$LOG_FILE"
cd "$SERVER_DIR"
npm install >> "$LOG_FILE" 2>&1

echo "🚀 Starting backend (port $SERVER_PORT)..." | tee -a "$LOG_FILE"
npx ts-node src/index.ts >> "$LOG_FILE" 2>&1 &
sleep 2
echo "✅ Backend is running at http://localhost:$SERVER_PORT" | tee -a "$LOG_FILE"

# Start frontend
echo "📦 Installing client dependencies (if needed)..." | tee -a "$LOG_FILE"
cd "$CLIENT_DIR"
npm install >> "$LOG_FILE" 2>&1

echo "🌐 Starting React frontend (port 3000)..." | tee -a "$LOG_FILE"
npm start
