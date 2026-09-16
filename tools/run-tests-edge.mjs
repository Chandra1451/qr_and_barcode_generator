import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-test-'));
const port = 9444;
const targetUrl = 'file:///d:/websites_with_AI/qr_and_barcode_generator/tests/test-runner.html';

console.log('Launching headless Edge on port', port, '...');
const child = spawn(edgePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tempDir}`,
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--allow-file-access-from-files',
  targetUrl
], {
  detached: false,
  stdio: 'ignore'
});

function cleanup() {
  try {
    child.kill('SIGKILL');
  } catch (e) {}
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (e) {}
}

const timeout = setTimeout(() => {
  console.error('Timeout waiting for tests after 15s');
  cleanup();
  process.exit(1);
}, 15000);

// Poll for DevTools targets
async function pollTargets() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await res.json();
      const pageTarget = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (pageTarget) {
        return pageTarget.webSocketDebuggerUrl;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error('DevTools websocket not found within 10s');
}

async function main() {
  try {
    const wsUrl = await pollTargets();
    console.log('Connected to Edge DevTools target.');
    const ws = new WebSocket(wsUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function sendCommand(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (evt) => {
          const data = JSON.parse(evt.data);
          if (data.id === id) {
            ws.removeEventListener('message', handler);
            resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    // Poll for window.__TEST_RESULTS__
    for (let i = 0; i < 25; i++) {
      const evalRes = await sendCommand('Runtime.evaluate', {
        expression: 'JSON.stringify(window.__TEST_RESULTS__ || null)',
        returnByValue: true
      });

      const val = evalRes && evalRes.result && evalRes.result.value ? JSON.parse(evalRes.result.value) : null;
      if (val) {
        console.log('\n=============================================');
        console.log('TEST RESULTS FROM IN-BROWSER TEST RUNNER:');
        console.log(`Total tests run:  ${val.total}`);
        console.log(`Passed:          ${val.passed}`);
        console.log(`Failed:          ${val.failed}`);
        console.log(`Duration:        ${Math.round(val.duration)}ms`);
        console.log(`Status:          ${val.success ? 'ALL PASSED ✓' : 'FAILURES OCCURRED ✗'}`);
        console.log('=============================================\n');

        const screenshotRes = await sendCommand('Page.captureScreenshot', { format: 'png' });
        if (screenshotRes && screenshotRes.data) {
          fs.writeFileSync(path.join(process.cwd(), 'test_runner_results.png'), Buffer.from(screenshotRes.data, 'base64'));
          console.log('Saved screenshot to test_runner_results.png');
        }

        clearTimeout(timeout);
        ws.close();
        cleanup();
        process.exit(val.success ? 0 : 1);
      }
      await new Promise(r => setTimeout(r, 400));
    }

    throw new Error('Timed out waiting for window.__TEST_RESULTS__ to be set.');
  } catch (err) {
    console.error('Error running tests:', err.message);
    clearTimeout(timeout);
    cleanup();
    process.exit(1);
  }
}

main();
