/**
 * Avery Printable Label Sheet & Document PDF Exporter
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Compiles multi-label Avery sticker sheets (5160, 5163, L7160) and single signs
 * directly in client-side browser memory using jsPDF.
 */

import { loadJsPdf, loadQRCodeStyling } from '../core/dynamic-loader.js?v=2.7';
import { engine } from '../core/engine.js?v=2.7';
import { computeEan13, computeUpcA } from '../core/checksums.js?v=2.7';

export const AVERY_TEMPLATES = {
  'avery-5160': {
    id: 'avery-5160',
    name: 'Avery 5160 / 8160 (Address Labels)',
    description: '30 labels per sheet (3 cols × 10 rows, 2.625" × 1.0")',
    format: 'letter',
    unit: 'mm',
    pageWidth: 215.9,
    pageHeight: 279.4,
    cols: 3,
    rows: 10,
    perSheet: 30,
    labelWidth: 66.675,
    labelHeight: 25.4,
    marginTop: 12.7,
    marginLeft: 4.76,
    gutterH: 3.175,
    gutterV: 0
  },
  'avery-5163': {
    id: 'avery-5163',
    name: 'Avery 5163 / 8163 (Shipping Labels)',
    description: '10 labels per sheet (2 cols × 5 rows, 4.0" × 2.0")',
    format: 'letter',
    unit: 'mm',
    pageWidth: 215.9,
    pageHeight: 279.4,
    cols: 2,
    rows: 5,
    perSheet: 10,
    labelWidth: 101.6,
    labelHeight: 50.8,
    marginTop: 12.7,
    marginLeft: 4.0,
    gutterH: 4.76,
    gutterV: 0
  },
  'avery-l7160': {
    id: 'avery-l7160',
    name: 'Avery L7160 / J8160 (A4 European Standard)',
    description: '21 labels per sheet (3 cols × 7 rows, 63.5mm × 38.1mm)',
    format: 'a4',
    unit: 'mm',
    pageWidth: 210,
    pageHeight: 297,
    cols: 3,
    rows: 7,
    perSheet: 21,
    labelWidth: 63.5,
    labelHeight: 38.1,
    marginTop: 15.1,
    marginLeft: 7.2,
    gutterH: 2.5,
    gutterV: 0
  },
  'single-center': {
    id: 'single-center',
    name: 'Single Centered Display Sign (A4 / Letter)',
    description: '1 large prominent code centered with title and caption',
    format: 'a4',
    unit: 'mm',
    pageWidth: 210,
    pageHeight: 297,
    cols: 1,
    rows: 1,
    perSheet: 1,
    labelWidth: 160,
    labelHeight: 160,
    marginTop: 45,
    marginLeft: 25,
    gutterH: 0,
    gutterV: 0
  }
};

/**
 * Calculates (x, y) bounding boxes for all labels on a sheet
 */
export function calculateLabelPositions(templateId, quantity = 30) {
  const tpl = AVERY_TEMPLATES[templateId] || AVERY_TEMPLATES['avery-5160'];
  const positions = [];
  const maxLabels = Math.min(quantity, tpl.perSheet);

  for (let i = 0; i < maxLabels; i++) {
    const col = i % tpl.cols;
    const row = Math.floor(i / tpl.cols);

    const x = tpl.marginLeft + col * (tpl.labelWidth + tpl.gutterH);
    const y = tpl.marginTop + row * (tpl.labelHeight + tpl.gutterV);

    positions.push({
      index: i,
      col,
      row,
      x,
      y,
      width: tpl.labelWidth,
      height: tpl.labelHeight
    });
  }

  return { template: tpl, positions };
}

/**
 * Renders an in-memory barcode image data URL for embedding in PDF
 */
async function getCodeImageDataUrl(generator, payload, options, logoDataUrl = '') {
  if (generator.id === 'qr-code') {
    const QRCodeStyling = await loadQRCodeStyling();
    const hasLogo = Boolean(logoDataUrl && logoDataUrl.trim().length > 0);

    const dotsOptions = {
      type: options.dotsType || 'rounded',
      color: options.dotsColor || '#000000'
    };

    if (options.gradientEnabled) {
      const rotationRad = ((Number(options.gradientRotation) || 45) * Math.PI) / 180;
      dotsOptions.gradient = {
        type: options.gradientType || 'linear',
        rotation: rotationRad,
        colorStops: [
          { offset: 0, color: options.gradientColor1 || '#000000' },
          { offset: 1, color: options.gradientColor2 || '#000000' }
        ]
      };
    }

    const qrInstance = new QRCodeStyling({
      width: 600,
      height: 600,
      type: 'canvas',
      data: payload,
      image: hasLogo ? logoDataUrl : '',
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.28,
        margin: 4,
        crossOrigin: 'anonymous'
      },
      dotsOptions: dotsOptions,
      cornersSquareOptions: {
        color: options.cornerColor || '#000000',
        type: options.cornerType || 'extra-rounded'
      },
      cornersDotOptions: {
        color: options.cornerDotColor || options.cornerColor || '#000000',
        type: options.cornerDotType || 'dot'
      },
      backgroundOptions: {
        color: '#ffffff'
      },
      qrOptions: {
        errorCorrectionLevel: hasLogo ? 'H' : (options.errorCorrectionLevel || 'M')
      }
    });

    const blob = await qrInstance.getRawData('png');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  // bwip-js barcode rendering
  const canvas = document.createElement('canvas');
  const is2DCode = ['data-matrix', 'aztec', 'pdf417'].includes(generator.id);

  let finalPayload = payload;
  if (generator.id === 'upc-a' && payload.length === 11) {
    finalPayload = computeUpcA(payload);
  } else if (generator.id === 'ean-13' && payload.length === 12) {
    finalPayload = computeEan13(payload);
  }

  const bwipOpts = {
    bcid: generator.id === 'data-matrix' ? 'datamatrix' :
          generator.id === 'aztec' ? 'azteccode' :
          generator.id === 'pdf417' ? 'pdf417' :
          generator.id === 'ean-13' ? 'ean13' :
          generator.id === 'upc-a' ? 'upca' :
          generator.id === 'itf-14' ? 'itf14' : 'code128',
    text: finalPayload,
    scale: 4,
    includetext: true,
    textxalign: 'center',
    guardwhitespace: ['ean-13', 'upc-a'].includes(generator.id),
    backgroundcolor: 'FFFFFF'
  };

  if (!is2DCode && options.height) {
    bwipOpts.height = Number(options.height) || 35;
  }
  if (generator.id === 'pdf417' && Number(options.columns) > 0) {
    bwipOpts.columns = Number(options.columns);
  }

  await engine.renderBwipCanvas(canvas, bwipOpts);
  return canvas.toDataURL('image/png');
}

