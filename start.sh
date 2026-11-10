#!/usr/bin/env bash
echo "==================================================================="
echo "    RAO BAHADUR Y. MAHABALESWARAPPA ENGINEERING COLLEGE (RYMEC)"
echo "                  RYMEC GRIEVANCE DESK"
echo "==================================================================="

# Start backend
cd "$(dirname "$0")/backend" && npm start &
BACKEND_PID=$!

sleep 2

# Start frontend
cd "$(dirname "$0")/frontend" && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
