const { spawn } = require('child_process');
const path = require('path');

console.log('===================================================================');
console.log('🏛️  RYMEC GRIEVANCE DESK - STARTING LIVE PREVIEW SERVICES');
console.log('===================================================================');

// 1. Start Backend on port 5000
const backendPath = path.join(__dirname, 'backend');
console.log('Starting Backend API in:', backendPath);
const backend = spawn('node', ['server.js'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true
});

// 2. Start Frontend Vite server on port 5173
const frontendPath = path.join(__dirname, 'frontend');
console.log('Starting Frontend Vite Server in:', frontendPath);
const frontend = spawn('cmd.exe', ['/c', 'npm run dev -- --host'], {
  cwd: frontendPath,
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => console.error('Backend process error:', err));
frontend.on('error', (err) => console.error('Frontend process error:', err));

process.on('SIGINT', () => {
  console.log('Shutting down preview services...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});
