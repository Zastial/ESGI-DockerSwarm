const assert = require('assert');
const os = require('os');

const express = require('express');

function createApp() {
  const app = express();
  
  app.get('/', (req, res) => {
    res.json({
      hostname: os.hostname()
    });
  });
  
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK'
    });
  });
  
  return app;
}

// Tests
async function runTests() {
  console.log('🧪 Starting tests...\n');
  
  const app = createApp();
  const request = require('supertest');
  
  try {
    // Test 1
    console.log('Test 1: GET / returns hostname');
    const res1 = await request(app).get('/');
    assert.strictEqual(res1.status, 200, 'Should return status 200');
    assert(res1.body.hostname, 'Should have hostname property');
    assert.strictEqual(typeof res1.body.hostname, 'string', 'Hostname should be string');
    console.log(`✓ GET / returns: ${JSON.stringify(res1.body)}\n`);
    
    // Test 2
    console.log('Test 2: GET /health returns status OK');
    const res2 = await request(app).get('/health');
    assert.strictEqual(res2.status, 200, 'Should return status 200');
    assert.strictEqual(res2.body.status, 'OK', 'Status should be OK');
    console.log(`✓ GET /health returns: ${JSON.stringify(res2.body)}\n`);
    
    // Test 3
    console.log('Test 3: Verify JSON format');
    assert.strictEqual(res1.type, 'application/json', 'Response should be JSON');
    assert.strictEqual(res2.type, 'application/json', 'Response should be JSON');
    console.log('✓ Both endpoints return JSON format\n');
    
    // Test 4
    console.log('Test 4: Verify os.hostname()');
    const hostname = os.hostname();
    assert(hostname, 'os.hostname() should return a value');
    console.log(`✓ os.hostname() returns: ${hostname}\n`);
    
    console.log('✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

if (!packageJson.devDependencies.supertest) {
  console.log('Installing supertest for tests...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install --save-dev supertest', { stdio: 'inherit' });
  } catch (e) {
    console.error('Failed to install supertest');
  }
}

runTests();
