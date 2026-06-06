/* ANNEXURE F - BENCH MARK, CORS & SAND GHAT COORDINATES */

const ANNEXURE_F_TABLES = {
  CORS: {
    tableId: 'annexure-f-cors',
    filename: 'Annexure_F_CORS_Stations_Template.csv',
    headers: ['CORS Station Name', 'Lat', 'Lon', 'Height', 'Station Code']
  },
  BENCHMARK: {
    tableId: 'annexure-f-benchmark',
    filename: 'Annexure_F_Benchmark_Template.csv',
    headers: ['Permanent Bench Mark', 'Coordinates', 'Elevation', 'Sandbars Code']
  },
  SAND: {
    tableId: 'annexure-f-sand',
    filename: 'Annexure_F_Sand_Ghats_Coordinates_Template.csv',
    headers: ['SL.NO', 'River Details', 'Sand Bar_Code', 'Lease Details', 'Area (Ha.)', 'Latitude', 'Longitude']
  }
};

function annexureFDeleteButtonHTML() {
  const isReadOnly = window.S && S.role !== 'user';
  return `<button class='btn btn-xs btn-danger' onclick='delRowAnnexureF(this)' style='display:${isReadOnly ? 'none' : 'inline-flex'};align-items:center;justify-content:center;padding:4px;'><i data-lucide='trash-2' style='width:12px;height:12px;'></i></button>`;
}

function annexureFCellValue(td) {
  const select = td.querySelector('select');
  if (select) return select.value;
  return td.innerText.trim();
}

function annexureFToCSVValue(value) {
  const text = String(value === undefined || value === null ? '' : value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadSectionTemplateAnnexureF(sectionType) {
  const cfg = ANNEXURE_F_TABLES[sectionType];
  if (!cfg) return;

  const csvContent = cfg.headers.map(annexureFToCSVValue).join(',') + '\n';
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', cfg.filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function handleSectionUploadAnnexureF(event, sectionType) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      if (!rows.length) {
        toast('The uploaded file is empty.', 'warn');
        return;
      }

      processExcelDataAnnexureF(rows, sectionType);
    } catch (error) {
      toast('Error parsing file. Please ensure it is a valid Excel or CSV file.', 'error');
      console.error(error);
    }
    event.target.value = '';
  };
  reader.readAsArrayBuffer(file);
}

function processExcelDataAnnexureF(rows, sectionType) {
  const cfg = ANNEXURE_F_TABLES[sectionType];
  if (!cfg) return;

  const validRows = rows.filter(row => row.some(cell => String(cell === undefined || cell === null ? '' : cell).trim() !== ''));
  const headerIdx = validRows.findIndex(row => annexureFLooksLikeHeader(row, sectionType));
  const startIndex = headerIdx >= 0 ? headerIdx + 1 : 0;
  const dataRows = validRows.slice(startIndex);

  if (!dataRows.length) {
    toast('No data found after the header in the uploaded file.', 'warn');
    return;
  }

  const tbody = document.querySelector('#' + cfg.tableId + ' tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  dataRows.forEach((rowData, index) => {
    const normalized = normalizeAnnexureFRow(rowData, sectionType, index);
    addRowAnnexureF(cfg.tableId, normalized);
  });

  toast(`Uploaded Annexure F ${sectionType.toLowerCase()} data successfully`, 'success');
  if (window.debouncedSaveState) window.debouncedSaveState();
}

function annexureFLooksLikeHeader(row, sectionType) {
  const rowStr = row.map(c => String(c || '')).join(' ').toLowerCase();
  if (sectionType === 'CORS') return rowStr.includes('cors') || rowStr.includes('station code');
  if (sectionType === 'BENCHMARK') return rowStr.includes('bench') || rowStr.includes('elevation');
  if (sectionType === 'SAND') return rowStr.includes('sand') || rowStr.includes('lease') || rowStr.includes('river');
  return false;
}

function normalizeAnnexureFRow(rowData, sectionType, index) {
  const row = Array.from(rowData);
  const del = annexureFDeleteButtonHTML();

  if (sectionType === 'CORS') {
    while (row.length < 5) row.push('');
    return [
      String(index + 1),
      row[0],
      row[1],
      row[2],
      row[3],
      row[4],
      del
    ];
  }

  if (sectionType === 'BENCHMARK') {
    while (row.length < 4) row.push('');
    return [
      String(index + 1),
      row[0],
      row[1],
      row[2],
      row[3],
      del
    ];
  }

  while (row.length < 7) row.push('');
  return [
    row[0] || String(index + 1),
    row[1],
    row[2],
    row[3],
    row[4],
    row[5],
    row[6],
    del
  ];
}

