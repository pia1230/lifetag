#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Life-Tag Medical Records App...');

// Kill any existing processes
const killExisting = () => {
  try {
    spawn('pkill', ['-f', 'node index.js'], { stdio: 'ignore' });
    spawn('pkill', ['-f', 'react-scripts start'], { stdio: 'ignore' });
  } catch (e) {
    // Ignore errors
  }
};

killExisting();

// Wait a moment
setTimeout(() => {
  // Start backend
  console.log('🔧 Starting backend server...');
  const backend = spawn('node', ['index.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit'
  });

  backend.on('error', (err) => {
    console.error('❌ Backend failed to start:', err);
  });

  // Wait for backend to start, then start frontend
  setTimeout(() => {
    console.log('🎨 Starting frontend...');
    const frontend = spawn('npm', ['start'], {
      cwd: path.join(__dirname, 'frontend'),
      stdio: 'inherit'
    });

    frontend.on('error', (err) => {
      console.error('❌ Frontend failed to start:', err);
    });

    // Open browser after a delay
    setTimeout(() => {
      const { exec } = require('child_process');
      exec('open -a "Google Chrome" http://localhost:3000', (err) => {
        if (err) {
          console.log('🌐 Please open http://localhost:3000 in your browser');
        } else {
          console.log('🌐 Opening Chrome...');
        }
      });
    }, 8000);

  }, 3000);

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

}, 2000);