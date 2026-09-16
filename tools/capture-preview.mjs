import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-preview-'));
const port = 9555;
const targetUrl = 'file:///d:/websites_with_AI/qr_and_barcode_generator/index.html';

const child = spawn(edgePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tempDir}`,
  '--disable-gpu',
  '--no-first-run',
  '--allow-file-access-from-files',
  targetUrl
], { detached: false, stdio: 'ignore' });

function cleanup() {
  try { child.kill('SIGKILL'); } catch (e) {}
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
}

const timeout = setTimeout(() => { cleanup(); process.exit(1); }, 15000);

async function main() {
  try {
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/list`);
        const targets = await res.json();
        const page = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
        if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
      } catch (e) {}
      await new Promise(r => setTimeout(r, 250));
    }

    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

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

    // Wait 2s for initial render and QR render
    await new Promise(r => setTimeout(r, 2000));

    // Desktop screenshot
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: 1400,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    let ss = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('d:/websites_with_AI/qr_and_barcode_generator/preview_desktop.png', Buffer.from(ss.data, 'base64'));

    // Mobile screenshot (Lighthouse mobile viewport 412x823)
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: 412,
      height: 823,
      deviceScaleFactor: 2,
      mobile: true
    });
    ss = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('d:/websites_with_AI/qr_and_barcode_generator/preview_mobile.png', Buffer.from(ss.data, 'base64'));

    console.log('Screenshots captured successfully.');
    clearTimeout(timeout);
    ws.close();
    cleanup();
    process.exit(0);
  } catch (err) {
    console.error(err);
    clearTimeout(timeout);
    cleanup();
    process.exit(1);
  }
}

main();
