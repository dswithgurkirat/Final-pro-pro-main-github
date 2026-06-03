/* ══════════════════════════════════════
   ANNEXURE VI — FINAL CLUSTER SUMMARY
   ══════════════════════════════════════ */

// Helper to extract text from contenteditable including selects
function getCellTextAnx6(td) {
  const select = td.querySelector('select');
  if (select) return select.value;
  return td.innerText.trim();
}

// --- 1. PDF EXPORT (Landscape Layout) ---
function exportAnx6PDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'pt', 'a4'); 
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  let startY = 80;
  const district = S.activeProject ? S.activeProject.district : 'JALANDHAR';
  const districtUpper = district.toUpperCase();

  // Header/Footer Function
  const drawHeaderFooter = (data) => {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246); // Blue color matching UI
    doc.text("Enforcement & Monitoring Guidelines for Sand Mining", pageWidth - 40, 40, { align: "right" });
    
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`PREPARED BY: SUB-DIVISIONAL COMMITTEE OF ${districtUpper} DISTRICT`, pageWidth / 2, pageHeight - 40, { align: "center" });
    doc.text("ASSISTED BY: RSP GREEN DEVELOPMENT AND LABORATORIES PVT. LTD", pageWidth / 2, pageHeight - 30, { align: "center" });
    
    doc.text(String(300 + data.pageNumber), pageWidth - 40, pageHeight - 30, {align: "right"});
  };

  const extractData = (tableId) => {
    const tbl = document.getElementById(tableId);
    if (!tbl) return { headers: [], rows: [] };
    const headers = Array.from(tbl.querySelectorAll('thead th')).slice(0, -1).map(th => th.innerText.trim().replace(/\n/g, ' '));
    const rows = [];
    tbl.querySelectorAll('tbody tr').forEach(tr => {
      const row = [];
      const tds = tr.querySelectorAll('td');
      for (let i = 0; i < tds.length - 1; i++) {
        row.push(getCellTextAnx6(tds[i]));
      }
      rows.push(row);
    });
    return { headers, rows };
  };

  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Annexure-VI", pageWidth - 40, 55, { align: "right" });

  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("> Final Cluster Summary:", 40, startY);
  startY += 15;

  const tableData = extractData('anx6-final-clusters');
  doc.autoTable({
    startY: startY,
    head: [tableData.headers],
    body: tableData.rows,
    theme: 'grid',
    styles: { font: 'times', fontSize: 9, textColor: 0, lineColor: 0, lineWidth: 0.5, cellPadding: 5, valign: 'middle', halign: 'center' },
    headStyles: { fillColor: false, fontStyle: 'bold', textColor: 0 },
    didDrawPage: (data) => drawHeaderFooter(data)
  });

  doc.save('Annexure_VI_Final_Cluster_Details.pdf');
  toast('PDF downloaded successfully!', 'success');
}

// --- 2. HANDLE PDF UPLOAD & PREVIEW ---
function renderPdfUploadUIAnx6() {
  const nameEl = document.getElementById('anx6-uploaded-filename');
  const dlBtn = document.getElementById('anx6-download-btn');
  const delBtn = document.getElementById('anx6-delete-btn');
  const previewBtn = document.getElementById('anx6-preview-btn');
  const previewSection = document.getElementById('pdf-preview-section-anx6');
  const iframe = document.getElementById('pdf-iframe-anx6');
  
  if (!nameEl || !dlBtn) return;

  if (!S.activeProject) {
    nameEl.style.display = 'none';
    dlBtn.style.display = 'none';
    if (delBtn) delBtn.style.display = 'none';
    if (previewBtn) previewBtn.style.display = 'none';
    if (previewSection) previewSection.style.display = 'none';
    return;
  }

  const pdfName = S.activeProject.anx6PdfName;
  const canEdit = (S.role === 'user');
  const uploadInput = document.getElementById('anx6-pdf-input');
  if (uploadInput) {
    uploadInput.disabled = !canEdit;
    uploadInput.parentElement.style.display = canEdit ? 'inline-block' : 'none';
  }

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
    if (delBtn) delBtn.style.display = canEdit ? 'inline-flex' : 'none';
    if (previewBtn) previewBtn.style.display = 'inline-flex';
    
    if (previewSection && previewSection.style.display === 'block' && iframe) {
      if (S.activeProject.pdfData && S.activeProject.pdfData.anx6) {
        if (iframe.src !== S.activeProject.pdfData.anx6) {
          iframe.src = S.activeProject.pdfData.anx6;
        }
      }
    }
  }

  if (window.initLucide) window.initLucide();
}