function addRowAnnexureF(tableId, cellDataArray) {
  const tbody = document.querySelector('#' + tableId + ' tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  cellDataArray.forEach((data, index) => {
    const td = document.createElement('td');
    let dataStr = String(data === undefined || data === null ? '' : data).trim();

    if (dataStr === '' && !dataStr.includes('<button') && !dataStr.includes('<select')) {
      dataStr = 'NUL';
    }

    if (dataStr.includes('<button') || dataStr.includes('<select')) {
      td.innerHTML = dataStr;
    } else {
      td.textContent = dataStr;
      td.contentEditable = window.S && S.role !== 'user' ? 'false' : 'true';
      if (window.S && S.role !== 'user') {
        td.style.backgroundColor = 'var(--off)';
        td.style.cursor = 'not-allowed';
      }
      if (
        (tableId === 'annexure-f-cors' && (index === 2 || index === 3)) ||
        (tableId === 'annexure-f-benchmark' && index === 2) ||
        (tableId === 'annexure-f-sand' && (index === 2 || index === 5 || index === 6))
      ) {
        td.classList.add('coord-input');
      }
    }

    tr.appendChild(td);
  });

  tbody.appendChild(tr);
  if (window.initLucide) window.initLucide();
}

function delRowAnnexureF(btn) {
  const row = btn.closest('tr');
  if (!row) return;
  row.remove();
  if (window.debouncedSaveState) window.debouncedSaveState();
}

function extractAnnexureFTable(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return { headers: [], rows: [] };

  const headers = Array.from(table.querySelectorAll('thead th'))
    .slice(0, -1)
    .map(th => th.innerText.trim().replace(/\n/g, ' '));

  const rows = [];
  table.querySelectorAll('tbody tr').forEach(tr => {
    const cells = Array.from(tr.querySelectorAll('td')).slice(0, -1);
    rows.push(cells.map(annexureFCellValue));
  });

  return { headers, rows };
}

async function exportAnnexureFPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let startY = 80;

  const drawHeaderFooter = (data) => {
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.text('Enforcement & Monitoring Guidelines for Sand Mining', pageWidth - 40, 40, { align: 'right' });

    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('PREPARED BY: SUB-DIVISIONAL COMMITTEE OF JALANDHAR DISTRICT', pageWidth / 2, pageHeight - 40, { align: 'center' });
    doc.text('ASSISTED BY: RSP GREEN DEVELOPMENT AND LABORATORIES PVT. LTD', pageWidth / 2, pageHeight - 30, { align: 'center' });
    doc.text(String(data.pageNumber), pageWidth - 40, pageHeight - 30, { align: 'right' });
  };

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Annexure-F', pageWidth - 40, 55, { align: 'right' });

  const sections = [
    { title: '> Final Block Sand Ghats Coordinates:', tableId: 'annexure-f-sand', fontSize: 8 },
    { title: '> Permanent Bench Marks:', tableId: 'annexure-f-benchmark', fontSize: 9 },
    { title: '> Survey of India CORS Stations:', tableId: 'annexure-f-cors', fontSize: 9 }
  ];

  sections.forEach((section, index) => {
    if (index > 0 && startY > pageHeight - 220) {
      doc.addPage();
      startY = 80;
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(section.title, 40, startY);
    startY += 15;

    const tableData = extractAnnexureFTable(section.tableId);
    doc.autoTable({
      startY,
      head: [tableData.headers],
      body: tableData.rows,
      theme: 'grid',
      styles: {
        font: 'times',
        fontSize: section.fontSize,
        textColor: 0,
        lineColor: 0,
        lineWidth: 0.5,
        cellPadding: 3,
        valign: 'middle',
        halign: 'center'
      },
      headStyles: {
        fillColor: false,
        fontStyle: 'bold',
        halign: 'center',
        textColor: 0
      },
      columnStyles: section.tableId === 'annexure-f-sand' ? {
        3: { cellWidth: 160 },
        5: { cellWidth: 120 },
        6: { cellWidth: 120 }
      } : {},
      didDrawPage: drawHeaderFooter
    });

    startY = doc.lastAutoTable.finalY + 24;
  });

  await appendAnnexureFAttachmentPages(doc);
  doc.save('Annexure_F_Sand_Ghats_Benchmarks_CORS_Merged.pdf');
  toast('PDF downloaded successfully!', 'success');
}

