/**
 * Physical Label Maker & Thermal Roll Compositor
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Generates composite product labels (Title, Price, Barcode/QR, SKU, Footnote)
 * with 300+ DPI precision for direct thermal printers (Zebra, Rollo, MUNBYN, Brother)
 * and Avery multi-label sheets.
 */

import { loadJsPdf } from '../core/dynamic-loader.js?v=3.0';
import { AVERY_TEMPLATES, calculateLabelPositions } from './pdf-exporter.js?v=3.0';

export const LABEL_PRESETS = {
  'retail-225-125': {
    id: 'retail-225-125',
    name: 'Retail Price & Apparel (2.25" × 1.25")',
    category: 'thermal',
    widthIn: 2.25,
    heightIn: 1.25,
    widthMm: 57.15,
    heightMm: 31.75,
    description: 'Most popular retail price tag (Zebra, Rollo, MUNBYN, Brother)',
    defaultLayout: 'vertical-stack'
  },
  'asset-200-100': {
    id: 'asset-200-100',
    name: 'Compact Asset / Jewelry (2.0" × 1.0")',
    category: 'thermal',
    widthIn: 2.0,
    heightIn: 1.0,
    widthMm: 50.8,
    heightMm: 25.4,
    description: 'Compact asset barcode & jewelry price tag',
    defaultLayout: 'side-by-side'
  },
  'bin-300-200': {
    id: 'bin-300-200',
    name: 'Warehouse Shelf & Bin (3.0" × 2.0")',
    category: 'thermal',
    widthIn: 3.0,
    heightIn: 2.0,
    widthMm: 76.2,
    heightMm: 50.8,
    description: 'Warehouse rack, bin location & inventory shelf tag',
    defaultLayout: 'warehouse-bin'
  },
  'shipping-400-600': {
    id: 'shipping-400-600',
    name: 'Logistics & Shipping Box (4.0" × 6.0")',
    category: 'thermal',
    widthIn: 4.0,
    heightIn: 6.0,
    widthMm: 101.6,
    heightMm: 152.4,
    description: 'Standard carrier & carton outer shipping label',
    defaultLayout: 'vertical-stack'
  },
  'avery-5160': {
    id: 'avery-5160',
    name: 'Avery® 5160 / 8160 Compatible (2.625" × 1.0")',
    category: 'sheet',
    widthIn: 2.625,
    heightIn: 1.0,
    widthMm: 66.675,
    heightMm: 25.4,
    description: '30 labels per Letter sheet (Desktop laser / inkjet)',
    defaultLayout: 'side-by-side',
    averyTemplateId: 'avery-5160'
  },
  'avery-5163': {
    id: 'avery-5163',
    name: 'Avery® 5163 / 8163 Compatible (4.0" × 2.0")',
    category: 'sheet',
    widthIn: 4.0,
    heightIn: 2.0,
    widthMm: 101.6,
    heightMm: 50.8,
    description: '10 labels per Letter sheet (Desktop laser / inkjet)',
    defaultLayout: 'vertical-stack',
    averyTemplateId: 'avery-5163'
  },
  'avery-l7160': {
    id: 'avery-l7160',
    name: 'Avery® L7160 Compatible (63.5mm × 38.1mm)',
    category: 'sheet',
    widthIn: 2.5,
    heightIn: 1.5,
    widthMm: 63.5,
    heightMm: 38.1,
    description: '21 labels per A4 sheet (European standard)',
    defaultLayout: 'vertical-stack',
    averyTemplateId: 'avery-l7160'
  },
  'amazon-fnsku-5160': {
    id: 'amazon-fnsku-5160',
    name: 'Amazon FBA / FNSKU (1.0" × 2.625" • Avery 5160 / Thermal)',
    category: 'fba',
    widthIn: 2.625,
    heightIn: 1.0,
    widthMm: 66.675,
    heightMm: 25.4,
    description: 'Official Amazon FBA Product Label specification (Code 128 FNSKU, Title, Condition "New")',
    defaultLayout: 'amazon-fba',
    averyTemplateId: 'avery-5160'
  }
};

