/**
 * UniversalCodeMaker V2 — Optical Studio Orchestrator
 * Design System: Neubrutalist Precision Optical Workbench
 * 100% V1 Parity + Restored Controls + Tactile Enhancements
 */

import { engine } from './core/engine.js';
import { prefetchEngines } from './core/dynamic-loader.js';
import {
  getAllGenerators,
  getGenerator,
  getGeneratorsByCategory,
  getCategories
} from './generators/registry.js';
import { getAllWizards, getWizard } from './wizards/qr-wizards.js';
import { LOGO_PRESETS } from './core/logo-presets.js';
import { exportHighResPng, exportVectorSvg, copyImageToClipboard } from './export/image-exporter.js';
import { generatePdfLabelSheet, AVERY_TEMPLATES } from './export/pdf-exporter.js';
import { generateSequenceList, parseCsvOrLines, generateBatchZip } from './export/batch-exporter.js';
import { computeEan13, computeUpcA, calculateMod10 } from './core/checksums.js';
import { initCookieBanner } from './core/cookie-banner.js';
import {
  LABEL_PRESETS,
  LABEL_LAYOUTS,
  renderLabelToCanvas,
  exportLabelPng,
  exportSingleLabelPdf,
  exportLabelSheetPdf,
  printThermalRoll
} from './export/label-maker.js';

class V2StudioApp {
  constructor() {
    this.engine = engine;
    this.currentGenerator = null;
    this.activeCategory = 'all';
    this.debounceTimer = null;
    this.currentOptions = {};

    // QR Wizard & Customization State
    this.activeWizardId = 'url';
    this.activeLogoDataUrl = '';
    this.activeLogoPresetId = 'none';
    this.activeScaleFactor = 2; // Default to 2x for sharp print quality

    // QR Styling Options (100% V1 Parity)
    this.qrOptions = {
      errorCorrectionLevel: 'M',
      dotsType: 'rounded',
      dotsColor: '#0f1117',
      backgroundColor: '#ffffff',
      transparentBg: false,
      gradientEnabled: false,
      gradientColor1: '#06b6d4',
      gradientColor2: '#3b82f6',
      gradientRotation: 45,
      cornerType: 'extra-rounded',
      cornerColor: '#0f1117',
      cornerDotType: 'dot',
      cornerDotColor: '#06b6d4'
    };

    // Barcode 1D/2D Styling State
    this.barcodeOptions = {
      barColor: '#0f1117',
      bgColor: '#ffffff',
      transparentBg: false
    };

    // Laser Scan Beam FX State
    this.laserFxEnabled = true;

    // Tactical Accent State
    this.activeAccent = 'crimson';

    // Batch State
    this.activeBatchMode = 'seq'; // 'seq' or 'csv'

    // Physical Label Maker State
    this.labelState = {
      presetId: 'retail-225-125',
      layoutId: 'vertical-stack'
    };

    // DOM Elements Cache
    this.dom = {};
  }

  async init() {
    this.cacheDom();
    this.initTheme();
    this.initAccentSystem();
    this.renderCategoryPills();
    this.populateSymbologySelect();
    this.renderWizardNav();
    this.renderLogoPresets();
    this.renderSymbologyMatrix();
    this.renderHistoryChips();
    this.bindEvents();
    this.bindBarcodeStylingEvents();
    this.bindLaserFxEvents();
    this.bindLogoStudioEvents();
    this.bindBatchModalEvents();
    this.bindPdfModalEvents();
    this.bindLabelMakerEvents();
    this.updateBatchSeqPreview();

    // Prefetch engines in background
    prefetchEngines();

    // Initialize Privacy & GDPR Consent Notice
    initCookieBanner();

    // Parse URL Search Parameters (Deep linking from Programmatic SEO landing pages)
    const urlParams = new URLSearchParams(window.location.search);
    const paramSymbology = urlParams.get('symbology') || urlParams.get('format');
    const paramWizard = urlParams.get('wizard');
    const paramPayload = urlParams.get('payload') || urlParams.get('data');

    let targetGenId = 'qr-code';
    if (paramSymbology && getGenerator(paramSymbology)) {
      targetGenId = paramSymbology;
    }

    const initialGen = getGenerator(targetGenId) || getAllGenerators()[0];
    this.selectGenerator(initialGen.id);

    if (paramWizard && targetGenId === 'qr-code' && getWizard(paramWizard)) {
      this.selectWizard(paramWizard);
    }

    if (paramPayload && targetGenId !== 'qr-code') {
      this.dom.payloadInput.value = paramPayload;
      this.scheduleRender();
    }
  }