function togglePDFPreviewAnx6() {
  const previewSection = document.getElementById('pdf-preview-section-anx6');
  const iframe = document.getElementById('pdf-iframe-anx6');
  if (!previewSection || !iframe) return;

  if (previewSection.style.display === 'block') {
    previewSection.style.display = 'none';
    iframe.src = '';
  } else {
    if (S.activeProject && S.activeProject.pdfData && S.activeProject.pdfData.anx6) {
      iframe.src = S.activeProject.pdfData.anx6;
      previewSection.style.display = 'block';
    } else {
      toast('No PDF preview available. Please re-upload.', 'warn');
    }
  }
}

async function deletePdfAnx6() {
  if (!S.activeProject) return;
  
  if (!confirm("Are you sure you want to delete the uploaded PDF?")) {
    return;
  }
  
  const previewSection = document.getElementById('pdf-preview-section-anx6');
  const iframe = document.getElementById('pdf-iframe-anx6');
  if (previewSection) previewSection.style.display = 'none';
  if (iframe) {
    if (iframe.src.startsWith('blob:')) {
      URL.revokeObjectURL(iframe.src);
    }
    iframe.src = '';
  }

  S.activeProject.anx6PdfName = null;
  if (S.activeProject.pdfData) S.activeProject.pdfData.anx6 = null;
  
  const pIdx = S.projects.findIndex(p => p.id === S.activeProject.id);
  if (pIdx !== -1) {
    S.projects[pIdx].anx6PdfName = null;
    if (S.projects[pIdx].pdfData) S.projects[pIdx].pdfData.anx6 = null;
  }
  
  renderPdfUploadUIAnx6();
  toast("PDF deleted successfully.", "success");
}

function handlePDFUploadAnx6(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    toast('Error: Only PDF files are allowed.', 'danger');
    event.target.value = '';
    return;
  }

  toast('Uploading PDF...', 'info');

  const fileURL = URL.createObjectURL(file);
  S.activeProject.anx6PdfName = file.name;
  if (!S.activeProject.pdfData) S.activeProject.pdfData = {};
  S.activeProject.pdfData.anx6 = fileURL;

  if (window.renderPdfToImages) {
    window.renderPdfToImages(file, (err, imgs) => {
      if (!err && imgs) {
        if (!S.uploadedPDFs) S.uploadedPDFs = {};
        S.uploadedPDFs.anx6 = imgs;
        if (window.debouncedSaveState) window.debouncedSaveState();
      }
    });
  }

  const pIdx = S.projects.findIndex(p => p.id === S.activeProject.id);
  if (pIdx !== -1) {
    S.projects[pIdx].anx6PdfName = file.name;
    if (!S.projects[pIdx].pdfData) S.projects[pIdx].pdfData = {};
    S.projects[pIdx].pdfData.anx6 = fileURL;
  }
  
  const iframe = document.getElementById('pdf-iframe-anx6');
  const previewSection = document.getElementById('pdf-preview-section-anx6');
  if (iframe && previewSection) {
    iframe.src = fileURL;
    previewSection.style.display = 'block';
  }
  
  renderPdfUploadUIAnx6();
  toast('PDF uploaded and preview loaded!', 'success');
  event.target.value = '';
}

function closePDFPreviewAnx6() {
  const previewSection = document.getElementById('pdf-preview-section-anx6');
  const iframe = document.getElementById('pdf-iframe-anx6');
  if (previewSection) previewSection.style.display = 'none';
  if (iframe) {
    if (iframe.src.startsWith('blob:')) {
      URL.revokeObjectURL(iframe.src);
    }
    iframe.src = '';
  }
}

function downloadPdfAnx6() {
  if (!S.activeProject) {
    toast('Please select and open a project first.', 'warn');
    return;
  }
  if (!S.activeProject.anx6PdfName) {
    toast('No PDF has been uploaded for this project yet. Please upload a PDF first.', 'warn');
    return;
  }
  const a = document.createElement('a');
  a.href = S.activeProject.pdfData.anx6;
  a.download = S.activeProject.anx6PdfName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// DOMContentLoaded initialization
window.addEventListener('DOMContentLoaded', () => {
  renderPdfUploadUIAnx6();
});
