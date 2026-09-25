/**
 * Export & PDF Engine Unit Tests
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Verifies Avery label sheet mathematics, coordinate placements, page boundaries,
 * vector SVG schema compliance, and dynamic jsPDF loading.
 */

import { AVERY_TEMPLATES, calculateLabelPositions } from '../../js/export/pdf-exporter.js';
import { engine, applyCanvasCornerRadius } from '../../js/core/engine.js';
import { loadJsPdf } from '../../js/core/dynamic-loader.js';
import { applySvgCornerRadius } from '../../js/export/image-exporter.js';

export async function runExportTests(assert) {
  // Test 1: Avery Template Definitions
  assert.isTrue(Boolean(AVERY_TEMPLATES['avery-5160']), 'Avery 5160 template is defined');
  assert.isTrue(Boolean(AVERY_TEMPLATES['avery-5163']), 'Avery 5163 template is defined');
  assert.isTrue(Boolean(AVERY_TEMPLATES['avery-l7160']), 'Avery L7160 template is defined');
  assert.isTrue(Boolean(AVERY_TEMPLATES['single-center']), 'Single Centered Display template is defined');

  // Test 2: Avery 5160 Math Specifications
  const tpl5160 = AVERY_TEMPLATES['avery-5160'];
  assert.equal(tpl5160.cols, 3, 'Avery 5160 has 3 columns');
  assert.equal(tpl5160.rows, 10, 'Avery 5160 has 10 rows');
  assert.equal(tpl5160.perSheet, 30, 'Avery 5160 holds 30 labels per sheet');
  assert.equal(tpl5160.format, 'letter', 'Avery 5160 uses standard US Letter paper');

  // Test 3: Label Position Coordinate Calculation
  const { template: resTpl, positions: pos30 } = calculateLabelPositions('avery-5160', 30);
  assert.equal(pos30.length, 30, 'Calculates all 30 label positions for Avery 5160');

  // First label at (col 0, row 0)
  const firstLabel = pos30[0];
  assert.equal(firstLabel.col, 0, 'First label is column 0');
  assert.equal(firstLabel.row, 0, 'First label is row 0');
  assert.equal(firstLabel.x, resTpl.marginLeft, 'First label X starts at left margin');
  assert.equal(firstLabel.y, resTpl.marginTop, 'First label Y starts at top margin');

  // Second label at (col 1, row 0)
  const secondLabel = pos30[1];
  assert.equal(secondLabel.col, 1, 'Second label is column 1');
  assert.equal(secondLabel.row, 0, 'Second label is row 0');
  const expectedCol2X = resTpl.marginLeft + resTpl.labelWidth + resTpl.gutterH;
  assert.equal(Math.round(secondLabel.x * 100), Math.round(expectedCol2X * 100), 'Second label X respects width + horizontal gutter');

  // Fourth label at (col 0, row 1)
  const fourthLabel = pos30[3];
  assert.equal(fourthLabel.col, 0, 'Fourth label is in column 0');
  assert.equal(fourthLabel.row, 1, 'Fourth label is in row 1');
  const expectedRow2Y = resTpl.marginTop + resTpl.labelHeight + resTpl.gutterV;
  assert.equal(Math.round(fourthLabel.y * 100), Math.round(expectedRow2Y * 100), 'Fourth label Y respects height + vertical gutter');

  // Test 4: Boundary Validation (No labels overflow the physical sheet)
  const lastLabel = pos30[29];
  const lastRightEdge = lastLabel.x + lastLabel.width;
  const lastBottomEdge = lastLabel.y + lastLabel.height;
  assert.isTrue(lastRightEdge <= resTpl.pageWidth, `Last label right edge (${lastRightEdge.toFixed(1)}mm) fits within page width (${resTpl.pageWidth}mm)`);
  assert.isTrue(lastBottomEdge <= resTpl.pageHeight, `Last label bottom edge (${lastBottomEdge.toFixed(1)}mm) fits within page height (${resTpl.pageHeight}mm)`);

  // Test 5: Partial Sheet Quantity Limiting
  const { positions: pos12 } = calculateLabelPositions('avery-5160', 12);
  assert.equal(pos12.length, 12, 'Partial sheet accurately limits positions to requested quantity (12)');

  // Test 6: Avery 5163 Shipping Labels Math
  const { template: tpl63, positions: pos10 } = calculateLabelPositions('avery-5163', 10);
  assert.equal(pos10.length, 10, 'Avery 5163 calculates 10 shipping label positions');
  const lastShippingLabel = pos10[9];
  assert.isTrue((lastShippingLabel.x + lastShippingLabel.width) <= tpl63.pageWidth, 'Shipping labels fit within letter page width');
  assert.isTrue((lastShippingLabel.y + lastShippingLabel.height) <= tpl63.pageHeight, 'Shipping labels fit within letter page height');

  // Test 7: Avery European L7160 (A4)
  const { template: tplL7, positions: pos21 } = calculateLabelPositions('avery-l7160', 21);
  assert.equal(pos21.length, 21, 'Avery L7160 calculates 21 European A4 label positions');
  assert.equal(tplL7.format, 'a4', 'Uses A4 page format');
  const lastA4Label = pos21[20];
  assert.isTrue((lastA4Label.x + lastA4Label.width) <= tplL7.pageWidth, 'A4 labels fit within A4 width (210mm)');
  assert.isTrue((lastA4Label.y + lastA4Label.height) <= tplL7.pageHeight, 'A4 labels fit within A4 height (297mm)');

  // Test 8: Vector SVG Output Conformance
  const svgOutput = await engine.renderBwipSVG({
    bcid: 'code128',
    text: 'PRINT-TEST-2026',
    scale: 3
  });
  assert.isTrue(svgOutput.includes('<svg'), 'Vector SVG generation contains opening <svg tag');
  assert.isTrue(svgOutput.includes('xmlns="http://www.w3.org/2000/svg"'), 'Vector SVG defines SVG namespace');
  assert.isTrue(svgOutput.includes('</svg>'), 'Vector SVG properly terminates with </svg>');

  // Test 9: Dynamic jsPDF Loading
  const jsPdfClass = await loadJsPdf();
  assert.isTrue(typeof jsPdfClass === 'function', 'loadJsPdf() successfully resolves the jsPDF constructor');
  const testDoc = new jsPdfClass({ format: 'a4', unit: 'mm' });
  assert.isTrue(typeof testDoc.save === 'function', 'Instantiated jsPDF document exposes .save() method');
  assert.isTrue(typeof testDoc.addImage === 'function', 'Instantiated jsPDF document exposes .addImage() method');

  // Test 10: Vector SVG Corner Radius Masking
  const rawSvg = await engine.renderBwipSVG({
    bcid: 'code128',
    text: 'RADIUS-TEST',
    scale: 2
  });
  const unroundedSvg = applySvgCornerRadius(rawSvg, 0);
  assert.equal(unroundedSvg, rawSvg, 'applySvgCornerRadius with radius 0 preserves original SVG verbatim');

  const roundedSvg = applySvgCornerRadius(rawSvg, 18);
  assert.isTrue(roundedSvg.includes('<clipPath'), 'Rounded SVG includes <clipPath> definition');
  assert.isTrue(roundedSvg.includes('rx="18"'), 'Rounded SVG includes rx="18" attribute on clip rect');
  assert.isTrue(roundedSvg.includes('ry="18"'), 'Rounded SVG includes ry="18" attribute on clip rect');
  assert.isTrue(roundedSvg.includes('clip-path="url(#ucm-rounded-corners-'), 'Rounded SVG applies clip-path URL to inner group');

  // Test 11: Canvas Corner Radius Clipping
  assert.isTrue(typeof applyCanvasCornerRadius === 'function', 'applyCanvasCornerRadius is exported function');
  const testCanvas = document.createElement('canvas');
  testCanvas.width = 200;
  testCanvas.height = 100;
  const ctx = testCanvas.getContext('2d');
  ctx.fillStyle = '#003366';
  ctx.fillRect(0, 0, 200, 100);
  applyCanvasCornerRadius(testCanvas, 14);
  assert.equal(testCanvas.width, 200, 'Canvas width is preserved after corner radius clipping');
  assert.equal(testCanvas.height, 100, 'Canvas height is preserved after corner radius clipping');

  // Test 12: Universal Quiet Zone Padding
  const padSvg = await engine.renderBwipSVG({
    bcid: 'code128',
    text: 'PADDING-TEST',
    scale: 2,
    padding: 20
  });
  assert.isTrue(padSvg.includes('<svg'), 'SVG with custom padding generates cleanly');
  assert.isTrue(padSvg.includes('width="') && padSvg.includes('height="'), 'SVG contains explicit dimensions');
}