export const LABEL_LAYOUTS = {
  'vertical-stack': {
    id: 'vertical-stack',
    name: 'Vertical Stack',
    subtitle: 'Retail standard: Title, Price, Barcode, SKU',
    iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="7" x2="17" y2="7"/><line x1="7" y1="11" x2="13" y2="11"/><rect x="6" y="14" width="12" height="4"/></svg>`
  },
  'side-by-side': {
    id: 'side-by-side',
    name: 'Side-by-Side',
    subtitle: 'Ideal for 2D QR, Data Matrix & compact tags',
    iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="5" y="6" width="6" height="12"/><line x1="14" y1="8" x2="19" y2="8"/><line x1="14" y1="12" x2="19" y2="12"/><line x1="14" y1="16" x2="17" y2="16"/></svg>`
  },
  'warehouse-bin': {
    id: 'warehouse-bin',
    name: 'Warehouse Bin Tag',
    subtitle: 'Location header banner, large barcode & metadata',
    iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="3" y="3" width="18" height="6" fill="currentColor" fill-opacity="0.25"/><rect x="6" y="11" width="12" height="5"/><line x1="6" y1="19" x2="18" y2="19"/></svg>`
  },
  'minimal-price': {
    id: 'minimal-price',
    name: 'Minimalist Price',
    subtitle: 'Prominent price callout with centered barcode',
    iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="7" x2="13" y2="7"/><rect x="6" y="11" width="12" height="6"/><line x1="8" y1="19" x2="16" y2="19"/></svg>`
  },
  'amazon-fba': {
    id: 'amazon-fba',
    name: 'Amazon FBA / FNSKU',
    subtitle: 'Amazon compliance: Title, Code 128 Barcode, FNSKU, Condition "New"',
    iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="6" y1="6" x2="18" y2="6"/><rect x="5" y="9" width="14" height="8"/><line x1="6" y1="20" x2="12" y2="20"/></svg>`
  }
};

/**
 * Wraps text into multiple lines fitting maxWidth
 */
function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

/**
 * Draws an image with aspect ratio preservation
 */
function drawImageAspect(ctx, img, targetX, targetY, targetW, targetH, align = 'center') {
  if (!img) return;
  const imgW = img.naturalWidth || img.videoWidth || img.width || 1;
  const imgH = img.naturalHeight || img.videoHeight || img.height || 1;
  const aspect = imgW / imgH;

  let drawW = targetW;
  let drawH = drawW / aspect;

  if (drawH > targetH) {
    drawH = targetH;
    drawW = drawH * aspect;
  }

  let drawX = targetX;
  if (align === 'center') {
    drawX = targetX + (targetW - drawW) / 2;
  } else if (align === 'right') {
    drawX = targetX + (targetW - drawW);
  }
  const drawY = targetY + (targetH - drawH) / 2;

  // Nearest-neighbour scaling keeps bar/module edges sharp (smoothing blurred them into grey).
  const smoothing = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.imageSmoothingEnabled = smoothing;
}

/**
 * Renders a composite physical product label onto the provided HTML5 canvas.
 */
export function renderLabelToCanvas(canvas, {
  presetId = 'retail-225-125',
  layoutId = 'vertical-stack',
  title = 'Organic Dark Roast Coffee',
  currency = '$',
  price = '14.99',
  isPriceBold = true,
  sku = 'SKU: DRK-16OZ',
  footnote = 'Store #104 • Best Before 12/26',
  showCutline = false,
  showCodeText = true,
  codeImage = null,
  isSquare2D = false
} = {}) {
  const preset = LABEL_PRESETS[presetId] || LABEL_PRESETS['retail-225-125'];
  const layout = LABEL_LAYOUTS[layoutId] || LABEL_LAYOUTS['vertical-stack'];

  // Base canvas resolution: 300 DPI equivalent for crisp thermal printing
  const DPI = 300;
  const canvasW = Math.round(preset.widthIn * DPI);
  const canvasH = Math.round(preset.heightIn * DPI);

  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');

  // Background fill
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Optical padding
  const padX = Math.round(canvasW * 0.05);
  const padY = Math.round(canvasH * 0.06);
  const innerW = canvasW - (padX * 2);
  const innerH = canvasH - (padY * 2);

  // Optional cutline / border guide
  if (showCutline) {
    ctx.save();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(6, 6, canvasW - 12, canvasH - 12);
    ctx.restore();
  }

  // Format Price String
  let formattedPrice = '';
  if (price && price.trim().length > 0) {
    const symbol = currency === 'none' ? '' : (currency || '$');
    formattedPrice = `${symbol}${price.trim()}`;
  }

  ctx.fillStyle = '#0f172a';
  ctx.textBaseline = 'top';

  if (layout.id === 'vertical-stack') {
    // -------------------------------------------------------------
    // Layout 1: Vertical Stack (Retail Standard)
    // -------------------------------------------------------------
    let currentY = padY;

    // Header Row: Title & Price
    ctx.font = 'bold 22px "Space Grotesk", -apple-system, sans-serif';
    const priceFont = isPriceBold 
      ? '800 32px "Space Grotesk", -apple-system, sans-serif' 
      : '600 28px "Space Grotesk", -apple-system, sans-serif';

    let priceWidth = 0;
    if (formattedPrice) {
      ctx.font = priceFont;
      priceWidth = ctx.measureText(formattedPrice).width + 16;
    }

    // Title lines
    ctx.font = 'bold 22px "Space Grotesk", -apple-system, sans-serif';
    const titleLines = wrapText(ctx, title, innerW - priceWidth);
    const titleLineH = 26;

    titleLines.slice(0, 2).forEach((line, idx) => {
      ctx.fillText(line, padX, currentY + (idx * titleLineH));
    });

    // Draw Price (Top Right)
    if (formattedPrice) {
      ctx.font = priceFont;
      ctx.textAlign = 'right';
      ctx.fillText(formattedPrice, padX + innerW, currentY);
      ctx.textAlign = 'left';
    }

    const headerHeight = Math.max(titleLines.length * titleLineH, formattedPrice ? 36 : 24);
    currentY += headerHeight + 8;

    // Footer Space Calculation (SKU & Footnote)
    const hasSku = Boolean(sku && sku.trim().length > 0);
    const hasFootnote = Boolean(footnote && footnote.trim().length > 0);
    let footerHeight = 0;
    if (hasSku) footerHeight += 22;
    if (hasFootnote) footerHeight += 18;

    const availableCodeH = (padY + innerH) - currentY - footerHeight - 8;

    // Draw Barcode / QR Graphic
    if (codeImage && availableCodeH > 30) {
      drawImageAspect(ctx, codeImage, padX, currentY, innerW, availableCodeH, 'center');
    }

    // Draw Footer Text
    let footerY = padY + innerH - footerHeight;
    if (hasSku) {
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(sku.trim(), padX + (innerW / 2), footerY);
      footerY += 22;
    }
    if (hasFootnote) {
      ctx.font = '500 14px "Nunito", -apple-system, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(footnote.trim(), padX + (innerW / 2), footerY);
      ctx.fillStyle = '#0f172a';
    }
    ctx.textAlign = 'left';

  } else if (layout.id === 'side-by-side') {
    // -------------------------------------------------------------
    // Layout 2: Side-by-Side (Split) - Ideal for QR & compact tags
    // -------------------------------------------------------------
    const splitRatio = isSquare2D ? 0.44 : 0.48;
    const leftW = Math.round(innerW * splitRatio);
    const rightX = padX + leftW + 16;
    const rightW = innerW - leftW - 16;

    // Draw Barcode/QR on Left Side
    if (codeImage) {
      drawImageAspect(ctx, codeImage, padX, padY, leftW, innerH, 'center');
    }

    // Draw Metadata on Right Side
    let rightY = padY + 4;

    // Title
    if (title) {
      ctx.font = 'bold 22px "Space Grotesk", -apple-system, sans-serif';
      const titleLines = wrapText(ctx, title, rightW);
      titleLines.slice(0, 2).forEach((line) => {
        ctx.fillText(line, rightX, rightY);
        rightY += 26;
      });
      rightY += 6;
    }

    // Price
    if (formattedPrice) {
      ctx.font = isPriceBold 
        ? '800 36px "Space Grotesk", -apple-system, sans-serif' 
        : '600 30px "Space Grotesk", -apple-system, sans-serif';
      ctx.fillText(formattedPrice, rightX, rightY);
      rightY += 40;
    }

    // SKU
    if (sku && sku.trim().length > 0) {
      ctx.font = '700 17px "JetBrains Mono", monospace';
      ctx.fillText(sku.trim(), rightX, rightY);
      rightY += 24;
    }

    // Footnote
    if (footnote && footnote.trim().length > 0) {
      ctx.font = '500 13px "Nunito", -apple-system, sans-serif';
      ctx.fillStyle = '#64748b';
      const noteLines = wrapText(ctx, footnote, rightW);
      noteLines.slice(0, 2).forEach((line) => {
        ctx.fillText(line, rightX, rightY);
        rightY += 18;
      });
      ctx.fillStyle = '#0f172a';
    }

  } else if (layout.id === 'warehouse-bin') {
    // -------------------------------------------------------------
    // Layout 3: Warehouse Bin & Shelf Tag
    // -------------------------------------------------------------
    let currentY = padY;

    // Top Location Header Banner
    const bannerH = 44;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(padX, currentY, innerW, bannerH);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 24px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    const headerText = (footnote && footnote.trim().length > 0) 
      ? footnote.trim() 
      : (sku || 'AISLE 01 • BIN A-01');
    ctx.fillText(headerText, padX + (innerW / 2), currentY + 10);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';

    currentY += bannerH + 12;

    // Bottom Metadata height
    let footerH = 0;
    if (title) footerH += 26;
    if (sku) footerH += 22;

    const availableCodeH = (padY + innerH) - currentY - footerH - 6;

    // Large Center Barcode
    if (codeImage && availableCodeH > 40) {
      drawImageAspect(ctx, codeImage, padX, currentY, innerW, availableCodeH, 'center');
    }

    // Bottom Description & Details
    let metaY = padY + innerH - footerH;
    if (title) {
      ctx.font = 'bold 20px "Space Grotesk", -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, padX + (innerW / 2), metaY);
      metaY += 26;
    }
    if (sku) {
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(sku, padX + (innerW / 2), metaY);
    }
    ctx.textAlign = 'left';

  } else if (layout.id === 'minimal-price') {
    // -------------------------------------------------------------
    // Layout 4: Minimalist Price Callout
    // -------------------------------------------------------------
    let currentY = padY;

    // Prominent Top Price Tag
    if (formattedPrice) {
      ctx.font = '800 46px "Space Grotesk", -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(formattedPrice, padX + (innerW / 2), currentY);
      currentY += 54;
    } else if (title) {
      ctx.font = 'bold 26px "Space Grotesk", -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, padX + (innerW / 2), currentY);
      currentY += 34;
    }

    const footerH = 26;
    const availableCodeH = (padY + innerH) - currentY - footerH - 8;

    if (codeImage && availableCodeH > 35) {
      drawImageAspect(ctx, codeImage, padX, currentY, innerW, availableCodeH, 'center');
    }

    // Small Clean Bottom SKU/Title
    const bottomText = sku || title || footnote || '';
    if (bottomText) {
      ctx.font = '600 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#475569';
      ctx.fillText(bottomText, padX + (innerW / 2), padY + innerH - 20);
      ctx.fillStyle = '#0f172a';
    }
    ctx.textAlign = 'left';
  } else if (layout.id === 'amazon-fba') {
    // -------------------------------------------------------------
    // Layout 5: Amazon FBA / FNSKU Fulfillment Standard
    // -------------------------------------------------------------
    let currentY = padY;

    // 1. Top Title (Amazon specifies 1-2 lines, clean sans-serif)
    ctx.font = '600 20px "Space Grotesk", -apple-system, sans-serif';
    const labelTitle = title || 'Amazon FBA Product Label';
    const titleLines = wrapText(ctx, labelTitle, innerW);
    const maxTitleLines = Math.min(titleLines.length, 2);
    for (let i = 0; i < maxTitleLines; i++) {
      ctx.fillText(titleLines[i], padX, currentY);
      currentY += 24;
    }
    currentY += 4;

    // Bottom info height: FNSKU text + Condition line
    const bottomH = 44;
    const availableCodeH = (padY + innerH) - currentY - bottomH - 4;

    // 2. Center Code 128 / Barcode
    if (codeImage && availableCodeH > 30) {
      drawImageAspect(ctx, codeImage, padX, currentY, innerW, availableCodeH, 'center');
    }

    // 3. FNSKU text & Condition Note (e.g. "New")
    let botY = padY + innerH - bottomH;
    const fnskuText = sku || 'X003SAMPLE';
    ctx.font = '700 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(fnskuText, padX + (innerW / 2), botY);
    botY += 22;

    const condText = footnote || 'New';
    ctx.font = '600 15px "Space Grotesk", -apple-system, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(condText, padX + (innerW / 2), botY);
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
  }
}

/**
 * Triggers a 300 DPI PNG download of the rendered label
 */
export function exportLabelPng(canvas, filename = 'product-label.png') {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, 'image/png');
}

/**
 * Exports a single vector PDF matching exact physical roll dimensions
 */
export async function exportSingleLabelPdf({
  canvas,
  presetId = 'retail-225-125',
  filename = ''
}) {
  const jsPDF = await loadJsPdf();
  const preset = LABEL_PRESETS[presetId] || LABEL_PRESETS['retail-225-125'];
  const isLandscape = preset.widthMm >= preset.heightMm;

  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [preset.widthMm, preset.heightMm]
  });

  const imgData = canvas.toDataURL('image/png');
  doc.addImage(imgData, 'PNG', 0, 0, preset.widthMm, preset.heightMm);

  const outName = filename || `label-${preset.id}-${Date.now()}.pdf`;
  doc.save(outName);
  return { success: true, filename: outName };
}

/**
 * Replicates the composite label across a multi-up Avery sheet
 */
export async function exportLabelSheetPdf({
  canvas,
  templateId = 'avery-5160',
  quantity = 30,
  filename = ''
}) {
  const jsPDF = await loadJsPdf();
  const effectiveTplId = templateId || 'avery-5160';
  const tpl = AVERY_TEMPLATES[effectiveTplId] || AVERY_TEMPLATES['avery-5160'];

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: tpl.unit,
    format: tpl.format
  });

  const { positions } = calculateLabelPositions(effectiveTplId, quantity);
  const imgData = canvas.toDataURL('image/png');

  positions.forEach((pos) => {
    doc.addImage(imgData, 'PNG', pos.x, pos.y, pos.width, pos.height);
  });

  const outName = filename || `sheet-${effectiveTplId}-${Date.now()}.pdf`;
  doc.save(outName);
  return { success: true, count: positions.length, filename: outName };
}

/**
 * Prepares DOM and triggers browser thermal print with exact @page dimensions
 */
export function printThermalRoll({ canvas, presetId = 'retail-225-125' }) {
  const preset = LABEL_PRESETS[presetId] || LABEL_PRESETS['retail-225-125'];

  // Update dynamic @page CSS
  let styleEl = document.getElementById('label-dynamic-print-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'label-dynamic-print-style';
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    @media print {
      @page {
        size: ${preset.widthIn}in ${preset.heightIn}in;
        margin: 0;
      }
      body * {
        visibility: hidden !important;
      }
      #label-print-target, #label-print-target * {
        visibility: visible !important;
      }
      #label-print-target {
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      #label-print-target img {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
      }
    }
  `;

  // Inject rendered label into print target
  let printTarget = document.getElementById('label-print-target');
  if (!printTarget) {
    printTarget = document.createElement('div');
    printTarget.id = 'label-print-target';
    document.body.appendChild(printTarget);
  }

  const dataUrl = canvas.toDataURL('image/png');
  printTarget.innerHTML = `<img src="${dataUrl}" alt="Print Label Preview">`;

  // Trigger browser print dialog
  setTimeout(() => {
    window.print();
  }, 100);
}
