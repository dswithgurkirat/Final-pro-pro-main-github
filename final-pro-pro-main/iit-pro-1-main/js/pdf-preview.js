/* ══════════════════════════════════════
   PDF PREVIEW PANEL
   Fixed right-side panel for Front Matter,
   Chapters, and Plate Section.
══════════════════════════════════════ */
const pdfPreview = {
  scale: 1.0,
  currentView: null,
  panel: null,
  body: null,
  titleEl: null,

  SECTION_TITLES: {
    'front-matter': 'Front Matter Preview',
    'chapters': 'Chapters Preview',
    'plates': 'Plate Section Preview'
  },

  FM_LABELS: {
    cover: 'Cover Page',
    cert: 'Certificate',
    toc: 'Content Page',
    pref: 'Preface'
  },

  init() {
    this.panel = document.getElementById('pdf-preview-panel');
    if (!this.panel) return;
    this.body = this.panel.querySelector('.pdf-preview-body');
    this.zoomLabel = document.getElementById('pdf-preview-zoom-lbl');
    this.titleEl = document.getElementById('pdf-preview-title');
    this.bindEvents();
  },

  bindEvents() {
    const el = (id) => document.getElementById(id);
    el('pdf-preview-zoom-in')?.addEventListener('click', () => this.zoomIn());
    el('pdf-preview-zoom-out')?.addEventListener('click', () => this.zoomOut());
    el('pdf-preview-refresh')?.addEventListener('click', () => this.refresh());
    el('pdf-preview-fullscreen')?.addEventListener('click', () => this.fullScreen());
    el('pdf-preview-download')?.addEventListener('click', () => this.download());
  },

  show(viewId) {
    this.currentView = viewId;
    document.body.classList.add('preview-open');
    if (this.panel) this.panel.classList.add('open');
    if (this.titleEl) this.titleEl.textContent = this.SECTION_TITLES[viewId] || 'PDF Preview';
    this.scale = 1.0;
    this.refresh();
    if (window.initLucide) initLucide();
  },

  hide() {
    this.currentView = null;
    document.body.classList.remove('preview-open');
    if (this.panel) {
      this.panel.classList.remove('open');
      this.panel.style.transform = '';
    }
    if (document.fullscreenElement === this.panel) {
      document.exitFullscreen().catch(() => {});
    }
  },

  /** Called after uploads — refreshes only if the matching section is open */
  notifyUpdate(viewId) {
    if (this.currentView === viewId) this.refresh();
  },

  refresh() {
    if (!this.body || !this.currentView) return;
    switch (this.currentView) {
      case 'front-matter': this.renderFrontMatter(); break;
      case 'chapters': this.renderChapters(); break;
      case 'plates': this.renderPlates(); break;
    }
  },

  getFrontMatterPages() {
    const types = ['cover', 'cert', 'toc', 'pref'];
    const pages = [];
    types.forEach(type => {
      const imgs = S.uploadedPDFs && S.uploadedPDFs[type];
      if (imgs && imgs.length) {
        const sectionLabel = this.FM_LABELS[type] || type;
        imgs.forEach((img, idx) => {
          pages.push({
            src: img,
            label: imgs.length > 1 ? `${sectionLabel} — Page ${idx + 1}` : sectionLabel
          });
        });
      }
    });
    return pages;
  },

  getChapterPages() {
    const pages = [];
    S.chapters.forEach((ch, i) => {
      const imgs = S.chapterPDFs && S.chapterPDFs[ch.id];
      if (imgs && imgs.length) {
        imgs.forEach((img, idx) => {
          pages.push({
            src: img,
            label: imgs.length > 1
              ? `Chapter ${i + 1} — Page ${idx + 1}`
              : `Chapter ${i + 1}: ${ch.name}`
          });
        });
      }
    });
    return pages;
  },

  getPlatePages() {
    const pages = [];
    S.plates.forEach((p, i) => {
      if (p.pages && p.pages.length) {
        p.pages.forEach((img, idx) => {
          pages.push({
            src: img,
            label: p.pages.length > 1
              ? `Plate ${i + 1} — Page ${idx + 1}`
              : `Plate ${i + 1}: ${p.name}`
          });
        });
      }
    });
    return pages;
  },

  renderFrontMatter() {
    this.renderPages(this.getFrontMatterPages());
  },

  renderChapters() {
    this.renderPages(this.getChapterPages());
  },

  renderPlates() {
    this.renderPages(this.getPlatePages());
  },

  renderPages(pages) {
    if (!this.body) return;
    if (!pages || !pages.length) {
      this.body.innerHTML = `<div class="pdf-preview-empty"><div class="pdf-preview-empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg></div><div class="pdf-preview-empty-title">No PDFs Yet</div><div class="pdf-preview-empty-sub">Upload PDF files on the left to see a combined preview here.</div></div>`;
      this.updatePageCount(0);
      return;
    }
    this.body.innerHTML = pages.map((page, i) => {
      const src = typeof page === 'string' ? page : page.src;
      const label = typeof page === 'string' ? `Page ${i + 1}` : (page.label || `Page ${i + 1}`);
      return `<div class="pdf-preview-page-wrap"><div class="pdf-preview-page-label">${label}</div><img src="${src}" class="pdf-preview-page" alt="${label}"></div>`;
    }).join('');
    this.applyScale();
    this.updatePageCount(pages.length);
  },

  updatePageCount(count) {
    const el = document.getElementById('pdf-preview-page-count');
    if (el) el.textContent = count ? `${count} page${count !== 1 ? 's' : ''}` : '';
  },

  zoomIn() {
    this.scale = Math.min(this.scale + 0.25, 3);
    this.applyScale();
  },

  zoomOut() {
    this.scale = Math.max(this.scale - 0.25, 0.25);
    this.applyScale();
  },

  applyScale() {
    if (!this.body) return;
    this.body.querySelectorAll('.pdf-preview-page').forEach(el => {
      el.style.width = `${this.scale * 100}%`;
    });
    if (this.zoomLabel) this.zoomLabel.textContent = `${Math.round(this.scale * 100)}%`;
  },

  fullScreen() {
    if (!this.panel) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      this.panel.requestFullscreen().catch(() => {});
    }
  },

  download() {
    const allPages = this.body ? this.body.querySelectorAll('.pdf-preview-page') : [];
    if (!allPages.length) {
      toast('No pages to download', 'info');
      return;
    }
    try {
      this.generateMergedPDF(allPages);
    } catch (e) {
      toast('Failed to generate merged PDF: ' + e.message, 'error');
    }
  },

  getDownloadFilename() {
    const dist = (S.frontMatter && S.frontMatter.district) || 'District';
    const yr = ((S.frontMatter && S.frontMatter.year) || 'year').replace('/', '-');
    const section = this.currentView === 'front-matter' ? 'front-matter'
      : this.currentView === 'chapters' ? 'chapters'
      : this.currentView === 'plates' ? 'plates' : 'preview';
    return `DSR-${dist}-${yr}-${section}.pdf`;
  },

  generateMergedPDF(images) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297;
    images.forEach((img, i) => {
      if (i > 0) doc.addPage();
      const src = img.getAttribute('src');
      if (!src) return;
      try { doc.addImage(src, 'JPEG', 0, 0, W, H); }
      catch (e) { try { doc.addImage(src, 'PNG', 0, 0, W, H); } catch (_) {} }
    });
    const fname = this.getDownloadFilename();
    doc.save(fname);
    toast(`Merged PDF saved: ${fname}`, 'success');
  }
};

window.pdfPreview = pdfPreview;

window.addEventListener('DOMContentLoaded', () => {
  pdfPreview.init();
});