/**
 * Generates and downloads a print-ready PDF label sheet
 */
export async function generatePdfLabelSheet({
  generator,
  payload,
  options = {},
  logoDataUrl = '',
  templateId,
  templateKey,
  quantity = 30,
  sheetTitle = 'Barcodes & QR Labels',
  showCaption = true,
  canvasOrDataUrl = null,
  caption = '',
  download = true
}) {
  const jsPDF = await loadJsPdf();
  const effectiveTemplateId = templateId || templateKey || 'avery-5160';
  const tpl = AVERY_TEMPLATES[effectiveTemplateId] || AVERY_TEMPLATES['avery-5160'];
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: tpl.unit,
    format: tpl.format
  });

  const { positions } = calculateLabelPositions(effectiveTemplateId, quantity);

  // Extract or render code image
  let imgDataUrl = '';
  if (canvasOrDataUrl) {
    if (typeof canvasOrDataUrl === 'string') {
      imgDataUrl = canvasOrDataUrl;
    } else if (canvasOrDataUrl.toDataURL) {
      imgDataUrl = canvasOrDataUrl.toDataURL('image/png');
    }
  }

  const effectiveGen = generator || { id: 'code128', name: 'Code 128' };
  const effectivePayload = payload || caption || 'SAMPLE';

  if (!imgDataUrl) {
    imgDataUrl = await getCodeImageDataUrl(effectiveGen, effectivePayload, options, logoDataUrl);
  }

  const genId = effectiveGen.id || 'code128';
  const isQrOrSquare2D = ['qr-code', 'data-matrix', 'aztec'].includes(genId);

  if (effectiveTemplateId === 'single-center') {
    // Single Large Center Sign
    if (sheetTitle) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text(sheetTitle, tpl.pageWidth / 2, 32, { align: 'center' });
    }

    const imgSize = isQrOrSquare2D ? 120 : 150;
    const imgHeight = isQrOrSquare2D ? 120 : (genId === 'pdf417' ? 60 : 50);
    const imgX = (tpl.pageWidth - imgSize) / 2;
    const imgY = 55;

    doc.addImage(imgDataUrl, 'PNG', imgX, imgY, imgSize, imgHeight);

    if (showCaption) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.text(effectivePayload, tpl.pageWidth / 2, imgY + imgHeight + 15, { align: 'center', maxWidth: 170 });
    }

    const filename = `sign-${genId}-${Date.now()}.pdf`;
    if (download) {
      doc.save(filename);
    }
    doc.filename = filename;
    doc.count = 1;
    return doc;
  }

  // Multi-label Avery Sheet
  positions.forEach((pos) => {
    const pad = 2.0; // 2mm internal cell padding
    const cellW = pos.width - (pad * 2);
    const cellH = pos.height - (pad * 2);

    let drawW, drawH, drawX, drawY;

    if (isQrOrSquare2D) {
      // Keep square aspect ratio
      const side = Math.min(cellW, cellH);
      drawW = side;
      drawH = side;
      drawX = pos.x + pad + ((cellW - side) / 2);
      drawY = pos.y + pad + ((cellH - side) / 2);
    } else {
      // 1D or stacked barcode
      const aspect = genId === 'pdf417' ? 2.5 : 3.0;
      drawW = Math.min(cellW, cellH * aspect);
      drawH = drawW / aspect;
      drawX = pos.x + pad + ((cellW - drawW) / 2);
      drawY = pos.y + pad + ((cellH - drawH) / 2);
    }

    doc.addImage(imgDataUrl, 'PNG', drawX, drawY, drawW, drawH);
  });

  const filename = `${effectiveTemplateId}-${genId}-${Date.now()}.pdf`;
  if (download) {
    doc.save(filename);
  }
  doc.filename = filename;
  doc.count = positions.length;
  return doc;
}
