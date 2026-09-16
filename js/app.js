/**
 * Main Application Orchestrator & UI Coordinator
 * Universal QR, Barcode & Code Generator Suite
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
import { initCookieBanner } from './core/cookie-banner.js';

class App {
  constructor() {
    this.currentGenerator = null;
    this.activeCategory = 'all';
    this.debounceTimer = null;
    this.currentOptions = {};

    // QR Wizard & Logo State
    this.activeWizardId = 'url';
    this.activeLogoDataUrl = '';
    this.activeLogoPresetId = 'none';
    this.activeScaleFactor = 1;

    // Core DOM Elements
    this.categoryTabs = document.getElementById('category-tabs');
    this.symbologySelect = document.getElementById('symbology-select');
    this.symbologyDesc = document.getElementById('symbology-description');
    this.payloadInput = document.getElementById('payload-input');
    this.validationMsg = document.getElementById('validation-msg');
    this.autoChecksumBtn = document.getElementById('auto-checksum-btn');
    this.dynamicControls = document.getElementById('dynamic-controls-panel');
    this.engineStatus = document.getElementById('engine-status');
    this.canvasViewport = document.getElementById('canvas-viewport');
    this.previewCanvas = document.getElementById('preview-canvas');
    this.qrStyledContainer = document.getElementById('qr-styled-container');
    this.previewError = document.getElementById('preview-error');
    this.previewErrorText = document.getElementById('preview-error-text');
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');

    // Smart QR Wizard & Logo Studio Elements
    this.qrWizardSection = document.getElementById('qr-wizard-section');
    this.qrWizardNav = document.getElementById('qr-wizard-nav');
    this.wizardFormContainer = document.getElementById('wizard-form-container');
    this.standardPayloadGroup = document.getElementById('standard-payload-group');
    this.logoStudioSection = document.getElementById('logo-studio-section');
    this.logoDropzone = document.getElementById('logo-dropzone');
    this.logoFileInput = document.getElementById('logo-file-input');
    this.dropzoneText = document.getElementById('dropzone-text');
    this.logoPreviewBox = document.getElementById('logo-preview-box');
    this.logoThumbImg = document.getElementById('logo-thumb-img');
    this.btnChangeLogo = document.getElementById('btn-change-logo');
    this.btnRemoveLogo = document.getElementById('btn-remove-logo');
    this.presetIconsGrid = document.getElementById('preset-icons-grid');

    // Download, Resolution & Export Elements
    this.exportResPills = document.getElementById('export-res-pills');
    this.btnDownloadPng = document.getElementById('btn-download-png');
    this.btnDownloadSvg = document.getElementById('btn-download-svg');
    this.btnOpenPdfModal = document.getElementById('btn-open-pdf-modal');
    this.btnCopyClipboard = document.getElementById('btn-copy-clipboard');
    this.btnToggleBg = document.getElementById('btn-toggle-bg');
    this.toastContainer = document.getElementById('toast-container');

    // PDF Label Sheet Modal Elements
    this.pdfModal = document.getElementById('pdf-modal');
    this.btnClosePdfModal = document.getElementById('btn-close-pdf-modal');
    this.btnCancelPdf = document.getElementById('btn-cancel-pdf');
    this.btnGeneratePdf = document.getElementById('btn-generate-pdf');
    this.pdfTemplateSelect = document.getElementById('pdf-template-select');
    this.pdfTemplateDesc = document.getElementById('pdf-template-desc');
    this.pdfQuantitySlider = document.getElementById('pdf-quantity-slider');
    this.valPdfQuantity = document.getElementById('val-pdf-quantity');
    this.pdfQuantityGroup = document.getElementById('pdf-quantity-group');
    this.pdfTitleGroup = document.getElementById('pdf-title-group');
    this.pdfSheetTitle = document.getElementById('pdf-sheet-title');
    this.pdfShowCaption = document.getElementById('pdf-show-caption');

    // Batch Generator & ZIP Modal Elements
    this.btnOpenBatchModal = document.getElementById('btn-open-batch-modal');
    this.batchModal = document.getElementById('batch-modal');
    this.btnCloseBatchModal = document.getElementById('btn-close-batch-modal');
    this.btnCancelBatch = document.getElementById('btn-cancel-batch');
    this.btnGenerateBatch = document.getElementById('btn-generate-batch');
    this.tabBatchSeq = document.getElementById('tab-batch-seq');
    this.tabBatchCsv = document.getElementById('tab-batch-csv');
    this.batchSeqPanel = document.getElementById('batch-seq-panel');
    this.batchCsvPanel = document.getElementById('batch-csv-panel');
    this.batchPrefix = document.getElementById('batch-prefix');
    this.batchStart = document.getElementById('batch-start');
    this.batchCount = document.getElementById('batch-count');
    this.batchPad = document.getElementById('batch-pad');
    this.batchSuffix = document.getElementById('batch-suffix');
    this.batchSeqPreview = document.getElementById('batch-seq-preview');
    this.batchCsvInput = document.getElementById('batch-csv-input');
    this.valBatchCsvCount = document.getElementById('val-batch-csv-count');
    this.batchFormatSelect = document.getElementById('batch-format-select');
    this.batchProgressBox = document.getElementById('batch-progress-box');
    this.batchProgressStatus = document.getElementById('batch-progress-status');
    this.batchProgressPct = document.getElementById('batch-progress-pct');
    this.batchProgressBar = document.getElementById('batch-progress-bar');
    this.activeBatchMode = 'seq';
  }

  async init() {
    this.initTheme();
    this.renderCategoryTabs();
    this.populateSymbologySelect();
    this.renderWizardNav();
    this.renderLogoPresets();
    this.bindEvents();
    this.bindLogoStudioEvents();
    this.bindExportEvents();
    this.bindPdfModalEvents();
    this.bindBatchModalEvents();

    // Parse URL Search Parameters (Deep linking from Programmatic SEO landing pages)
    const urlParams = new URLSearchParams(window.location.search);
    const paramSymbology = urlParams.get('symbology');
    const paramWizard = urlParams.get('wizard');

    let targetGenId = 'qr-code';
    if (paramSymbology && getGenerator(paramSymbology)) {
      targetGenId = paramSymbology;
    }

    const initialGen = getGenerator(targetGenId) || getAllGenerators()[0];
    this.selectGenerator(initialGen.id);

    if (paramWizard && targetGenId === 'qr-code' && getWizard(paramWizard)) {
      this.activeWizardId = paramWizard;
      this.qrWizardNav?.querySelectorAll('.wizard-pill-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.wizardId === paramWizard);
      });
      this.renderWizardForm(paramWizard);
    }

    // Warm up engine in background
    prefetchEngines();

    // Initialize privacy & cookie notice banner
    initCookieBanner();
  }

  /* --------------------------------------------------------------------------
     Theme Management
     -------------------------------------------------------------------------- */
  initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeButtonLabel(savedTheme);

    this.themeToggleBtn?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      this.updateThemeButtonLabel(next);
    });
  }

  updateThemeButtonLabel(theme) {
    if (!this.themeToggleBtn) return;
    this.themeToggleBtn.innerHTML = theme === 'dark' 
      ? `<span>☀️</span> Light` 
      : `<span>🌙</span> Dark`;
  }

  /* --------------------------------------------------------------------------
     Category Tabs & Dropdown Select
     -------------------------------------------------------------------------- */
  renderCategoryTabs() {
    if (!this.categoryTabs) return;
    const categories = getCategories();
    const existingButtons = this.categoryTabs.querySelectorAll('.tab-btn');

    if (existingButtons.length === categories.length) {
      existingButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.activeCategory = btn.dataset.category;
          this.categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.populateSymbologySelect();
        });
      });
      return;
    }

    this.categoryTabs.innerHTML = '';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tab-btn ${cat.id === this.activeCategory ? 'active' : ''}`;
      btn.textContent = `${cat.name} (${cat.count})`;
      btn.dataset.category = cat.id;

      btn.addEventListener('click', () => {
        this.activeCategory = cat.id;
        this.categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.populateSymbologySelect();
      });

      this.categoryTabs.appendChild(btn);
    });
  }

  populateSymbologySelect() {
    if (!this.symbologySelect) return;
    const items = getGeneratorsByCategory(this.activeCategory);

    // If already pre-rendered with all items and filter is 'all', preserve markup
    if (this.symbologySelect.options.length === items.length && this.activeCategory === 'all') {
      if (this.currentGenerator) {
        this.symbologySelect.value = this.currentGenerator.id;
      }
      return;
    }

    this.symbologySelect.innerHTML = '';
    items.forEach(gen => {
      const opt = document.createElement('option');
      opt.value = gen.id;
      opt.textContent = `${gen.name} [${gen.category.toUpperCase()}]`;
      this.symbologySelect.appendChild(opt);
    });

    // If current generator is in filtered list, keep it selected; else pick first
    if (this.currentGenerator && items.some(g => g.id === this.currentGenerator.id)) {
      this.symbologySelect.value = this.currentGenerator.id;
    } else if (items.length > 0) {
      this.selectGenerator(items[0].id);
    }
  }

  /* --------------------------------------------------------------------------
     Generator Selection & Mode Switching
     -------------------------------------------------------------------------- */
  selectGenerator(generatorId) {
    const gen = getGenerator(generatorId);
    if (!gen) return;

    this.currentGenerator = gen;
    this.symbologySelect.value = gen.id;
    this.symbologyDesc.textContent = gen.description;

    const isQr = gen.id === 'qr-code';

    if (isQr) {
      // Show Smart QR Wizards & Logo Studio
      if (this.qrWizardSection) this.qrWizardSection.style.display = 'block';
      if (this.logoStudioSection) this.logoStudioSection.style.display = 'block';
      if (this.standardPayloadGroup) this.standardPayloadGroup.style.display = 'none';

      // Render active wizard form
      this.renderWizardForm(this.activeWizardId);
    } else {
      // Show standard raw payload input for 1D/2D barcodes
      if (this.qrWizardSection) this.qrWizardSection.style.display = 'none';
      if (this.logoStudioSection) this.logoStudioSection.style.display = 'none';
      if (this.standardPayloadGroup) this.standardPayloadGroup.style.display = 'block';

      // Reset payload with generator default or preserve current if compatible
      if (!this.payloadInput.value || this.payloadInput.dataset.lastGen !== gen.id) {
        this.payloadInput.value = gen.schema.defaultPayload || '';
      }
      this.payloadInput.placeholder = gen.schema.placeholder || '';
    }

    this.payloadInput.dataset.lastGen = gen.id;

    // Build dynamic options controls
    this.renderDynamicControls(gen);

    // Validate and render
    this.validateAndRender();
  }

  /* --------------------------------------------------------------------------
     Smart QR Payload Wizards Navigation & Form Rendering
     -------------------------------------------------------------------------- */
  renderWizardNav() {
    if (!this.qrWizardNav) return;
    const existingBtns = this.qrWizardNav.querySelectorAll('.wizard-pill-btn');
    if (existingBtns.length > 0) {
      existingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.activeWizardId = btn.dataset.wizardId;
          this.qrWizardNav.querySelectorAll('.wizard-pill-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.renderWizardForm(btn.dataset.wizardId);
        });
      });
      return;
    }

    this.qrWizardNav.innerHTML = '';
    const wizards = getAllWizards();

    wizards.forEach(wz => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `wizard-pill-btn ${wz.id === this.activeWizardId ? 'active' : ''}`;
      btn.dataset.wizardId = wz.id;
      btn.innerHTML = `<span>${wz.icon}</span> <span>${wz.name}</span>`;

      btn.addEventListener('click', () => {
        this.activeWizardId = wz.id;
        this.qrWizardNav.querySelectorAll('.wizard-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderWizardForm(wz.id);
      });

      this.qrWizardNav.appendChild(btn);
    });
  }

  renderWizardForm(wizardId) {
    if (!this.wizardFormContainer) return;
    const wizard = getWizard(wizardId);
    if (!wizard) return;

    // Adopt pre-rendered URL wizard markup without rebuilding DOM
    const existingCard = this.wizardFormContainer.querySelector('.wizard-form-card');
    const existingInput = this.wizardFormContainer.querySelector('#wz-url');
    if (wizardId === 'url' && existingCard && existingInput && !existingCard.dataset.hydrated) {
      existingCard.dataset.hydrated = 'true';
      const previewSpan = existingCard.querySelector('#wizard-payload-preview');
      const handleWizardChange = () => {
        const data = {};
        wizard.fields.forEach(f => {
          const el = this.wizardFormContainer.querySelector(`#wz-${f.id}`);
          if (el) {
            data[f.id] = f.type === 'checkbox' ? el.checked : el.value;
          }
        });
        const compiled = wizard.compile(data);
        this.payloadInput.value = compiled;
        if (previewSpan) previewSpan.textContent = compiled;
        this.validateAndRender();
      };

      const inputs = this.wizardFormContainer.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.addEventListener('input', handleWizardChange);
        input.addEventListener('change', handleWizardChange);
      });
      handleWizardChange();
      return;
    }

    this.wizardFormContainer.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'wizard-form-card';

    // Wizard Card Header
    card.innerHTML = `
      <div class="wizard-header">
        <span>${wizard.icon}</span>
        <span>${wizard.name}</span>
        <span style="font-size: 0.76rem; font-weight: 400; color: var(--text-muted); margin-left: auto;">
          ${wizard.description}
        </span>
      </div>
      <div class="wizard-fields-grid" id="wizard-fields-grid"></div>
      <div style="font-size: 0.72rem; color: var(--text-muted); padding-top: 0.5rem; border-top: 1px dashed var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
        <span>Compiled QR Payload:</span>
        <span id="wizard-payload-preview" style="font-family: var(--font-mono); color: var(--accent-cyan); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 320px;"></span>
      </div>
    `;

    const grid = card.querySelector('#wizard-fields-grid');
    const previewSpan = card.querySelector('#wizard-payload-preview');

    wizard.fields.forEach(field => {
      const wrapper = document.createElement('div');
      const isFullWidth = field.type === 'textarea' || ['address', 'description', 'text', 'title'].includes(field.id);
      wrapper.className = `control-item ${isFullWidth ? 'wizard-field-full' : ''}`;

      if (field.type === 'select') {
        wrapper.innerHTML = `
          <div class="control-item-header">
            <span>${field.label}</span>
          </div>
          <select class="styled-select" id="wz-${field.id}">
            ${field.options.map(opt => `
              <option value="${opt.value}" ${opt.value === field.default ? 'selected' : ''}>${opt.label}</option>
            `).join('')}
          </select>
        `;
      } else if (field.type === 'checkbox') {
        wrapper.innerHTML = `
          <label class="toggle-wrapper" for="wz-${field.id}" style="margin-top: 0.5rem;">
            <span class="control-item-header">${field.label}</span>
            <div class="toggle-switch">
              <input type="checkbox" id="wz-${field.id}" ${field.default ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </div>
          </label>
        `;
      } else if (field.type === 'textarea') {
        wrapper.innerHTML = `
          <div class="control-item-header">
            <span>${field.label} ${field.required ? '<span style="color: var(--danger)">*</span>' : ''}</span>
          </div>
          <textarea class="styled-input" id="wz-${field.id}" rows="3" placeholder="${field.placeholder || ''}" spellcheck="false">${field.default || ''}</textarea>
        `;
      } else {
        wrapper.innerHTML = `
          <div class="control-item-header">
            <span>${field.label} ${field.required ? '<span style="color: var(--danger)">*</span>' : ''}</span>
          </div>
          <input type="${field.type}" class="styled-input" id="wz-${field.id}" 
            placeholder="${field.placeholder || ''}" value="${field.default !== undefined ? field.default : ''}"
            autocomplete="off" spellcheck="false">
        `;
      }

      grid.appendChild(wrapper);
    });

    this.wizardFormContainer.appendChild(card);

    // Event listener to compile form data on any user modification
    const handleWizardChange = () => {
      const data = {};
      wizard.fields.forEach(f => {
        const el = this.wizardFormContainer.querySelector(`#wz-${f.id}`);
        if (el) {
          data[f.id] = f.type === 'checkbox' ? el.checked : el.value;
        }
      });
      const compiled = wizard.compile(data);
      this.payloadInput.value = compiled;
      if (previewSpan) previewSpan.textContent = compiled;
      this.validateAndRender();
    };

    const inputs = this.wizardFormContainer.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', handleWizardChange);
      input.addEventListener('change', handleWizardChange);
    });

    // Execute initial compilation immediately
    handleWizardChange();
  }

  /* --------------------------------------------------------------------------
     Logo Studio & Preset Branding Icons
     -------------------------------------------------------------------------- */
  renderLogoPresets() {
    if (!this.presetIconsGrid) return;
    const existingChips = this.presetIconsGrid.querySelectorAll('.preset-icon-chip');
    if (existingChips.length === LOGO_PRESETS.length) {
      existingChips.forEach(chip => {
        const preset = LOGO_PRESETS.find(p => p.id === chip.dataset.presetId);
        if (preset) {
          chip.addEventListener('click', () => {
            this.applyLogoPreset(preset);
          });
        }
      });
      return;
    }

    this.presetIconsGrid.innerHTML = '';
    LOGO_PRESETS.forEach(preset => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `preset-icon-chip ${preset.id === this.activeLogoPresetId ? 'active' : ''}`;
      chip.dataset.presetId = preset.id;
      const iconMarkup = preset.dataUrl
        ? `<img src="${preset.dataUrl}" alt="" class="preset-chip-img" width="16" height="16" aria-hidden="true">`
        : `<span>${preset.icon}</span>`;
      chip.innerHTML = `${iconMarkup} <span>${preset.name}</span>`;

      chip.addEventListener('click', () => {
        this.applyLogoPreset(preset);
      });

      this.presetIconsGrid.appendChild(chip);
    });
  }

  applyLogoPreset(preset) {
    this.activeLogoPresetId = preset.id;
    this.presetIconsGrid?.querySelectorAll('.preset-icon-chip').forEach(c => c.classList.remove('active'));
    const activeChip = this.presetIconsGrid?.querySelector(`[data-preset-id="${preset.id}"]`);
    activeChip?.classList.add('active');

    if (preset.id === 'none' || !preset.dataUrl) {
      this.clearLogo();
      return;
    }

    this.activeLogoDataUrl = preset.dataUrl;
    this.showLogoPreview(preset.dataUrl);
    this.syncEccControlLock();
    this.queueRender();
    this.showToast(`Applied ${preset.name} brand icon. Auto-locked to Error Correction H (30%).`);
  }

  bindLogoStudioEvents() {
    // Dropzone click delegation: if no logo, open file dialog; if logo active, only change button triggers it
    this.logoDropzone?.addEventListener('click', (e) => {
      if (e.target.closest('#btn-remove-logo')) return;
      if (e.target.closest('#btn-change-logo')) {
        this.logoFileInput?.click();
        return;
      }
      if (!this.activeLogoDataUrl) {
        this.logoFileInput?.click();
      }
    });

    // File input change
    this.logoFileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) this.processLogoFile(file);
    });

    // Drag & Drop onto dropzone
    ['dragenter', 'dragover'].forEach(eventName => {
      this.logoDropzone?.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.logoDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      this.logoDropzone?.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.logoDropzone.classList.remove('dragover');
      });
    });

    this.logoDropzone?.addEventListener('drop', (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) this.processLogoFile(file);
    });

    // Change Logo button
    this.btnChangeLogo?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.logoFileInput?.click();
    });

    // Remove Logo button
    this.btnRemoveLogo?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.clearLogo();
    });
  }

  processLogoFile(file) {
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml|webp)$/)) {
      this.showToast('Please upload a valid image (PNG, SVG, JPEG, or WebP).', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.showToast('Logo file exceeds 2MB size limit.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.activeLogoDataUrl = e.target.result;
      this.activeLogoPresetId = 'custom';
      this.presetIconsGrid?.querySelectorAll('.preset-icon-chip').forEach(c => c.classList.remove('active'));
      this.showLogoPreview(this.activeLogoDataUrl);
      this.syncEccControlLock();
      this.queueRender();
      this.showToast('Center logo uploaded! Error correction auto-locked to Level H (30%).');
    };
    reader.onerror = () => {
      this.showToast('Failed to read logo image.', 'error');
    };
    reader.readAsDataURL(file);
  }

  showLogoPreview(url) {
    if (this.dropzoneText) this.dropzoneText.style.display = 'none';
    if (this.logoPreviewBox) this.logoPreviewBox.style.display = 'flex';
    if (this.logoThumbImg) this.logoThumbImg.src = url;
  }

  clearLogo() {
    this.activeLogoDataUrl = '';
    this.activeLogoPresetId = 'none';
    if (this.logoFileInput) this.logoFileInput.value = '';
    if (this.dropzoneText) this.dropzoneText.style.display = 'block';
    if (this.logoPreviewBox) this.logoPreviewBox.style.display = 'none';
    if (this.logoThumbImg) this.logoThumbImg.src = '';
    this.presetIconsGrid?.querySelectorAll('.preset-icon-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.presetId === 'none');
    });
    this.syncEccControlLock();
    this.queueRender();
    this.showToast('Center logo removed.');
  }

  syncEccControlLock() {
    const eccSelect = document.getElementById('ctrl-errorCorrectionLevel');
    if (!eccSelect) return;

    if (this.activeLogoDataUrl && this.currentGenerator?.id === 'qr-code') {
      eccSelect.value = 'H';
      eccSelect.disabled = true;
      eccSelect.title = 'Locked to High (30% recovery) while a center logo is embedded.';
    } else {
      eccSelect.disabled = false;
      eccSelect.title = '';
    }
  }

  /* --------------------------------------------------------------------------
     Dynamic Option Controls Generation
     -------------------------------------------------------------------------- */
  renderDynamicControls(gen) {
    if (!this.dynamicControls) return;

    if (!gen.controls || gen.controls.length === 0) {
      this.dynamicControls.style.display = 'none';
      return;
    }

    this.dynamicControls.style.display = 'grid';

    // Adopt pre-rendered controls for qr-code without DOM recreation
    const isPreRendered = gen.id === 'qr-code' && this.dynamicControls.querySelector('#ctrl-errorCorrectionLevel');
    if (isPreRendered && !this.dynamicControls.dataset.hydrated) {
      this.dynamicControls.dataset.hydrated = 'true';
      this.currentOptions = {};
      gen.controls.forEach(ctrl => {
        const input = document.getElementById(`ctrl-${ctrl.id}`);
        if (ctrl.type === 'slider') {
          const badge = document.getElementById(`val-${ctrl.id}`);
          this.currentOptions[ctrl.id] = input ? Number(input.value) : ctrl.default;
          input?.addEventListener('input', (e) => {
            this.currentOptions[ctrl.id] = Number(e.target.value);
            if (badge) badge.textContent = `${e.target.value}${ctrl.unit || ''}`;
            this.queueRender();
          });
        } else if (ctrl.type === 'toggle') {
          this.currentOptions[ctrl.id] = input ? input.checked : ctrl.default;
          input?.addEventListener('change', (e) => {
            this.currentOptions[ctrl.id] = e.target.checked;
            this.queueRender();
          });
        } else if (ctrl.type === 'select') {
          this.currentOptions[ctrl.id] = input ? input.value : ctrl.default;
          input?.addEventListener('change', (e) => {
            this.currentOptions[ctrl.id] = e.target.value;
            this.queueRender();
          });
        } else if (ctrl.type === 'color') {
          this.currentOptions[ctrl.id] = input ? input.value : ctrl.default;
          input?.addEventListener('input', (e) => {
            this.currentOptions[ctrl.id] = e.target.value;
            this.queueRender();
          });
        }
      });
      this.syncEccControlLock();
      return;
    }

    this.dynamicControls.innerHTML = '';
    this.currentOptions = {};

    gen.controls.forEach(ctrl => {
      this.currentOptions[ctrl.id] = ctrl.default;

      const item = document.createElement('div');
      item.className = 'control-item';

      if (ctrl.type === 'slider') {
        item.innerHTML = `
          <div class="control-item-header">
            <span>${ctrl.label}</span>
            <span class="control-val-badge" id="val-${ctrl.id}">${ctrl.default}${ctrl.unit || ''}</span>
          </div>
          <input type="range" class="styled-range" id="ctrl-${ctrl.id}" 
            min="${ctrl.min}" max="${ctrl.max}" value="${ctrl.default}" step="${ctrl.step || 1}">
        `;

        const input = item.querySelector('input');
        const badge = item.querySelector(`#val-${ctrl.id}`);
        input.addEventListener('input', (e) => {
          this.currentOptions[ctrl.id] = Number(e.target.value);
          badge.textContent = `${e.target.value}${ctrl.unit || ''}`;
          this.queueRender();
        });

      } else if (ctrl.type === 'toggle') {
        item.innerHTML = `
          <label class="toggle-wrapper" for="ctrl-${ctrl.id}">
            <span class="control-item-header">${ctrl.label}</span>
            <div class="toggle-switch">
              <input type="checkbox" id="ctrl-${ctrl.id}" ${ctrl.default ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </div>
          </label>
        `;

        const input = item.querySelector('input');
        input.addEventListener('change', (e) => {
          this.currentOptions[ctrl.id] = e.target.checked;
          this.queueRender();
        });

      } else if (ctrl.type === 'select') {
        item.innerHTML = `
          <div class="control-item-header">
            <span>${ctrl.label}</span>
          </div>
          <select class="styled-select" id="ctrl-${ctrl.id}">
            ${ctrl.options.map(opt => `
              <option value="${opt.value}" ${opt.value === ctrl.default ? 'selected' : ''}>${opt.label}</option>
            `).join('')}
          </select>
        `;

        const select = item.querySelector('select');
        select.addEventListener('change', (e) => {
          this.currentOptions[ctrl.id] = e.target.value;
          this.queueRender();
        });

      } else if (ctrl.type === 'color') {
        item.innerHTML = `
          <div class="control-item-header">
            <span>${ctrl.label}</span>
          </div>
          <div class="color-picker-group">
            <input type="color" class="styled-color-input" id="ctrl-${ctrl.id}" value="${ctrl.default}">
            <span class="control-val-badge" id="val-${ctrl.id}">${ctrl.default}</span>
          </div>
        `;

        const input = item.querySelector('input');
        const badge = item.querySelector(`#val-${ctrl.id}`);
        input.addEventListener('input', (e) => {
          this.currentOptions[ctrl.id] = e.target.value;
          badge.textContent = e.target.value;
          this.queueRender();
        });
      }

      this.dynamicControls.appendChild(item);
    });

    this.syncEccControlLock();
  }

  /* --------------------------------------------------------------------------
     Event Binding
     -------------------------------------------------------------------------- */
  bindEvents() {
    // Horizontal wheel scroll support for tabs and wizard nav
    const enableWheelScroll = (el) => {
      if (!el) return;
      el.addEventListener('wheel', (e) => {
        if (el.scrollWidth > el.clientWidth && e.deltaY !== 0) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    };
    enableWheelScroll(this.categoryTabs);
    enableWheelScroll(this.qrWizardNav);

    this.symbologySelect?.addEventListener('change', (e) => {
      this.selectGenerator(e.target.value);
    });

    this.payloadInput?.addEventListener('input', () => {
      this.validateAndRender();
    });

    this.autoChecksumBtn?.addEventListener('click', () => {
      if (!this.currentGenerator || !this.currentGenerator.schema.computeChecksum) return;
      try {
        const computed = this.currentGenerator.schema.computeChecksum(this.payloadInput.value);
        this.payloadInput.value = computed;
        this.validateAndRender();
        this.showToast('Check digit automatically calculated and appended.');
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    });

    // Canvas Viewport background checkerboard toggle
    this.btnToggleBg?.addEventListener('click', () => {
      this.canvasViewport.classList.toggle('checkerboard');
    });
  }

  /* --------------------------------------------------------------------------
     Export & Print Studio Events
     -------------------------------------------------------------------------- */
  bindExportEvents() {
    // Resolution pills click handler
    this.exportResPills?.addEventListener('click', (e) => {
      const btn = e.target.closest('.res-pill-btn');
      if (!btn) return;
      this.activeScaleFactor = Number(btn.dataset.scale) || 1;
      this.exportResPills.querySelectorAll('.res-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.showToast(`Selected ${btn.textContent} resolution for PNG export.`);
    });

    // Action button triggers
    this.btnDownloadPng?.addEventListener('click', () => this.exportPng());
    this.btnDownloadSvg?.addEventListener('click', () => this.exportSvg());
    this.btnCopyClipboard?.addEventListener('click', () => this.copyToClipboard());
  }

  bindPdfModalEvents() {
    // Open modal
    this.btnOpenPdfModal?.addEventListener('click', () => {
      if (this.pdfModal) this.pdfModal.style.display = 'flex';
    });

    // Close modal handlers
    const closeModal = () => {
      if (this.pdfModal) this.pdfModal.style.display = 'none';
    };

    this.btnClosePdfModal?.addEventListener('click', closeModal);
    this.btnCancelPdf?.addEventListener('click', closeModal);
    this.pdfModal?.addEventListener('click', (e) => {
      if (e.target === this.pdfModal) closeModal();
    });

    // Template selection change
    this.pdfTemplateSelect?.addEventListener('change', (e) => {
      const tplId = e.target.value;
      const tpl = AVERY_TEMPLATES[tplId];
      if (!tpl) return;

      if (this.pdfTemplateDesc) {
        this.pdfTemplateDesc.textContent = tpl.description;
      }

      const isSingle = tplId === 'single-center';
      if (this.pdfQuantityGroup) this.pdfQuantityGroup.style.display = isSingle ? 'none' : 'block';
      if (this.pdfTitleGroup) this.pdfTitleGroup.style.display = isSingle ? 'block' : 'none';

      if (this.pdfQuantitySlider) {
        this.pdfQuantitySlider.max = tpl.perSheet;
        this.pdfQuantitySlider.value = tpl.perSheet;
        if (this.valPdfQuantity) this.valPdfQuantity.textContent = tpl.perSheet;
      }
    });

    // Quantity slider input
    this.pdfQuantitySlider?.addEventListener('input', (e) => {
      if (this.valPdfQuantity) this.valPdfQuantity.textContent = e.target.value;
    });

    // Generate & Download PDF
    this.btnGeneratePdf?.addEventListener('click', async () => {
      try {
        const payload = this.payloadInput.value.trim();
        if (!payload) {
          this.showToast('Please enter a valid code payload first.', 'error');
          return;
        }

        const originalText = this.btnGeneratePdf.innerHTML;
        this.btnGeneratePdf.disabled = true;
        this.btnGeneratePdf.innerHTML = `<span>⏳</span> Generating PDF...`;

        await generatePdfLabelSheet({
          generator: this.currentGenerator,
          payload: payload,
          options: this.currentOptions,
          logoDataUrl: this.currentGenerator.id === 'qr-code' ? this.activeLogoDataUrl : '',
          templateId: this.pdfTemplateSelect?.value || 'avery-5160',
          quantity: Number(this.pdfQuantitySlider?.value) || 30,
          sheetTitle: this.pdfSheetTitle?.value || 'Barcodes & QR Labels',
          showCaption: this.pdfShowCaption ? this.pdfShowCaption.checked : true
        });

        closeModal();
        this.showToast('Print-ready PDF label sheet downloaded!');
        this.btnGeneratePdf.disabled = false;
        this.btnGeneratePdf.innerHTML = originalText;
      } catch (err) {
        console.error('PDF generation error:', err);
        this.showToast(`PDF generation failed: ${err.message}`, 'error');
        if (this.btnGeneratePdf) {
          this.btnGeneratePdf.disabled = false;
          this.btnGeneratePdf.innerHTML = `Generate PDF`;
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     Batch Code Generator & ZIP Export Modal Events
     -------------------------------------------------------------------------- */
  bindBatchModalEvents() {
    const openModal = () => {
      if (!this.batchModal) return;
      this.batchModal.style.display = 'flex';
      this.batchProgressBox.style.display = 'none';
      this.updateBatchSeqPreview();
    };

    const closeModal = () => {
      if (!this.batchModal) return;
      this.batchModal.style.display = 'none';
      this.batchProgressBox.style.display = 'none';
    };

    this.btnOpenBatchModal?.addEventListener('click', openModal);
    this.btnCloseBatchModal?.addEventListener('click', closeModal);
    this.btnCancelBatch?.addEventListener('click', closeModal);

    this.batchModal?.addEventListener('click', (e) => {
      if (e.target === this.batchModal) closeModal();
    });

    // Tab Switching
    this.tabBatchSeq?.addEventListener('click', () => {
      this.activeBatchMode = 'seq';
      this.tabBatchSeq.classList.add('active');
      this.tabBatchCsv.classList.remove('active');
      this.batchSeqPanel.style.display = 'block';
      this.batchCsvPanel.style.display = 'none';
    });

    this.tabBatchCsv?.addEventListener('click', () => {
      this.activeBatchMode = 'csv';
      this.tabBatchCsv.classList.add('active');
      this.tabBatchSeq.classList.remove('active');
      this.batchSeqPanel.style.display = 'none';
      this.batchCsvPanel.style.display = 'block';
    });

    // Live update sequence preview
    [this.batchPrefix, this.batchStart, this.batchCount, this.batchPad, this.batchSuffix].forEach(input => {
      input?.addEventListener('input', () => this.updateBatchSeqPreview());
    });

    // Live update CSV count
    this.batchCsvInput?.addEventListener('input', () => {
      const items = parseCsvOrLines(this.batchCsvInput.value);
      if (this.valBatchCsvCount) {
        this.valBatchCsvCount.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;
      }
    });

    // Batch Generation Execution
    this.btnGenerateBatch?.addEventListener('click', async () => {
      let items = [];
      if (this.activeBatchMode === 'seq') {
        items = generateSequenceList({
          prefix: this.batchPrefix?.value || '',
          start: parseInt(this.batchStart?.value, 10) || 1,
          count: parseInt(this.batchCount?.value, 10) || 10,
          padLength: parseInt(this.batchPad?.value, 10) || 3,
          suffix: this.batchSuffix?.value || ''
        });
      } else {
        items = parseCsvOrLines(this.batchCsvInput?.value || '');
      }

      if (!items || !items.length) {
        this.showToast('Please specify at least one code payload to generate.', 'error');
        return;
      }

      const formatVal = this.batchFormatSelect?.value || 'png-2x';
      const isSvg = formatVal === 'svg';
      const scaleFactor = formatVal === 'png-4x' ? 4 : (formatVal === 'png-1x' ? 1 : 2);

      const originalBtnText = this.btnGenerateBatch.innerHTML;
      this.btnGenerateBatch.disabled = true;
      this.batchProgressBox.style.display = 'block';
      this.batchProgressStatus.textContent = `Starting batch of ${items.length} codes...`;
      this.batchProgressBar.style.width = '0%';
      this.batchProgressPct.textContent = '0%';

      try {
        await generateBatchZip({
          generator: this.currentGenerator,
          items: items,
          format: isSvg ? 'svg' : 'png',
          scaleFactor: scaleFactor,
          options: this.currentOptions,
          logoDataUrl: this.currentGenerator.id === 'qr-code' ? this.activeLogoDataUrl : '',
          onProgress: ({ current, total, percent, currentItem }) => {
            this.batchProgressBar.style.width = `${percent}%`;
            this.batchProgressPct.textContent = `${percent}%`;
            this.batchProgressStatus.textContent = `Rendering ${current} of ${total} (${currentItem.slice(0, 16)})...`;
          }
        });

        this.showToast(`Successfully downloaded ZIP with ${items.length} codes!`);
        closeModal();
      } catch (err) {
        console.error('Batch generation error:', err);
        this.showToast(`Batch generation failed: ${err.message}`, 'error');
      } finally {
        this.btnGenerateBatch.disabled = false;
        this.btnGenerateBatch.innerHTML = originalBtnText;
      }
    });
  }

  updateBatchSeqPreview() {
    if (!this.batchSeqPreview) return;
    const prefix = this.batchPrefix?.value || '';
    const start = parseInt(this.batchStart?.value, 10) || 1;
    const count = parseInt(this.batchCount?.value, 10) || 10;
    const pad = parseInt(this.batchPad?.value, 10) || 0;
    const suffix = this.batchSuffix?.value || '';

    const firstStr = pad > 0 ? String(start).padStart(pad, '0') : String(start);
    const lastNum = start + count - 1;
    const lastStr = pad > 0 ? String(lastNum).padStart(pad, '0') : String(lastNum);

    this.batchSeqPreview.textContent = `${prefix}${firstStr}${suffix} ... ${prefix}${lastStr}${suffix} (${count} codes)`;
  }

  /* --------------------------------------------------------------------------
     Validation & Rendering Orchestration
     -------------------------------------------------------------------------- */
  validateAndRender() {
    if (!this.currentGenerator) return;

    const payload = this.payloadInput.value.trim();
    const { schema } = this.currentGenerator;

    // Check Auto-Checksum availability
    if (schema.autoChecksum && typeof schema.computeChecksum === 'function') {
      this.autoChecksumBtn.style.display = 'block';
    } else {
      this.autoChecksumBtn.style.display = 'none';
    }

    // Input Validation
    const validation = engine.validate(this.currentGenerator, payload);

    if (!validation.valid) {
      this.payloadInput.classList.add('is-invalid');
      this.validationMsg.className = 'validation-msg error';
      this.validationMsg.innerHTML = `<span>⚠️</span> ${validation.error}`;
      this.showPreviewError(validation.error);
      return;
    }

    this.payloadInput.classList.remove('is-invalid');
    this.validationMsg.className = 'validation-msg success';
    this.validationMsg.innerHTML = `<span>✅</span> Valid payload for ${this.currentGenerator.name}`;
    this.hidePreviewError();

    this.queueRender();
  }

  queueRender() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.executeRender();
    }, 120);
  }

  async executeRender() {
    if (!this.currentGenerator) return;

    const payload = this.payloadInput.value.trim();
    if (!payload) return;

    this.setEngineStatus('loading', 'Rendering...');

    try {
      const targets = {
        canvas: this.previewCanvas,
        container: this.qrStyledContainer
      };

      // Merge options including active logo for QR codes
      const renderOptions = {
        ...this.currentOptions,
        image: this.currentGenerator.id === 'qr-code' ? this.activeLogoDataUrl : ''
      };

      await engine.render(
        this.currentGenerator,
        payload,
        renderOptions,
        targets
      );

      this.hidePreviewError();
      this.setEngineStatus('ready', 'Engine Ready');
    } catch (err) {
      console.error('[RenderError]', err);
      this.showPreviewError(err.message || 'Failed to render code.');
      this.setEngineStatus('loading', 'Error');
    }
  }

  setEngineStatus(status, text) {
    if (!this.engineStatus) return;
    this.engineStatus.className = `engine-status-badge ${status}`;
    this.engineStatus.textContent = text;
  }

  showPreviewError(msg) {
    if (this.previewError && this.previewErrorText) {
      this.previewErrorText.textContent = msg;
      this.previewError.classList.add('visible');
    }
    if (this.previewCanvas) this.previewCanvas.style.display = 'none';
    if (this.qrStyledContainer) this.qrStyledContainer.style.display = 'none';
  }

  hidePreviewError() {
    if (this.previewError) {
      this.previewError.classList.remove('visible');
    }
  }

  /* --------------------------------------------------------------------------
     Export Handlers
     -------------------------------------------------------------------------- */
  async exportPng() {
    try {
      const payload = this.payloadInput.value.trim();
      if (!payload) return;

      await exportHighResPng({
        generator: this.currentGenerator,
        payload: payload,
        options: this.currentOptions,
        scaleFactor: this.activeScaleFactor,
        logoDataUrl: this.currentGenerator.id === 'qr-code' ? this.activeLogoDataUrl : ''
      });
      this.showToast(`High-res PNG (${this.activeScaleFactor}x) downloaded successfully!`);
    } catch (e) {
      this.showToast(`PNG export failed: ${e.message}`, 'error');
    }
  }

  async exportSvg() {
    try {
      const payload = this.payloadInput.value.trim();
      if (!payload) return;

      await exportVectorSvg({
        generator: this.currentGenerator,
        payload: payload,
        options: this.currentOptions,
        logoDataUrl: this.currentGenerator.id === 'qr-code' ? this.activeLogoDataUrl : ''
      });
      this.showToast('Crisp Vector SVG downloaded successfully!');
    } catch (e) {
      this.showToast(`SVG export failed: ${e.message}`, 'error');
    }
  }

  async copyToClipboard() {
    try {
      await copyImageToClipboard({
        generator: this.currentGenerator,
        previewCanvas: this.previewCanvas,
        qrStyledContainer: this.qrStyledContainer
      });
      this.showToast('Copied barcode image to clipboard!');
    } catch (err) {
      console.warn('Clipboard write error:', err);
      this.showToast('Direct clipboard copy not supported or permitted in this context.', 'error');
    }
  }

  showToast(message, type = 'info') {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    const iconSpan = document.createElement('span');
    iconSpan.textContent = type === 'error' ? '⚠️' : '🎉';
    const msgSpan = document.createElement('span');
    msgSpan.textContent = message;
    toast.appendChild(iconSpan);
    toast.appendChild(msgSpan);
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init().catch(err => {
    console.error('[AppInitError]', err);
  });
});
