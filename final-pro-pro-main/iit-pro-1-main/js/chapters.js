/* ══════════════════════════════════════
   CHAPTERS & PLATES
══════════════════════════════════════ */
function renderChapters() {
  const el = document.getElementById('chapter-list');
  if (!el) return;
  const isReadOnly = S.role !== 'user';
  el.innerHTML = S.chapters.map((ch,i)=>`
    <div class="chapter-item">
      <div class="ch-num">${i+1}</div>
      <div class="ch-body">
        <input class="ch-name-input" value="${ch.name}" oninput="S.chapters[${i}].name=this.value" ${isReadOnly ? 'disabled style="background:var(--off); cursor:not-allowed;"' : ''}>
        <textarea class="ch-summary" rows="2" oninput="S.chapters[${i}].summary=this.value" ${isReadOnly ? 'disabled style="background:var(--off); cursor:not-allowed;"' : ''}>${ch.summary}</textarea>
        ${!isReadOnly ? `
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
          <label class="btn btn-xs btn-outline" style="cursor:pointer">📎 Upload Chapter PDF <input type="file" accept=".pdf" hidden onchange="handleChapterUpload(event,${ch.id})"></label>
        </div>` : ''}
      </div>
      ${!isReadOnly ? `
      <div style="display:flex;gap:5px;flex-shrink:0">
        ${i>0?`<button class="btn btn-xs btn-outline" onclick="moveChapter(${i},-1)">↑</button>`:''}
        ${i<S.chapters.length-1?`<button class="btn btn-xs btn-outline" onclick="moveChapter(${i},1)">↓</button>`:''}
        <button class="btn btn-xs btn-danger" onclick="deleteChapter(${ch.id})">✕</button>
      </div>` : ''}
    </div>`).join('');
}

// Hide Add Chapter button if read-only
window.addEventListener('DOMContentLoaded', () => {
  const originalShowView = window.showView;
  if (typeof originalShowView === 'function') {
    window.showView = function(id, btn, push) {
      originalShowView(id, btn, push);
      if (id === 'chapters') {
        const addBtn = document.querySelector('#view-chapters .btn-saffron');
        if (addBtn) addBtn.style.display = S.role !== 'user' ? 'none' : 'inline-flex';
      }
    };
  }
});

function addChapter() {
  S.chapters.push({ id:Date.now(), name:'NEW CHAPTER — ENTER TITLE', summary:'Enter chapter summary here...' });
  renderChapters(); if(window.debouncedSaveState) debouncedSaveState();
}

/******************************************************************************
 * Delete Chapter
 *****************************************************************************/
function deleteChapter(id) {
  customConfirm('Remove this chapter completely?', () => {
    S.chapters = S.chapters.filter(c => c.id !== id);
    renderChapters(); if(window.debouncedSaveState) debouncedSaveState();
    toast('Chapter removed', 'info');
  });
}

function moveChapter(idx,dir) {
  [S.chapters[idx],S.chapters[idx+dir]]=[S.chapters[idx+dir],S.chapters[idx]]; renderChapters(); if(window.debouncedSaveState) debouncedSaveState();
}

function handleChapterUpload(e,id) {
  const f=e.target.files[0]; if(f) toast(`📎 ${f.name} uploaded for chapter`,'success');
}