function getAnnexureFAttachment() {
  if (window.S && S.activeProject && S.activeProject.annexureFAttachment) {
    return S.activeProject.annexureFAttachment;
  }
  return window.annexureFAttachment || null;
}

function setAnnexureFAttachment(attachment) {
  window.annexureFAttachment = attachment;
  if (window.S && S.activeProject) {
    S.activeProject.annexureFAttachment = attachment;
    const pIdx = S.projects.findIndex(p => p.id === S.activeProject.id);
    if (pIdx !== -1) S.projects[pIdx].annexureFAttachment = attachment;
  }
}

function renderAttachmentUploadUIAnnexureF() {
  const el = document.getElementById('annexure-f-attachment-info');
  if (!el) return;

  const attachment = getAnnexureFAttachment();
  if (!attachment || !attachment.pages || !attachment.pages.length) {
    el.innerHTML = `
      <div style="padding:14px 16px; border:1px dashed var(--border); border-radius:var(--r-sm); color:var(--text-soft); font-size:13px; background:var(--off);">
        No supporting PDF/image uploaded yet.
      </div>`;
    return;
  }

  el.innerHTML = `
    <div class="file-item" style="margin-top:10px; background:var(--off); border:1px solid var(--border); max-width:560px; display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-radius:var(--r-sm);">
      <div style="display:flex; align-items:center; gap:8px;">
        <div class="file-icon" style="background:var(--teal-lt); color:var(--teal); padding:6px; border-radius:var(--r-xs); font-size:14px;">
          <i data-lucide="file-up" style="width:16px; height:16px;"></i>
        </div>
        <div style="line-height:1.25;">
          <div style="font-size:12px; font-weight:700; color:var(--text);">${attachment.fileName}</div>
          <div style="font-size:10.5px; color:var(--text-faint);">${attachment.fileSize || ''} - ${attachment.pages.length} page(s) will be appended</div>
        </div>
      </div>
      <button type="button" class="btn btn-xs btn-danger" onclick="deleteAttachmentAnnexureF()">Remove</button>
    </div>`;
  if (window.initLucide) window.initLucide();
}

function handleAttachmentUploadAnnexureF(event) {
  const file = event.target.files[0];
  if (!file) return;

  const sizeStr = (file.size / 1024).toFixed(1) + ' KB';

  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    toast('Processing supporting PDF...', 'info');
    if (typeof renderPdfToImages !== 'function') {
      toast('PDF renderer is not available on this page.', 'error');
      event.target.value = '';
      return;
    }

    renderPdfToImages(file, (err, imgs) => {
      if (err || !imgs || !imgs.length) {
        console.error(err);
        toast('PDF render failed. Please try another PDF or upload an image.', 'error');
        event.target.value = '';
        return;
      }
      setAnnexureFAttachment({
        fileName: file.name,
        fileSize: sizeStr,
        fileType: 'pdf',
        pages: imgs
      });
      renderAttachmentUploadUIAnnexureF();
      if (window.debouncedSaveState) window.debouncedSaveState();
      toast('Supporting PDF added to Annexure F.', 'success');
      event.target.value = '';
    });
    return;
  }

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      setAnnexureFAttachment({
        fileName: file.name,
        fileSize: sizeStr,
        fileType: 'image',
        pages: [evt.target.result]
      });
      renderAttachmentUploadUIAnnexureF();
      if (window.debouncedSaveState) window.debouncedSaveState();
      toast('Supporting image added to Annexure F.', 'success');
      event.target.value = '';
    };
    reader.readAsDataURL(file);
    return;
  }

  toast('Unsupported file format. Please upload a PDF or image.', 'error');
  event.target.value = '';
}

function deleteAttachmentAnnexureF() {
  setAnnexureFAttachment(null);
  renderAttachmentUploadUIAnnexureF();
  if (window.debouncedSaveState) window.debouncedSaveState();
  toast('Supporting file removed.', 'success');
}

function loadAnnexureFImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function appendAnnexureFAttachmentPages(doc) {
  const attachment = getAnnexureFAttachment();
  if (!attachment || !attachment.pages || !attachment.pages.length) return;

  for (const src of attachment.pages) {
    const img = await loadAnnexureFImage(src);
    doc.addPage('a4', 'p');
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    const margin = 24;
    const maxW = w - margin * 2;
    const maxH = h - margin * 2;
    const ratio = Math.min(maxW / img.width, maxH / img.height);
    const drawW = img.width * ratio;
    const drawH = img.height * ratio;
    const x = (w - drawW) / 2;
    const y = (h - drawH) / 2;
    const format = String(src).startsWith('data:image/png') ? 'PNG' : 'JPEG';
    doc.addImage(src, format, x, y, drawW, drawH);
  }
}

function renderPdfUploadUIAnnexureF() {
  const nameEl = document.getElementById('annexure-f-uploaded-filename');
  const dlBtn = document.getElementById('annexure-f-download-btn');
  const delBtn = document.getElementById('annexure-f-delete-btn');
  const previewBtn = document.getElementById('annexure-f-preview-btn');
  const previewSection = document.getElementById('pdf-preview-section-annexure-f');
  const iframe = document.getElementById('pdf-iframe-annexure-f');

  if (!nameEl || !dlBtn) return;

  if (!S.activeProject) {
    nameEl.style.display = 'none';
    dlBtn.style.display = 'none';
    if (delBtn) delBtn.style.display = 'none';
    if (previewBtn) previewBtn.style.display = 'none';
    if (previewSection) previewSection.style.display = 'none';
    return;
  }

  const pdfName = S.activeProject.annexureFPdfName;

  if (!pdfName) {
    nameEl.style.display = 'none';
    dlBtn.style.display = 'none';
    if (delBtn) delBtn.style.display = 'none';
    if (previewBtn) previewBtn.style.display = 'none';
    if (previewSection) {
      previewSection.style.display = 'none';
      if (iframe) iframe.src = '';
    }
  } else {
    nameEl.textContent = pdfName;
    nameEl.style.display = 'inline-block';
    dlBtn.style.display = 'inline-flex';
    if (delBtn) delBtn.style.display = S.role === 'user' ? 'inline-flex' : 'none';
    if (previewBtn) previewBtn.style.display = 'inline-flex';

    if (previewSection && previewSection.style.display === 'block' && iframe) {
      if (S.activeProject.pdfData && S.activeProject.pdfData.annexureF) {
        iframe.src = S.activeProject.pdfData.annexureF;
      }
    }
  }

  if (window.initLucide) window.initLucide();
}

function togglePDFPreviewAnnexureF() {
  const previewSection = document.getElementById('pdf-preview-section-annexure-f');
  const iframe = document.getElementById('pdf-iframe-annexure-f');
  if (!previewSection || !iframe) return;

  if (previewSection.style.display === 'block') {
    previewSection.style.display = 'none';
    iframe.src = '';
    return;
  }

  if (S.activeProject && S.activeProject.pdfData && S.activeProject.pdfData.annexureF) {
    iframe.src = S.activeProject.pdfData.annexureF;
    previewSection.style.display = 'block';
  } else {
    toast('No PDF preview available. Please re-upload.', 'warn');
  }
}

async function deletePdfAnnexureF() {
  if (!S.activeProject) return;

  if (!confirm('Are you sure you want to delete the uploaded PDF?')) return;

  const previewSection = document.getElementById('pdf-preview-section-annexure-f');
  const iframe = document.getElementById('pdf-iframe-annexure-f');
  if (previewSection) previewSection.style.display = 'none';
  if (iframe) iframe.src = '';

  if (S.activeProject.pdfData && S.activeProject.pdfData.annexureF && S.activeProject.pdfData.annexureF.startsWith('blob:')) {
    URL.revokeObjectURL(S.activeProject.pdfData.annexureF);
  }

  S.activeProject.annexureFPdfName = null;
  if (!S.activeProject.pdfData) S.activeProject.pdfData = {};
  S.activeProject.pdfData.annexureF = null;

  const pIdx = S.projects.findIndex(p => p.id === S.activeProject.id);
  if (pIdx !== -1) {
    S.projects[pIdx].annexureFPdfName = null;
    if (!S.projects[pIdx].pdfData) S.projects[pIdx].pdfData = {};
    S.projects[pIdx].pdfData.annexureF = null;
  }

  renderPdfUploadUIAnnexureF();
  toast('PDF deleted successfully.', 'success');
  if (window.debouncedSaveState) window.debouncedSaveState();
}