  cacheDom() {
    this.dom = {
      themeToggleBtn: document.getElementById('theme-toggle-btn'),
      categoryPills: document.getElementById('category-pills'),
      symbologySelect: document.getElementById('symbology-select'),
      symbologyDesc: document.getElementById('symbology-desc'),
      
      // Dynamic Controls & Payload
      standardPayloadGroup: document.getElementById('standard-payload-group'),
      payloadInput: document.getElementById('payload-input'),
      autoChecksumBtn: document.getElementById('auto-checksum-btn'),
      validationStatus: document.getElementById('validation-status'),
      dynamicControlsDeck: document.getElementById('dynamic-controls-deck'),
      dynamicControlsGrid: document.getElementById('dynamic-controls-grid'),

      // QR Wizards
      qrWizardSection: document.getElementById('qr-wizard-section'),
      qrWizardNav: document.getElementById('qr-wizard-nav'),
      wizardFormContainer: document.getElementById('wizard-form-container'),
      
      // Styling Accordion
      stylingAccordion: document.getElementById('styling-accordion'),
      ctrlErrorCorrectionLevel: document.getElementById('ctrl-errorCorrectionLevel'),
      ctrlDotsType: document.getElementById('ctrl-dotsType'),
      ctrlDotsColor: document.getElementById('ctrl-dotsColor'),
      valDotsColor: document.getElementById('val-dotsColor'),
      ctrlBackgroundColor: document.getElementById('ctrl-backgroundColor'),
      valBackgroundColor: document.getElementById('val-backgroundColor'),
      ctrlTransparentBg: document.getElementById('ctrl-transparentBg'),
      
      // Gradient Suite
      ctrlGradientEnabled: document.getElementById('ctrl-gradientEnabled'),
      gradientControlsPanel: document.getElementById('gradient-controls-panel'),
      ctrlGradientColor1: document.getElementById('ctrl-gradientColor1'),
      valGradientColor1: document.getElementById('val-gradientColor1'),
      ctrlGradientColor2: document.getElementById('ctrl-gradientColor2'),
      valGradientColor2: document.getElementById('val-gradientColor2'),
      ctrlGradientRotation: document.getElementById('ctrl-gradientRotation'),
      valGradientRotation: document.getElementById('val-gradientRotation'),

      // Eye Corner Styling
      ctrlCornerType: document.getElementById('ctrl-cornerType'),
      ctrlCornerColor: document.getElementById('ctrl-cornerColor'),
      ctrlCornerDotType: document.getElementById('ctrl-cornerDotType'),
      ctrlCornerDotColor: document.getElementById('ctrl-cornerDotColor'),

      // Center Logo Dropzone & Presets
      logoDropzone: document.getElementById('logo-dropzone'),
      logoFileInput: document.getElementById('logo-file-input'),
      dropzoneText: document.getElementById('dropzone-text'),
      logoPreviewBox: document.getElementById('logo-preview-box'),
      logoThumbImg: document.getElementById('logo-thumb-img'),
      btnChangeLogo: document.getElementById('btn-change-logo'),
      btnRemoveLogo: document.getElementById('btn-remove-logo'),
      presetIconsGrid: document.getElementById('preset-icons-grid'),

      // Inspector Live Stage & Viewport Tools
      previewStage: document.getElementById('preview-stage'),
      btnToggleBg: document.getElementById('btn-toggle-bg'),
      previewCanvas: document.getElementById('preview-canvas'),
      qrStyledContainer: document.getElementById('qr-styled-container'),
      previewErrorBox: document.getElementById('preview-error-box'),
      previewErrorText: document.getElementById('preview-error-text'),

      // Readout & Meta
      specFormat: document.getElementById('spec-format'),
      specIso: document.getElementById('spec-iso'),
      specChecksum: document.getElementById('spec-checksum'),
      specQuietZone: document.getElementById('spec-quiet-zone'),

      // Action Export Buttons
      btnDownloadSvg: document.getElementById('btn-download-svg'),
      btnDownloadPng: document.getElementById('btn-download-png'),
      scaleFactorSelect: document.getElementById('scale-factor-select'),
      btnOpenPdfModal: document.getElementById('btn-open-pdf-modal'),
      btnCopyClipboard: document.getElementById('btn-copy-clipboard'),
      btnOpenBatchModal: document.getElementById('btn-open-batch-modal'),

      // Avery PDF Modal
      pdfModal: document.getElementById('pdf-modal'),
      btnClosePdfModal: document.getElementById('btn-close-pdf-modal'),
      btnCancelPdf: document.getElementById('btn-cancel-pdf'),
      btnGeneratePdf: document.getElementById('btn-generate-pdf'),
      pdfTemplateSelect: document.getElementById('pdf-template-select'),
      pdfQuantityInput: document.getElementById('pdf-quantity-input'),
      valPdfQuantity: document.getElementById('val-pdf-quantity'),
      pdfSheetTitle: document.getElementById('pdf-sheet-title'),
      pdfShowCaption: document.getElementById('pdf-show-caption'),

      // Batch Modal & Tabs
      batchModal: document.getElementById('batch-modal'),
      btnCloseBatchModal: document.getElementById('btn-close-batch-modal'),
      btnCancelBatch: document.getElementById('btn-cancel-batch'),
      btnGenerateBatch: document.getElementById('btn-generate-batch'),
      tabBatchSeq: document.getElementById('tab-batch-seq'),
      tabBatchCsv: document.getElementById('tab-batch-csv'),
      batchSeqPanel: document.getElementById('batch-seq-panel'),
      batchCsvPanel: document.getElementById('batch-csv-panel'),
      batchPrefix: document.getElementById('batch-prefix'),
      batchStart: document.getElementById('batch-start'),
      batchCount: document.getElementById('batch-count'),
      batchPad: document.getElementById('batch-pad'),
      batchSuffix: document.getElementById('batch-suffix'),
      batchSeqPreview: document.getElementById('batch-seq-preview'),
      batchCsvInput: document.getElementById('batch-csv-input'),
      valBatchCsvCount: document.getElementById('val-batch-csv-count'),
      batchFormatSelect: document.getElementById('batch-format-select'),
      batchScaleSelect: document.getElementById('batch-scale-select'),
      batchProgressBox: document.getElementById('batch-progress-box'),
      batchProgressStatus: document.getElementById('batch-progress-status'),
      batchProgressPercent: document.getElementById('batch-progress-percent'),
      batchProgressFill: document.getElementById('batch-progress-fill'),

      // Physical Label Maker Modal
      btnOpenLabelModal: document.getElementById('btn-open-label-modal'),
      labelModal: document.getElementById('label-maker-modal'),
      btnCloseLabelModal: document.getElementById('btn-close-label-modal'),
      btnCloseLabelModalFooter: document.getElementById('btn-close-label-modal-footer'),
      labelPresetSelect: document.getElementById('label-preset-select'),
      labelLayoutPicker: document.getElementById('label-layout-picker'),
      labelFieldTitle: document.getElementById('label-field-title'),
      labelFieldCurrency: document.getElementById('label-field-currency'),
      labelFieldPrice: document.getElementById('label-field-price'),
      labelFieldSku: document.getElementById('label-field-sku'),
      labelFieldFootnote: document.getElementById('label-field-footnote'),
      labelToggleCutline: document.getElementById('label-toggle-cutline'),
      labelTogglePriceBold: document.getElementById('label-toggle-price-bold'),
      labelDimensionBadge: document.getElementById('label-dimension-badge'),
      labelPreviewCanvas: document.getElementById('label-preview-canvas'),
      btnPrintThermal: document.getElementById('btn-print-thermal'),
      btnExportLabelPdf: document.getElementById('btn-export-label-pdf'),
      btnExportLabelSheet: document.getElementById('btn-export-label-sheet'),
      btnExportLabelPng: document.getElementById('btn-export-label-png'),

      // Tactical Accents & History
      accentDots: document.querySelectorAll('.accent-dot'),
      recentHistoryContainer: document.getElementById('recent-history-container'),
      recentChipsList: document.getElementById('recent-chips-list'),
      btnClearHistory: document.getElementById('btn-clear-history'),

      // Adaptive Styling Panels
      stylingAccordionTitle: document.getElementById('styling-accordion-title'),
      qrStylingPanel: document.getElementById('qr-styling-panel'),
      barcodeStylingPanel: document.getElementById('barcode-styling-panel'),
      ctrlBarcodeColor: document.getElementById('ctrl-barcodeColor'),
      valBarcodeColor: document.getElementById('val-barcodeColor'),
      ctrlBarcodeBgColor: document.getElementById('ctrl-barcodeBgColor'),
      valBarcodeBgColor: document.getElementById('val-barcodeBgColor'),
      ctrlBarcodeTransparentBg: document.getElementById('ctrl-barcodeTransparentBg'),
      barcodePresetGrid: document.getElementById('barcode-preset-grid'),

      // Laser FX & Scanability Specs
      btnToggleLaser: document.getElementById('btn-toggle-laser'),
      laserScanBeam: document.getElementById('laser-scan-beam'),
      specScanability: document.getElementById('spec-scanability'),

      // Symbology Matrix & Alerts
      symbologyMatrix: document.getElementById('symbology-matrix-grid'),
      toastContainer: document.getElementById('toast-container')
    };
  }

