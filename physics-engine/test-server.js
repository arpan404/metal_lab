#!/usr/bin/env node

/**
 * Simple HTTP server for testing Metal Lab experiments and games
 * Run with: node test-server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HOST = 'localhost';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.ts': 'application/typescript'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Default to test-experiments.html
  let filePath = '.' + (req.url === '/' ? '/test-experiments.html' : req.url);
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║          🧪 Metal Lab Test Server Running 🧪             ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  🌐 Server running at: http://${HOST}:${PORT}/`);
  console.log('');
  console.log('  📦 Available Test Pages:');
  console.log(`    • ⭐ COMPLETE DEMO (ALL EXPERIMENTS): http://${HOST}:${PORT}/complete-demo.html`);
  console.log(`    • Working Demo: http://${HOST}:${PORT}/demo.html`);
  console.log(`    • UI Mockup: http://${HOST}:${PORT}/test-experiments.html`);
  console.log('');
  console.log('  ✨ Enhanced Features:');
  console.log('    • Foucault Pendulum - Air resistance & precession tracking');
  console.log('    • Young\'s Double Slit - Photon mode visualization');
  console.log('    • Rutherford Gold Foil - Particle trails & scattering events');
  console.log('    • NASCAR Banking - Downforce, drag, tire physics');
  console.log('    • Millikan Oil Drop - Brownian motion simulation');
  console.log('');
  console.log('  🎮 Enhanced Games:');
  console.log('    • Banking Track Challenge - Combo system & performance bonuses');
  console.log('    • Atomic Deflection - Progressive difficulty & power-ups');
  console.log('');
  console.log('  Press Ctrl+C to stop the server');
  console.log('');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down test server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down test server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