function handlePDFUploadAnnexureF(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    toast('Error: Only PDF files are allowed.', 'danger');
    event.target.value = '';
    return;
  }

  if (!S.activeProject) {
    toast('Please select and open a project first.', 'warn');
    event.target.value = '';
    return;
  }

  const fileURL = URL.createObjectURL(file);
  S.activeProject.annexureFPdfName = file.name;
  if (!S.activeProject.pdfData) S.activeProject.pdfData = {};
  S.activeProject.pdfData.annexureF = fileURL;

  if (window.renderPdfToImages) {
    window.renderPdfToImages(file, (err, imgs) => {
      if (!err && imgs) {
        if (!S.uploadedPDFs) S.uploadedPDFs = {};
        S.uploadedPDFs.annexureF = imgs;
        if (window.debouncedSaveState) window.debouncedSaveState();
      }
    });
  }

  const pIdx = S.projects.findIndex(p => p.id === S.activeProject.id);
  if (pIdx !== -1) {
    S.projects[pIdx].annexureFPdfName = file.name;
    if (!S.projects[pIdx].pdfData) S.projects[pIdx].pdfData = {};
    S.projects[pIdx].pdfData.annexureF = fileURL;
  }

  const iframe = document.getElementById('pdf-iframe-annexure-f');
  const previewSection = document.getElementById('pdf-preview-section-annexure-f');
  if (iframe && previewSection) {
    iframe.src = fileURL;
    previewSection.style.display = 'block';
  }

  renderPdfUploadUIAnnexureF();
  toast('PDF uploaded and preview loaded!', 'success');
  event.target.value = '';
}

function closePDFPreviewAnnexureF() {
  const previewSection = document.getElementById('pdf-preview-section-annexure-f');
  const iframe = document.getElementById('pdf-iframe-annexure-f');

  if (previewSection) previewSection.style.display = 'none';
  if (iframe) iframe.src = '';
}

function downloadPdfAnnexureF() {
  if (!S.activeProject) {
    toast('Please select and open a project first.', 'warn');
    return;
  }
  if (!S.activeProject.annexureFPdfName || !S.activeProject.pdfData || !S.activeProject.pdfData.annexureF) {
    toast('No PDF has been uploaded for this project yet. Please upload a PDF first.', 'warn');
    return;
  }

  const a = document.createElement('a');
  a.href = S.activeProject.pdfData.annexureF;
  a.download = S.activeProject.annexureFPdfName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function renderAnnexureF() {
  renderPdfUploadUIAnnexureF();
  renderAttachmentUploadUIAnnexureF();
  if (window.initLucide) window.initLucide();
}

window.annexureFDeleteButtonHTML = annexureFDeleteButtonHTML;
window.downloadSectionTemplateAnnexureF = downloadSectionTemplateAnnexureF;
window.handleSectionUploadAnnexureF = handleSectionUploadAnnexureF;
window.addRowAnnexureF = addRowAnnexureF;
window.delRowAnnexureF = delRowAnnexureF;
window.exportAnnexureFPDF = exportAnnexureFPDF;
window.handleAttachmentUploadAnnexureF = handleAttachmentUploadAnnexureF;
window.deleteAttachmentAnnexureF = deleteAttachmentAnnexureF;
window.renderAttachmentUploadUIAnnexureF = renderAttachmentUploadUIAnnexureF;
window.renderPdfUploadUIAnnexureF = renderPdfUploadUIAnnexureF;
window.togglePDFPreviewAnnexureF = togglePDFPreviewAnnexureF;
window.deletePdfAnnexureF = deletePdfAnnexureF;
window.handlePDFUploadAnnexureF = handlePDFUploadAnnexureF;
window.closePDFPreviewAnnexureF = closePDFPreviewAnnexureF;
window.downloadPdfAnnexureF = downloadPdfAnnexureF;
window.renderAnnexureF = renderAnnexureF;