  /* --- Theme Management --- */
  initTheme() {
    const saved = localStorage.getItem('ucm_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    this.updateThemeButton(saved);
  }

  toggleTheme() {
    const curr = document.documentElement.getAttribute('data-theme') || 'light';
    const next = curr === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ucm_theme', next);
    this.updateThemeButton(next);
  }

  updateThemeButton(theme) {
    if (!this.dom.themeToggleBtn) return;
    this.dom.themeToggleBtn.innerHTML = theme === 'dark' 
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> <span>Light Studio</span>` 
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> <span>Obsidian Laser</span>`;
  }

  /* --- Tactical Accent System --- */
  initAccentSystem() {
    const saved = localStorage.getItem('ucm_accent') || 'crimson';
    this.setAccent(saved);

    if (this.dom.accentDots) {
      this.dom.accentDots.forEach(dot => {
        dot.addEventListener('click', (e) => {
          const accent = e.currentTarget.dataset.accent;
          if (accent) this.setAccent(accent);
        });
      });
    }
  }

  setAccent(accent) {
    this.activeAccent = accent;
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem('ucm_accent', accent);
    if (this.dom.accentDots) {
      this.dom.accentDots.forEach(dot => {
        dot.classList.toggle('active', dot.dataset.accent === accent);
      });
    }
  }

  /* --- Category & Format Navigation --- */
  renderCategoryPills() {
    const categories = [
      { 
        id: 'all', 
        label: 'All 50+ Formats',
        iconSvg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
      },
      { 
        id: '2d', 
        label: 'Smart 2D & QR',
        iconSvg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="6" height="6" x="3" y="3" rx="1"/><rect width="6" height="6" x="15" y="3" rx="1"/><rect width="6" height="6" x="3" y="15" rx="1"/><path d="M21 16v3a2 2 0 0 1-2 2h-3M15 11h.01M18 11h.01M15 15h.01M11 15h.01M11 18h.01M11 21h.01"/></svg>`
      },
      { 
        id: 'retail', 
        label: 'Retail & GS1',
        iconSvg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`
      },
      { 
        id: 'logistics', 
        label: 'Logistics & 1D',
        iconSvg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
      }
    ];

    this.dom.categoryPills.innerHTML = categories.map(cat => `
      <button type="button" class="cat-pill ${cat.id === this.activeCategory ? 'active' : ''}" data-category="${cat.id}">
        ${cat.iconSvg} <span>${cat.label}</span>
      </button>
    `).join('');

    this.dom.categoryPills.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedCat = e.currentTarget.dataset.category;
        this.activeCategory = selectedCat;
        this.dom.categoryPills.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        this.populateSymbologySelect();

        // If current generator is not in selected category, switch to first in category
        if (selectedCat !== 'all' && this.currentGenerator && this.currentGenerator.category !== selectedCat) {
          const inCat = getGeneratorsByCategory(selectedCat);
          if (inCat.length > 0) {
            this.selectGenerator(inCat[0].id);
          }
        }
      });
    });
  }

  populateSymbologySelect() {
    if (this.activeCategory === 'all') {
      const group2D = getGeneratorsByCategory('2d');
      const groupRetail = getGeneratorsByCategory('retail');
      const groupLogistics = getGeneratorsByCategory('logistics');

      this.dom.symbologySelect.innerHTML = `
        <optgroup label="Smart 2D & Matrix Symbologies">
          ${group2D.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
        </optgroup>
        <optgroup label="Retail & Point of Sale (GS1)">
          ${groupRetail.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
        </optgroup>
        <optgroup label="Logistics, Shipping & 1D Asset Tracking">
          ${groupLogistics.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
        </optgroup>
      `;
    } else {
      const generators = getGeneratorsByCategory(this.activeCategory);
      this.dom.symbologySelect.innerHTML = generators.map(gen => `
        <option value="${gen.id}">${gen.name}</option>
      `).join('');
    }

    if (this.currentGenerator) {
      this.dom.symbologySelect.value = this.currentGenerator.id;
    }
  }

  selectGenerator(generatorId) {
    const gen = getGenerator(generatorId);
    if (!gen) return;

    this.currentGenerator = gen;
    this.dom.symbologySelect.value = gen.id;
    this.dom.symbologyDesc.textContent = gen.description;

    // Sync active category pill if switching from 'all' or another category
    if (this.activeCategory !== 'all' && this.activeCategory !== gen.category) {
      this.activeCategory = gen.category;
      this.dom.categoryPills.querySelectorAll('.cat-pill').forEach(b => {
        b.classList.toggle('active', b.dataset.category === gen.category);
      });
      this.populateSymbologySelect();
      this.dom.symbologySelect.value = gen.id;
    }

    // Reset generator-specific options to defaults
    this.currentOptions = {};
    if (Array.isArray(gen.controls)) {
      gen.controls.forEach(ctrl => {
        this.currentOptions[ctrl.id] = ctrl.default;
      });
    }

    const isQR = gen.id === 'qr-code';
    this.dom.qrWizardSection.style.display = isQR ? 'block' : 'none';
    this.dom.standardPayloadGroup.style.display = isQR ? 'none' : 'block';

    // Adaptive Accordion: Visible for ALL symbologies!
    if (this.dom.stylingAccordion) {
      this.dom.stylingAccordion.style.display = 'block';
    }
    if (this.dom.qrStylingPanel) {
      this.dom.qrStylingPanel.style.display = isQR ? 'block' : 'none';
    }
    if (this.dom.barcodeStylingPanel) {
      this.dom.barcodeStylingPanel.style.display = isQR ? 'none' : 'block';
    }
    if (this.dom.stylingAccordionTitle) {
      this.dom.stylingAccordionTitle.textContent = isQR ? 'OPTICAL STYLING & BRANDING' : 'BARCODE STYLING & PALETTE';
    }

    // Checksum helper visibility (EAN-13, UPC-A, ITF-14)
    const hasMod10 = ['ean-13', 'upc-a', 'itf-14'].includes(gen.id);
    this.dom.autoChecksumBtn.style.display = hasMod10 ? 'inline-flex' : 'none';

    // Update Dossier Readouts
    this.dom.specFormat.textContent = gen.name;
    this.dom.specIso.textContent = gen.specStandards || (isQR ? 'ISO/IEC 18004' : (gen.category === 'retail' ? 'GS1 General Specifications' : 'ISO/IEC 15417'));
    this.dom.specQuietZone.textContent = isQR ? '4 modules' : (gen.category === '2d' ? '2-4 modules' : '10x narrow bar width');

    if (!isQR) {
      this.dom.payloadInput.placeholder = gen.schema?.placeholder || 'Enter barcode data';
      if (!this.dom.payloadInput.value || this.dom.payloadInput.dataset.lastGen !== gen.id) {
        this.dom.payloadInput.value = (gen.schema && gen.schema.defaultPayload) ? gen.schema.defaultPayload : (gen.defaultPayload || '123456');
      }
      this.dom.payloadInput.dataset.lastGen = gen.id;
      this.renderDynamicControls(gen);
    } else {
      if (this.dom.dynamicControlsDeck) {
        this.dom.dynamicControlsDeck.style.display = 'none';
      }
    }

    this.scheduleRender();
  }

  /* --- Dynamic Controls Panel for 1D/2D Barcodes --- */
  renderDynamicControls(generator) {
    if (!this.dom.dynamicControlsDeck || !this.dom.dynamicControlsGrid) return;

    if (!generator.controls || generator.controls.length === 0) {
      this.dom.dynamicControlsDeck.style.display = 'none';
      return;
    }

    this.dom.dynamicControlsDeck.style.display = 'block';

    this.dom.dynamicControlsGrid.innerHTML = generator.controls.map(ctrl => {
      const val = this.currentOptions[ctrl.id] !== undefined ? this.currentOptions[ctrl.id] : ctrl.default;

      if (ctrl.type === 'slider') {
        const unit = ctrl.unit || '';
        return `
          <div class="control-row">
            <div class="control-label-row">
              <label class="form-label" for="ctrl-${ctrl.id}">${ctrl.label}</label>
              <span class="control-value-badge" id="val-${ctrl.id}">${val}${unit}</span>
            </div>
            <input 
              type="range" 
              class="tactile-slider dynamic-ctrl" 
              id="ctrl-${ctrl.id}" 
              data-id="${ctrl.id}" 
              data-type="slider"
              data-unit="${unit}"
              min="${ctrl.min}" 
              max="${ctrl.max}" 
              value="${val}" 
              step="${ctrl.step || 1}"
            >
          </div>
        `;
      }

      if (ctrl.type === 'toggle') {
        return `
          <div class="control-row toggle-row">
            <label class="form-label" for="ctrl-${ctrl.id}" style="margin-bottom:0;">${ctrl.label}</label>
            <label class="tactile-toggle-switch">
              <input 
                type="checkbox" 
                class="dynamic-ctrl" 
                id="ctrl-${ctrl.id}" 
                data-id="${ctrl.id}" 
                data-type="toggle"
                ${val ? 'checked' : ''}
              >
              <span class="tactile-toggle-slider"></span>
            </label>
          </div>
        `;
      }

      if (ctrl.type === 'select') {
        return `
          <div class="control-row">
            <label class="form-label" for="ctrl-${ctrl.id}">${ctrl.label}</label>
            <select class="symbology-select-box dynamic-ctrl" id="ctrl-${ctrl.id}" data-id="${ctrl.id}" data-type="select" style="padding: 0.45rem 0.65rem; font-size: 0.88rem;">
              ${ctrl.options.map(opt => `<option value="${opt.value}" ${opt.value == val ? 'selected' : ''}>${opt.label}</option>`).join('')}
            </select>
          </div>
        `;
      }

      if (ctrl.type === 'color') {
        return `
          <div class="control-row">
            <label class="form-label" for="ctrl-${ctrl.id}">${ctrl.label}</label>
            <div class="color-picker-row">
              <input type="color" class="color-input-box dynamic-ctrl" id="ctrl-${ctrl.id}" data-id="${ctrl.id}" data-type="color" value="${val}">
              <span class="mono-eyebrow" id="val-${ctrl.id}">${val}</span>
            </div>
          </div>
        `;
      }

      return '';
    }).join('');

    // Bind event listeners for dynamic controls
    this.dom.dynamicControlsGrid.querySelectorAll('.dynamic-ctrl').forEach(el => {
      const id = el.dataset.id;
      const type = el.dataset.type;

      const handler = () => {
        if (type === 'slider') {
          const numVal = Number(el.value);
          this.currentOptions[id] = numVal;
          const badge = document.getElementById(`val-${id}`);
          if (badge) badge.textContent = el.value + (el.dataset.unit || '');
        } else if (type === 'toggle') {
          this.currentOptions[id] = el.checked;
        } else if (type === 'select') {
          const val = el.value;
          this.currentOptions[id] = isNaN(val) ? val : Number(val);
        } else if (type === 'color') {
          this.currentOptions[id] = el.value;
          const badge = document.getElementById(`val-${id}`);
          if (badge) badge.textContent = el.value;
        }
        this.scheduleRender();
      };

      el.addEventListener('input', handler);
      el.addEventListener('change', handler);
    });
  }

  /* --- QR Wizard Sub-Navigation --- */
  renderWizardNav() {
    const wizards = getAllWizards();
    const wizardSvgMap = {
      url: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      wifi: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
      vcard: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      email: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
      sms: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      phone: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
      crypto: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/></svg>`,
      calendar: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      geo: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
      text: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`
    };
    this.dom.qrWizardNav.innerHTML = wizards.map(wiz => `
      <button type="button" class="wiz-tab-btn ${wiz.id === this.activeWizardId ? 'active' : ''}" data-wizard="${wiz.id}">
        ${wizardSvgMap[wiz.id] || `<span>${wiz.icon}</span>`} <span>${wiz.name}</span>
      </button>
    `).join('');

    this.dom.qrWizardNav.querySelectorAll('.wiz-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const wid = e.currentTarget.dataset.wizard;
        this.selectWizard(wid);
      });
    });

    this.renderActiveWizardForm();
  }

  selectWizard(wizardId) {
    this.activeWizardId = wizardId;
    this.dom.qrWizardNav.querySelectorAll('.wiz-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.wizard === wizardId);
    });
    this.renderActiveWizardForm();
    this.scheduleRender();
  }

  renderActiveWizardForm() {
    const wizard = getWizard(this.activeWizardId);
    if (!wizard) return;

    this.dom.wizardFormContainer.innerHTML = wizard.fields.map(field => {
      if (field.type === 'checkbox') {
        return `
          <div class="control-row toggle-row" style="margin-bottom: 0.85rem;">
            <label class="form-label" style="font-size: 0.82rem; margin-bottom: 0;">${field.label}</label>
            <label class="tactile-toggle-switch">
              <input type="checkbox" class="wizard-input" data-field="${field.id}" ${field.default ? 'checked' : ''}>
              <span class="tactile-toggle-slider"></span>
            </label>
          </div>
        `;
      }

      if (field.type === 'textarea') {
        return `
          <div class="form-group" style="margin-bottom: 0.85rem;">
            <label class="form-label" style="font-size: 0.82rem;">${field.label}</label>
            <textarea class="tactile-textarea wizard-input" data-field="${field.id}" placeholder="${field.placeholder || ''}">${field.default || ''}</textarea>
          </div>
        `;
      }

      if (field.type === 'select') {
        return `
          <div class="form-group" style="margin-bottom: 0.85rem;">
            <label class="form-label" style="font-size: 0.82rem;">${field.label}</label>
            <select class="symbology-select-box wizard-input" data-field="${field.id}" style="padding: 0.45rem 0.75rem; font-size: 0.88rem;">
              ${field.options.map(opt => `<option value="${opt.value}" ${opt.value === field.default ? 'selected' : ''}>${opt.label}</option>`).join('')}
            </select>
          </div>
        `;
      }

      return `
        <div class="form-group" style="margin-bottom: 0.85rem;">
          <label class="form-label" style="font-size: 0.82rem;">${field.label}</label>
          <input type="${field.type || 'text'}" class="tactile-input wizard-input" data-field="${field.id}" placeholder="${field.placeholder || ''}" value="${field.default || ''}">
        </div>
      `;
    }).join('');

    this.dom.wizardFormContainer.querySelectorAll('.wizard-input').forEach(input => {
      input.addEventListener('input', () => this.scheduleRender());
      input.addEventListener('change', () => this.scheduleRender());
    });
  }

  getWizardPayload() {
    const wizard = getWizard(this.activeWizardId);
    if (!wizard) return 'https://universalcodemaker.com';

    const values = {};
    this.dom.wizardFormContainer.querySelectorAll('.wizard-input').forEach(input => {
      values[input.dataset.field] = input.type === 'checkbox' ? input.checked : input.value;
    });

    return typeof wizard.compile === 'function' ? wizard.compile(values) : 'https://universalcodemaker.com';
  }

  /* --- Logo Presets & Studio --- */
  renderLogoPresets() {
    if (!this.dom.presetIconsGrid) return;

    const allPresets = LOGO_PRESETS;

    this.dom.presetIconsGrid.innerHTML = allPresets.map(preset => {
      const iconMarkup = preset.dataUrl
        ? `<img src="${preset.dataUrl}" alt="" class="preset-chip-img" width="16" height="16" aria-hidden="true">`
        : `<span>${preset.icon || '★'}</span>`;
      return `
        <button type="button" class="preset-icon-chip ${preset.id === this.activeLogoPresetId ? 'active' : ''}" data-preset-id="${preset.id}">
          ${iconMarkup} <span>${preset.name}</span>
        </button>
      `;
    }).join('');

    this.dom.presetIconsGrid.querySelectorAll('.preset-icon-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pid = e.currentTarget.dataset.presetId;
        this.selectLogoPreset(pid, allPresets);
      });
    });
  }

  selectLogoPreset(presetId, allPresets) {
    this.activeLogoPresetId = presetId;
    this.dom.presetIconsGrid.querySelectorAll('.preset-icon-chip').forEach(b => {
      b.classList.toggle('active', b.dataset.presetId === presetId);
    });

    if (presetId === 'none') {
      this.clearLogo();
      return;
    }

    const preset = allPresets.find(p => p.id === presetId);
    if (preset && preset.dataUrl) {
      this.activeLogoDataUrl = preset.dataUrl;
      this.showLogoPreview(preset.dataUrl);
      this.syncEccControlLock();
      this.scheduleRender();
      this.showToast(`Applied ${preset.name} brand icon. Auto-locked to ECC Level H (30%).`);
    } else {
      this.clearLogo();
    }
  }

  bindLogoStudioEvents() {
    this.dom.logoDropzone?.addEventListener('click', (e) => {
      if (e.target.closest('#btn-remove-logo') || e.target.closest('#btn-change-logo')) return;
      if (!this.activeLogoDataUrl) {
        this.dom.logoFileInput?.click();
      }
    });

    this.dom.btnChangeLogo?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dom.logoFileInput?.click();
    });

    this.dom.btnRemoveLogo?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clearLogo();
    });

    this.dom.logoFileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) this.processLogoFile(file);
    });

    // Drag and Drop
    ['dragenter', 'dragover'].forEach(eventName => {
      this.dom.logoDropzone?.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dom.logoDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      this.dom.logoDropzone?.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dom.logoDropzone.classList.remove('dragover');
      });
    });

    this.dom.logoDropzone?.addEventListener('drop', (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) this.processLogoFile(file);
    });
  }

  processLogoFile(file) {
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml|webp)$/)) {
      this.showToast('Please upload a valid image (PNG, SVG, JPEG, or WebP).', true);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.showToast('Logo file exceeds 2MB limit.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.activeLogoDataUrl = e.target.result;
      this.activeLogoPresetId = 'custom';
      this.dom.presetIconsGrid?.querySelectorAll('.preset-icon-chip').forEach(c => c.classList.remove('active'));
      this.showLogoPreview(this.activeLogoDataUrl);
      this.syncEccControlLock();
      this.scheduleRender();
      this.showToast('Center logo attached! Error correction locked to Level H (30%).');
    };
    reader.readAsDataURL(file);
  }

  showLogoPreview(url) {
    if (this.dom.dropzoneText) this.dom.dropzoneText.style.display = 'none';
    if (this.dom.logoPreviewBox) this.dom.logoPreviewBox.style.display = 'flex';
    if (this.dom.logoThumbImg) this.dom.logoThumbImg.src = url;
  }

  clearLogo() {
    this.activeLogoDataUrl = '';
    this.activeLogoPresetId = 'none';
    if (this.dom.logoFileInput) this.dom.logoFileInput.value = '';
    if (this.dom.dropzoneText) this.dom.dropzoneText.style.display = 'block';
    if (this.dom.logoPreviewBox) this.dom.logoPreviewBox.style.display = 'none';
    if (this.dom.logoThumbImg) this.dom.logoThumbImg.src = '';
    this.dom.presetIconsGrid?.querySelectorAll('.preset-icon-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.presetId === 'none');
    });
    this.syncEccControlLock();
    this.scheduleRender();
    this.showToast('Center logo cleared.');
  }

  syncEccControlLock() {
    if (!this.dom.ctrlErrorCorrectionLevel) return;
    if (this.activeLogoDataUrl && this.currentGenerator?.id === 'qr-code') {
      this.dom.ctrlErrorCorrectionLevel.value = 'H';
      this.dom.ctrlErrorCorrectionLevel.disabled = true;
      this.dom.ctrlErrorCorrectionLevel.title = 'Locked to High (30% recovery) while a center logo is active.';
      this.qrOptions.errorCorrectionLevel = 'H';
    } else {
      this.dom.ctrlErrorCorrectionLevel.disabled = false;
      this.dom.ctrlErrorCorrectionLevel.title = '';
    }
  }

  /* --- Rendering Engine Interface --- */
  scheduleRender() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.renderCurrentCode(), 60);
  }

  getCompiledRenderOptions(isQR) {
    const barHex = isQR ? this.qrOptions.dotsColor : this.barcodeOptions.barColor;
    const bgHex = isQR
      ? (this.qrOptions.transparentBg ? 'transparent' : this.qrOptions.backgroundColor)
      : (this.barcodeOptions.transparentBg ? 'transparent' : this.barcodeOptions.bgColor);

    return {
      ...this.currentOptions,
      ...(isQR ? this.qrOptions : {}),
      errorCorrectionLevel: this.qrOptions.errorCorrectionLevel,
      dotsType: this.qrOptions.dotsType,
      dotsColor: barHex,
      color: barHex,
      backgroundColor: bgHex,
      barcolor: (isQR ? this.qrOptions.dotsColor : this.barcodeOptions.barColor).replace('#', '') || '000000',
      backgroundcolor: (bgHex === 'transparent' ? 'transparent' : (bgHex.replace('#', '') || 'FFFFFF')),
      
      // Two-color gradient support (QR)
      gradientEnabled: isQR ? Boolean(this.qrOptions.gradientEnabled) : false,
      gradientType: 'linear',
      gradientColor1: this.qrOptions.gradientColor1,
      gradientColor2: this.qrOptions.gradientColor2,
      gradientRotation: this.qrOptions.gradientRotation,

      // Corner Eye Customization (QR)
      cornerType: this.qrOptions.cornerType,
      cornerColor: this.qrOptions.cornerColor,
      cornerDotType: this.qrOptions.cornerDotType,
      cornerDotColor: this.qrOptions.cornerDotColor,

      // Center Logo (QR)
      image: isQR ? (this.activeLogoDataUrl || '') : '',
      imageSize: 0.28,
      imageMargin: 4
    };
  }

  async renderCurrentCode() {
    if (!this.currentGenerator) return;

    this.hideError();

    let payload = '';
    const isQR = this.currentGenerator.id === 'qr-code';

    if (isQR) {
      payload = this.getWizardPayload();
    } else {
      payload = (this.dom.payloadInput.value || '').trim();
    }

    // Validation
    const validation = engine.validate(this.currentGenerator, payload);
    if (!validation.valid) {
      this.dom.validationStatus.innerHTML = `<span class="status-invalid">⚠️ ${validation.error}</span>`;
      this.dom.specChecksum.innerHTML = `<span style="color: var(--scanner-laser);">Unverified</span>`;
    } else {
      this.dom.validationStatus.innerHTML = `<span class="status-valid">✓ Valid Format Specs</span>`;
      this.dom.specChecksum.innerHTML = `<span class="readout-val verified">✓ Verified</span>`;
    }

    try {
      const targets = {
        canvas: this.dom.previewCanvas,
        container: this.dom.qrStyledContainer
      };

      if (isQR) {
        this.dom.previewCanvas.style.display = 'none';
        this.dom.qrStyledContainer.style.display = 'flex';
      } else {
        this.dom.qrStyledContainer.style.display = 'none';
        this.dom.previewCanvas.style.display = 'block';
      }

      // Compile render options with 100% V1 Parity + Barcode Color Controls
      const options = this.getCompiledRenderOptions(isQR);

      await engine.render(this.currentGenerator, payload, options, targets);

      // Trigger Laser Sweep Animation
      this.triggerLaserSweep();

      // Update Scanability Grade
      this.updateScanabilityMeter(isQR);

      // Save to Recent Codes History (if payload is valid)
      if (validation.valid && payload) {
        this.saveToHistory(this.currentGenerator, payload);
      }
    } catch (err) {
      this.showError(err.message || 'Render failed. Check payload format.');
    }
  }

  showError(msg) {
    this.dom.previewErrorText.textContent = msg;
    this.dom.previewErrorBox.style.display = 'block';
  }

  hideError() {
    this.dom.previewErrorBox.style.display = 'none';
  }

  /* --- Barcode Styling Suite & Presets --- */
  bindBarcodeStylingEvents() {
    this.dom.ctrlBarcodeColor?.addEventListener('input', (e) => {
      this.barcodeOptions.barColor = e.target.value;
      if (this.dom.valBarcodeColor) this.dom.valBarcodeColor.textContent = e.target.value;
      this.scheduleRender();
    });

    this.dom.ctrlBarcodeBgColor?.addEventListener('input', (e) => {
      this.barcodeOptions.bgColor = e.target.value;
      if (this.dom.valBarcodeBgColor) this.dom.valBarcodeBgColor.textContent = e.target.value;
      this.scheduleRender();
    });

    this.dom.ctrlBarcodeTransparentBg?.addEventListener('change', (e) => {
      this.barcodeOptions.transparentBg = e.target.checked;
      if (e.target.checked) {
        this.dom.previewStage?.classList.add('checkerboard-active');
      }
      this.scheduleRender();
    });

    // Preset palette buttons
    this.dom.barcodePresetGrid?.querySelectorAll('.barcode-preset-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const bar = e.currentTarget.dataset.bar;
        const bg = e.currentTarget.dataset.bg;
        if (!bar || !bg) return;

        this.barcodeOptions.barColor = bar;
        if (this.dom.ctrlBarcodeColor) this.dom.ctrlBarcodeColor.value = bar;
        if (this.dom.valBarcodeColor) this.dom.valBarcodeColor.textContent = bar;

        if (bg === 'transparent') {
          this.barcodeOptions.transparentBg = true;
          if (this.dom.ctrlBarcodeTransparentBg) this.dom.ctrlBarcodeTransparentBg.checked = true;
          this.dom.previewStage?.classList.add('checkerboard-active');
        } else {
          this.barcodeOptions.transparentBg = false;
          this.barcodeOptions.bgColor = bg;
          if (this.dom.ctrlBarcodeTransparentBg) this.dom.ctrlBarcodeTransparentBg.checked = false;
          if (this.dom.ctrlBarcodeBgColor) this.dom.ctrlBarcodeBgColor.value = bg;
          if (this.dom.valBarcodeBgColor) this.dom.valBarcodeBgColor.textContent = bg;
        }

        this.dom.barcodePresetGrid.querySelectorAll('.barcode-preset-chip').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        this.scheduleRender();
        this.showToast(`Applied ${e.currentTarget.textContent.trim()} barcode palette.`);
      });
    });
  }

  /* --- Laser Scan Beam Animation --- */
  bindLaserFxEvents() {
    this.dom.btnToggleLaser?.addEventListener('click', () => {
      this.laserFxEnabled = !this.laserFxEnabled;
      this.dom.btnToggleLaser.classList.toggle('active', this.laserFxEnabled);
      if (this.laserFxEnabled) {
        this.triggerLaserSweep();
        this.showToast('Laser scan sweep enabled ⚡');
      } else {
        if (this.dom.laserScanBeam) {
          this.dom.laserScanBeam.classList.remove('active', 'scanning');
        }
        this.showToast('Laser scan sweep disabled.');
      }
    });
  }

  triggerLaserSweep() {
    if (!this.laserFxEnabled || !this.dom.laserScanBeam) return;
    this.dom.laserScanBeam.classList.remove('active', 'scanning');
    // Force reflow to retrigger animation
    void this.dom.laserScanBeam.offsetWidth;
    this.dom.laserScanBeam.classList.add('active', 'scanning');
    setTimeout(() => {
      if (this.dom.laserScanBeam) {
        this.dom.laserScanBeam.classList.remove('active', 'scanning');
      }
    }, 1100);
  }

  /* --- ISO/IEC 15416 / 15415 Optical Scanability Meter --- */
  updateScanabilityMeter(isQR) {
    if (!this.dom.specScanability) return;

    let barHex = '#0f1117';
    let bgHex = '#ffffff';

    if (isQR) {
      barHex = this.qrOptions.dotsColor || '#0f1117';
      bgHex = this.qrOptions.transparentBg ? '#ffffff' : (this.qrOptions.backgroundColor || '#ffffff');
    } else {
      barHex = this.barcodeOptions.barColor || '#0f1117';
      bgHex = this.barcodeOptions.transparentBg ? '#ffffff' : (this.barcodeOptions.bgColor || '#ffffff');
    }

    const getLuminance = (hex) => {
      if (!hex || hex === 'transparent') return 1;
      const clean = hex.replace('#', '');
      if (clean.length < 6) return 0;
      const r = parseInt(clean.substring(0, 2), 16) / 255;
      const g = parseInt(clean.substring(2, 4), 16) / 255;
      const b = parseInt(clean.substring(4, 6), 16) / 255;
      const toLinear = c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    };

    const l1 = getLuminance(barHex);
    const l2 = getLuminance(bgHex);
    const bright = Math.max(l1, l2);
    const dark = Math.min(l1, l2);
    const ratio = (bright + 0.05) / (dark + 0.05);

    let badgeClass = 'grade-a';
    let gradeLabel = 'Grade A (Optimal)';
    if (ratio >= 7.0) {
      badgeClass = 'grade-a';
      gradeLabel = `Grade A (${ratio.toFixed(1)}:1)`;
    } else if (ratio >= 4.5) {
      badgeClass = 'grade-b';
      gradeLabel = `Grade B (${ratio.toFixed(1)}:1)`;
    } else {
      badgeClass = 'grade-d';
      gradeLabel = `Grade D (${ratio.toFixed(1)}:1 Warning)`;
    }

    this.dom.specScanability.innerHTML = `<span class="scanability-badge ${badgeClass}">${gradeLabel}</span>`;
  }

  /* --- Quick Recall Recent Codes History --- */
  saveToHistory(generator, payload) {
    if (!generator || !payload) return;
    try {
      const MAX_ITEMS = 6;
      let history = JSON.parse(localStorage.getItem('ucm_recent_history') || '[]');
      
      // Deduplicate: remove existing entry with same gen and payload
      history = history.filter(item => !(item.generatorId === generator.id && item.payload === payload));
      
      // Prepend current
      history.unshift({
        generatorId: generator.id,
        name: generator.name,
        payload: payload,
        timestamp: Date.now()
      });

      if (history.length > MAX_ITEMS) {
        history = history.slice(0, MAX_ITEMS);
      }

      localStorage.setItem('ucm_recent_history', JSON.stringify(history));
      this.renderHistoryChips();
    } catch (e) {
      // LocalStorage errors ignored (incognito, quota, etc.)
    }
  }

  renderHistoryChips() {
    if (!this.dom.recentHistoryContainer || !this.dom.recentChipsList) return;
    try {
      const history = JSON.parse(localStorage.getItem('ucm_recent_history') || '[]');
      if (!history.length) {
        this.dom.recentHistoryContainer.style.display = 'none';
        return;
      }

      this.dom.recentHistoryContainer.style.display = 'block';
      this.dom.recentChipsList.innerHTML = history.map(item => {
        const displayPayload = item.payload.length > 20 ? item.payload.slice(0, 18) + '…' : item.payload;
        return `
          <button type="button" class="recent-chip" data-gen="${item.generatorId}" data-payload="${encodeURIComponent(item.payload)}">
            <span class="recent-chip-badge">${item.name}</span>
            <span class="recent-chip-text">${displayPayload}</span>
          </button>
        `;
      }).join('');

      this.dom.recentChipsList.querySelectorAll('.recent-chip').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const genId = e.currentTarget.dataset.gen;
          const payload = decodeURIComponent(e.currentTarget.dataset.payload);
          this.loadHistoryItem(genId, payload);
        });
      });

      if (this.dom.btnClearHistory && !this.dom.btnClearHistory.dataset.bound) {
        this.dom.btnClearHistory.dataset.bound = 'true';
        this.dom.btnClearHistory.addEventListener('click', () => {
          localStorage.removeItem('ucm_recent_history');
          this.renderHistoryChips();
          this.showToast('Recent history cleared.');
        });
      }
    } catch (e) {
      this.dom.recentHistoryContainer.style.display = 'none';
    }
  }

  loadHistoryItem(generatorId, payload) {
    const gen = getGenerator(generatorId);
    if (!gen) return;

    this.selectGenerator(generatorId);

    if (gen.id === 'qr-code') {
      const urlInput = this.dom.wizardFormContainer?.querySelector('.wizard-input[data-field="url"]');
      if (urlInput) {
        urlInput.value = payload;
      }
    } else {
      if (this.dom.payloadInput) {
        this.dom.payloadInput.value = payload;
      }
    }

    this.scheduleRender();
    this.showToast(`Restored ${gen.name}: ${payload.slice(0, 24)}...`);
  }

  /* --- Checksum Auto-Calculation --- */
  calculateChecksum() {
    if (!this.currentGenerator) return;
    const inputVal = (this.dom.payloadInput.value || '').trim();

    if (this.currentGenerator.id === 'ean-13') {
      const cleanDigits = inputVal.replace(/\D/g, '').slice(0, 12);
      if (cleanDigits.length === 12) {
        const validCode = computeEan13(cleanDigits);
        const checkDigit = validCode.slice(-1);
        this.dom.payloadInput.value = validCode;
        this.scheduleRender();
        this.showToast(`Mod-10 Check Digit '${checkDigit}' appended!`);
      } else {
        this.showToast('Enter exactly 12 digits to auto-calculate the 13th digit.', true);
      }
    } else if (this.currentGenerator.id === 'upc-a') {
      const cleanDigits = inputVal.replace(/\D/g, '').slice(0, 11);
      if (cleanDigits.length === 11) {
        const validCode = computeUpcA(cleanDigits);
        const checkDigit = validCode.slice(-1);
        this.dom.payloadInput.value = validCode;
        this.scheduleRender();
        this.showToast(`UPC-A Check Digit '${checkDigit}' appended!`);
      } else {
        this.showToast('Enter exactly 11 digits to auto-calculate UPC-A.', true);
      }
    } else if (this.currentGenerator.id === 'itf-14') {
      const cleanDigits = inputVal.replace(/\D/g, '').slice(0, 13);
      if (cleanDigits.length === 13) {
        const check = calculateMod10(cleanDigits);
        this.dom.payloadInput.value = cleanDigits + check;
        this.scheduleRender();
        this.showToast(`ITF-14 Check Digit '${check}' appended!`);
      } else {
        this.showToast('Enter exactly 13 digits to auto-calculate ITF-14.', true);
      }
    }
  }

  /* --- Export Handlers --- */
  async downloadSvg() {
    try {
      const isQR = this.currentGenerator.id === 'qr-code';
      const payload = isQR ? this.getWizardPayload() : this.dom.payloadInput.value;

      await exportVectorSvg({
        generator: this.currentGenerator,
        payload,
        options: this.getCompiledRenderOptions(isQR),
        logoDataUrl: isQR ? this.activeLogoDataUrl : ''
      });
      this.showToast('Vector SVG exported successfully!');
    } catch (err) {
      this.showToast(`SVG export failed: ${err.message}`, true);
    }
  }

  async downloadPng() {
    try {
      const scale = parseInt(this.dom.scaleFactorSelect.value, 10) || 2;
      const isQR = this.currentGenerator.id === 'qr-code';
      const payload = isQR ? this.getWizardPayload() : this.dom.payloadInput.value;

      await exportHighResPng({
        generator: this.currentGenerator,
        payload,
        options: this.getCompiledRenderOptions(isQR),
        scaleFactor: scale,
        logoDataUrl: isQR ? this.activeLogoDataUrl : ''
      });
      this.showToast(`High-Res PNG (${scale}x) exported!`);
    } catch (err) {
      this.showToast(`PNG export failed: ${err.message}`, true);
    }
  }

  async copyClipboard() {
    try {
      const res = await copyImageToClipboard({
        generator: this.currentGenerator,
        previewCanvas: this.dom.previewCanvas,
        qrStyledContainer: this.dom.qrStyledContainer
      });
      if (res) {
        if (this.dom.btnCopyClipboard) {
          const originalHtml = this.dom.btnCopyClipboard.innerHTML;
          this.dom.btnCopyClipboard.classList.add('copied-success');
          this.dom.btnCopyClipboard.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> <span>Copied!</span>`;
          setTimeout(() => {
            if (this.dom.btnCopyClipboard) {
              this.dom.btnCopyClipboard.classList.remove('copied-success');
              this.dom.btnCopyClipboard.innerHTML = originalHtml;
            }
          }, 1800);
        }
        this.showToast('Image copied to clipboard!');
      }
    } catch (err) {
      this.showToast(`Clipboard copy failed: ${err.message}`, true);
    }
  }

  /* --- Avery PDF Modal --- */
  bindPdfModalEvents() {
    this.dom.btnOpenPdfModal?.addEventListener('click', () => {
      this.dom.pdfModal.classList.add('open');
    });
    this.dom.btnClosePdfModal?.addEventListener('click', () => {
      this.dom.pdfModal.classList.remove('open');
    });
    this.dom.btnCancelPdf?.addEventListener('click', () => {
      this.dom.pdfModal.classList.remove('open');
    });
    this.dom.pdfQuantityInput?.addEventListener('input', (e) => {
      if (this.dom.valPdfQuantity) this.dom.valPdfQuantity.textContent = e.target.value;
    });
    this.dom.btnGeneratePdf?.addEventListener('click', () => this.generatePdf());
  }

  async generatePdf() {
    try {
      const templateId = this.dom.pdfTemplateSelect.value || 'avery-5160';
      const quantity = parseInt(this.dom.pdfQuantityInput.value, 10) || 30;
      const title = this.dom.pdfSheetTitle.value || 'UniversalCodeMaker Label Sheet';
      const isQR = this.currentGenerator.id === 'qr-code';
      const payload = isQR ? this.getWizardPayload() : (this.dom.payloadInput.value || 'SAMPLE');
      const showCaption = Boolean(this.dom.pdfShowCaption?.checked);

      await generatePdfLabelSheet({
        generator: this.currentGenerator,
        payload,
        options: { ...this.currentOptions, ...this.qrOptions },
        logoDataUrl: this.activeLogoDataUrl,
        templateId,
        quantity,
        sheetTitle: title,
        showCaption,
        caption: isQR ? 'UniversalCodeMaker' : payload
      });

      this.dom.pdfModal.classList.remove('open');
      this.showToast('Label Sheet PDF generated!');
    } catch (err) {
      this.showToast(`PDF generation failed: ${err.message}`, true);
    }
  }

  /* --- Physical Label Maker Studio --- */
  bindLabelMakerEvents() {
    this.dom.btnOpenLabelModal?.addEventListener('click', () => {
      this.openLabelMakerModal();
    });

    this.dom.btnCloseLabelModal?.addEventListener('click', () => {
      this.dom.labelModal.classList.remove('open');
    });

    this.dom.btnCloseLabelModalFooter?.addEventListener('click', () => {
      this.dom.labelModal.classList.remove('open');
    });

    // Preset selector change
    this.dom.labelPresetSelect?.addEventListener('change', (e) => {
      this.labelState.presetId = e.target.value;
      const preset = LABEL_PRESETS[e.target.value] || LABEL_PRESETS['retail-225-125'];
      if (this.dom.labelDimensionBadge) {
        this.dom.labelDimensionBadge.textContent = `${preset.widthIn}" × ${preset.heightIn}" • ${preset.widthMm}mm × ${preset.heightMm}mm (${preset.category === 'thermal' ? 'Thermal Roll' : 'Sheet'})`;
      }
      this.renderLabelPreview();
    });

    // Layout switcher buttons
    this.dom.labelLayoutPicker?.querySelectorAll('.label-layout-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const layoutId = e.currentTarget.dataset.layout;
        if (!layoutId) return;
        this.dom.labelLayoutPicker.querySelectorAll('.label-layout-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.labelState.layoutId = layoutId;
        this.renderLabelPreview();
      });
    });

    // Reactive input fields
    const inputs = [
      this.dom.labelFieldTitle,
      this.dom.labelFieldCurrency,
      this.dom.labelFieldPrice,
      this.dom.labelFieldSku,
      this.dom.labelFieldFootnote,
      this.dom.labelToggleCutline,
      this.dom.labelTogglePriceBold
    ];

    inputs.forEach((input) => {
      input?.addEventListener('input', () => this.renderLabelPreview());
      input?.addEventListener('change', () => this.renderLabelPreview());
    });

    // Export: Browser Thermal Print
    this.dom.btnPrintThermal?.addEventListener('click', () => {
      printThermalRoll({
        canvas: this.dom.labelPreviewCanvas,
        presetId: this.labelState.presetId
      });
      this.showToast('Thermal print dialog opened!');
    });

    // Export: Single Vector PDF
    this.dom.btnExportLabelPdf?.addEventListener('click', async () => {
      try {
        await exportSingleLabelPdf({
          canvas: this.dom.labelPreviewCanvas,
          presetId: this.labelState.presetId
        });
        this.showToast('Single Vector PDF generated!');
      } catch (err) {
        this.showToast(`PDF generation failed: ${err.message}`, true);
      }
    });

    // Export: 300 DPI PNG
    this.dom.btnExportLabelPng?.addEventListener('click', () => {
      try {
        exportLabelPng(this.dom.labelPreviewCanvas, `label-${this.labelState.presetId}-${Date.now()}.png`);
        this.showToast('300 DPI PNG sticker exported!');
      } catch (err) {
        this.showToast(`PNG export failed: ${err.message}`, true);
      }
    });

    // Export: Avery Sheet PDF
    this.dom.btnExportLabelSheet?.addEventListener('click', async () => {
      try {
        const preset = LABEL_PRESETS[this.labelState.presetId];
        const templateId = preset?.averyTemplateId || 'avery-5160';
        await exportLabelSheetPdf({
          canvas: this.dom.labelPreviewCanvas,
          templateId,
          quantity: 30
        });
        this.showToast(`Avery Sheet (${templateId}) PDF generated!`);
      } catch (err) {
        this.showToast(`Avery sheet failed: ${err.message}`, true);
      }
    });
  }

  openLabelMakerModal() {
    const isQR = this.currentGenerator.id === 'qr-code';
    const payload = isQR ? this.getWizardPayload() : (this.dom.payloadInput?.value || 'PROD-998822');

    // Pre-populate SKU & Title
    if (this.dom.labelFieldSku) {
      this.dom.labelFieldSku.value = `SKU: ${payload.substring(0, 24)}`;
    }
    if (this.dom.labelFieldTitle) {
      if (isQR) {
        this.dom.labelFieldTitle.value = this.activeWizardId === 'wifi' ? 'Guest Wi-Fi Network Access' :
                                         this.activeWizardId === 'vcard' ? 'Scan Digital Contact Card' :
                                         this.activeWizardId === 'url' ? 'Scan to Visit Website' : 'Custom Digital QR Tag';
      } else {
        this.dom.labelFieldTitle.value = `${this.currentGenerator.name || 'Commercial Product'}`;
      }
    }

    // Default layout for 2D is side-by-side; for 1D is vertical-stack
    const isSquare2D = ['qr-code', 'data-matrix', 'aztec'].includes(this.currentGenerator.id);
    const targetLayout = isSquare2D ? 'side-by-side' : 'vertical-stack';
    this.labelState.layoutId = targetLayout;

    if (this.dom.labelLayoutPicker) {
      this.dom.labelLayoutPicker.querySelectorAll('.label-layout-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.layout === targetLayout);
      });
    }

    this.dom.labelModal.classList.add('open');
    this.renderLabelPreview();
  }

  renderLabelPreview() {
    if (!this.dom.labelPreviewCanvas) return;

    const isQR = this.currentGenerator.id === 'qr-code';
    const isSquare2D = ['qr-code', 'data-matrix', 'aztec'].includes(this.currentGenerator.id);

    // Extract current code graphic
    let codeImg = null;
    if (isQR) {
      const qrCanvas = this.dom.qrStyledContainer?.querySelector('canvas');
      if (qrCanvas) {
        codeImg = qrCanvas;
      }
    } else {
      if (this.dom.previewCanvas && this.dom.previewCanvas.style.display !== 'none') {
        codeImg = this.dom.previewCanvas;
      }
    }

    renderLabelToCanvas(this.dom.labelPreviewCanvas, {
      presetId: this.labelState.presetId,
      layoutId: this.labelState.layoutId,
      title: this.dom.labelFieldTitle?.value || '',
      currency: this.dom.labelFieldCurrency?.value || '$',
      price: this.dom.labelFieldPrice?.value || '',
      isPriceBold: Boolean(this.dom.labelTogglePriceBold?.checked),
      sku: this.dom.labelFieldSku?.value || '',
      footnote: this.dom.labelFieldFootnote?.value || '',
      showCutline: Boolean(this.dom.labelToggleCutline?.checked),
      showCodeText: true,
      codeImage: codeImg,
      isSquare2D
    });
  }

  /* --- Batch Modal & Sequence Generator --- */
  bindBatchModalEvents() {
    this.dom.btnOpenBatchModal?.addEventListener('click', () => {
      this.dom.batchProgressBox.style.display = 'none';
      this.dom.batchProgressFill.style.width = '0%';
      this.dom.batchModal.classList.add('open');
    });
    this.dom.btnCloseBatchModal?.addEventListener('click', () => {
      this.dom.batchModal.classList.remove('open');
    });
    this.dom.btnCancelBatch?.addEventListener('click', () => {
      this.dom.batchModal.classList.remove('open');
    });

    // Batch Tabs
    this.dom.tabBatchSeq?.addEventListener('click', () => {
      this.activeBatchMode = 'seq';
      this.dom.tabBatchSeq.classList.add('active');
      this.dom.tabBatchCsv.classList.remove('active');
      this.dom.batchSeqPanel.style.display = 'block';
      this.dom.batchCsvPanel.style.display = 'none';
    });

    this.dom.tabBatchCsv?.addEventListener('click', () => {
      this.activeBatchMode = 'csv';
      this.dom.tabBatchCsv.classList.add('active');
      this.dom.tabBatchSeq.classList.remove('active');
      this.dom.batchCsvPanel.style.display = 'block';
      this.dom.batchSeqPanel.style.display = 'none';
    });

    // Sequence Inputs Live Update
    [this.dom.batchPrefix, this.dom.batchStart, this.dom.batchCount, this.dom.batchPad, this.dom.batchSuffix].forEach(input => {
      input?.addEventListener('input', () => this.updateBatchSeqPreview());
    });

    // CSV Lines Counter
    this.dom.batchCsvInput?.addEventListener('input', () => {
      const lines = parseCsvOrLines(this.dom.batchCsvInput.value || '');
      if (this.dom.valBatchCsvCount) {
        this.dom.valBatchCsvCount.textContent = `${lines.length} items`;
      }
    });

    this.dom.btnGenerateBatch?.addEventListener('click', () => this.generateBatch());
  }

  updateBatchSeqPreview() {
    if (!this.dom.batchSeqPreview) return;
    const prefix = this.dom.batchPrefix?.value || '';
    const start = parseInt(this.dom.batchStart?.value, 10) || 1;
    const count = Math.min(100, Math.max(1, parseInt(this.dom.batchCount?.value, 10) || 10));
    const pad = Math.max(0, parseInt(this.dom.batchPad?.value, 10) || 3);
    const suffix = this.dom.batchSuffix?.value || '';

    const first = prefix + String(start).padStart(pad, '0') + suffix;
    const last = prefix + String(start + count - 1).padStart(pad, '0') + suffix;
    this.dom.batchSeqPreview.textContent = `${first} ... ${last} (${count} codes)`;
  }

  async generateBatch() {
    try {
      let items = [];
      if (this.activeBatchMode === 'seq') {
        const prefix = this.dom.batchPrefix?.value || '';
        const start = parseInt(this.dom.batchStart?.value, 10) || 1;
        const count = Math.min(100, Math.max(1, parseInt(this.dom.batchCount?.value, 10) || 10));
        const pad = Math.max(0, parseInt(this.dom.batchPad?.value, 10) || 3);
        const suffix = this.dom.batchSuffix?.value || '';
        items = generateSequenceList({ prefix, start, count, pad, suffix });
      } else {
        items = parseCsvOrLines(this.dom.batchCsvInput?.value || '');
      }

      if (!items.length) {
        this.showToast('Please provide at least 1 payload in the input box.', true);
        return;
      }

      const format = this.dom.batchFormatSelect?.value || 'png';
      const scaleFactor = parseInt(this.dom.batchScaleSelect?.value, 10) || 2;

      this.dom.batchProgressBox.style.display = 'block';
      this.dom.batchProgressStatus.textContent = `Processing 0 / ${items.length}...`;
      this.dom.batchProgressPercent.textContent = '0%';
      this.dom.batchProgressFill.style.width = '0%';

      await generateBatchZip({
        generator: this.currentGenerator,
        items,
        format,
        scaleFactor,
        options: { ...this.currentOptions, ...this.qrOptions },
        logoDataUrl: this.activeLogoDataUrl,
        onProgress: ({ current, total, percent }) => {
          this.dom.batchProgressStatus.textContent = `Processing ${current} / ${total}...`;
          this.dom.batchProgressPercent.textContent = `${percent}%`;
          this.dom.batchProgressFill.style.width = `${percent}%`;
        }
      });

      this.dom.batchModal.classList.remove('open');
      this.showToast(`Batch ZIP of ${items.length} items exported!`);
    } catch (err) {
      this.showToast(`Batch generation failed: ${err.message}`, true);
    }
  }

  /* --- Symbology Matrix Table --- */
  renderSymbologyMatrix() {
    const gens = getAllGenerators();
    this.dom.symbologyMatrix.innerHTML = gens.map(gen => `
      <div class="matrix-card">
        <div class="matrix-card-header">
          <span class="matrix-card-title">${gen.name}</span>
          <span class="matrix-card-iso">${gen.specStandards || (gen.category === '2d' ? 'ISO 2D' : 'GS1 Standard')}</span>
        </div>
        <p class="matrix-card-desc">${gen.description}</p>
        <button type="button" class="btn btn-ink btn-sm matrix-load-btn" data-id="${gen.id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"/>
            <polyline points="7 7 17 7 17 17"/>
          </svg>
          Load in Studio
        </button>
      </div>
    `).join('');

    this.dom.symbologyMatrix.querySelectorAll('.matrix-load-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const gid = e.currentTarget.dataset.id;
        this.selectGenerator(gid);
        const studioEl = document.getElementById('studio');
        if (studioEl) {
          studioEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* --- Toast Alerts --- */
  showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'tactile-toast';
    toast.style.borderColor = isError ? 'var(--scanner-laser)' : 'var(--ink-black)';
    toast.innerHTML = `
      <span>${isError ? '⚠️' : '⚡'}</span>
      <span>${message}</span>
    `;

    this.dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  bindEvents() {
    // Theme Switcher
    this.dom.themeToggleBtn?.addEventListener('click', () => this.toggleTheme());

    // Symbology Dropdown
    this.dom.symbologySelect?.addEventListener('change', (e) => {
      this.selectGenerator(e.target.value);
    });

    // Standard Payload Input
    this.dom.payloadInput?.addEventListener('input', () => this.scheduleRender());

    // Checksum Auto Calculation
    this.dom.autoChecksumBtn?.addEventListener('click', () => this.calculateChecksum());

    // Accordion Toggle
    const accHeader = this.dom.stylingAccordion?.querySelector('.accordion-toggle');
    accHeader?.addEventListener('click', () => {
      this.dom.stylingAccordion.classList.toggle('open');
    });

    // Checkerboard Background Toggle
    this.dom.btnToggleBg?.addEventListener('click', () => {
      this.dom.previewStage?.classList.toggle('checkerboard-active');
    });

    // QR Styling Controls
    this.dom.ctrlErrorCorrectionLevel?.addEventListener('change', (e) => {
      this.qrOptions.errorCorrectionLevel = e.target.value;
      this.scheduleRender();
    });

    this.dom.ctrlDotsType?.addEventListener('change', (e) => {
      this.qrOptions.dotsType = e.target.value;
      this.scheduleRender();
    });

    this.dom.ctrlDotsColor?.addEventListener('input', (e) => {
      this.qrOptions.dotsColor = e.target.value;
      if (this.dom.valDotsColor) this.dom.valDotsColor.textContent = e.target.value;
      this.scheduleRender();
    });

    this.dom.ctrlBackgroundColor?.addEventListener('input', (e) => {
      this.qrOptions.backgroundColor = e.target.value;
      if (this.dom.valBackgroundColor) this.dom.valBackgroundColor.textContent = e.target.value;
      this.scheduleRender();
    });

    this.dom.ctrlTransparentBg?.addEventListener('change', (e) => {
      this.qrOptions.transparentBg = e.target.checked;
      if (e.target.checked) {
        this.dom.previewStage?.classList.add('checkerboard-active');
      }
      this.scheduleRender();
    });

    // Gradient Controls
    this.dom.ctrlGradientEnabled?.addEventListener('change', (e) => {
      this.qrOptions.gradientEnabled = e.target.checked;
      if (this.dom.gradientControlsPanel) {
        this.dom.gradientControlsPanel.style.display = e.target.checked ? 'block' : 'none';
      }
      this.scheduleRender();
    });

    this.dom.ctrlGradientColor1?.addEventListener('input', (e) => {
      this.qrOptions.gradientColor1 = e.target.value;
      if (this.dom.valGradientColor1) this.dom.valGradientColor1.textContent = e.target.value;
      this.scheduleRender();
    });

    this.dom.ctrlGradientColor2?.addEventListener('input', (e) => {
      this.qrOptions.gradientColor2 = e.target.value;
      if (this.dom.valGradientColor2) this.dom.valGradientColor2.textContent = e.target.value;
      this.scheduleRender();
    });

    this.dom.ctrlGradientRotation?.addEventListener('input', (e) => {
      this.qrOptions.gradientRotation = Number(e.target.value);
      if (this.dom.valGradientRotation) this.dom.valGradientRotation.textContent = `${e.target.value}°`;
      this.scheduleRender();
    });

    // Corner Eye Styling
    this.dom.ctrlCornerType?.addEventListener('change', (e) => {
      this.qrOptions.cornerType = e.target.value;
      this.scheduleRender();
    });

    this.dom.ctrlCornerColor?.addEventListener('input', (e) => {
      this.qrOptions.cornerColor = e.target.value;
      this.scheduleRender();
    });

    this.dom.ctrlCornerDotType?.addEventListener('change', (e) => {
      this.qrOptions.cornerDotType = e.target.value;
      this.scheduleRender();
    });

    this.dom.ctrlCornerDotColor?.addEventListener('input', (e) => {
      this.qrOptions.cornerDotColor = e.target.value;
      this.scheduleRender();
    });

    // Export Buttons
    this.dom.btnDownloadSvg?.addEventListener('click', () => this.downloadSvg());
    this.dom.btnDownloadPng?.addEventListener('click', () => this.downloadPng());
    this.dom.btnCopyClipboard?.addEventListener('click', () => this.copyClipboard());
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const app = new V2StudioApp();
  window.v2StudioApp = app;
  app.init();
});
