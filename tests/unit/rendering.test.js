/**
 * Engine Live Rendering Test Suite
 * Validates real client-side canvas and SVG rendering for all 8 core barcode and QR formats.
 */

import { engine } from '../../js/core/engine.js';
import { getAllGenerators } from '../../js/generators/registry.js';

export async function runRenderingTests(assert, testMountElement) {
  // Step 1: Initialize Engine
  const ready = await engine.init();
  assert.isTrue(ready, 'BarcodeEngine dependencies initialized successfully');

  // Create test canvas & test container
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 150;
  const container = document.createElement('div');
  container.style.width = '200px';
  container.style.height = '200px';

  testMountElement.appendChild(canvas);
  testMountElement.appendChild(container);

  const targets = { canvas, container };

  // Step 2: Test Each Registered Generator's render() method
  const generators = getAllGenerators();

  for (const gen of generators) {
    const payload = gen.schema.defaultPayload;
    const defaultOptions = {};
    if (gen.controls) {
      gen.controls.forEach(c => { defaultOptions[c.id] = c.default; });
    }

    try {
      await engine.render(gen, payload, defaultOptions, targets);
      assert.isTrue(true, `Generator '${gen.id}' rendered successfully with payload '${payload}'`);
    } catch (err) {
      assert.fail(`Generator '${gen.id}' threw rendering error: ${err.message}`);
    }
  }

  // Step 3: Test Vector SVG Generation
  const svgResult = await engine.renderBwipSVG({
    bcid: 'code128',
    text: 'TEST-SVG-OUTPUT',
    scale: 2,
    height: 25
  });

  assert.isTrue(typeof svgResult === 'string' && svgResult.includes('<svg'), 'Engine generates valid vector SVG markup');
}
