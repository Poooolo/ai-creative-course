(() => {
  function search(inputId, itemSelector, emptyId, groupSelector) {
    const input = document.getElementById(inputId), items = [...document.querySelectorAll(itemSelector)];
    input.addEventListener('input', () => {
      const q = input.value.trim().toLocaleLowerCase(); let found = 0;
      for (const item of items) { const match = item.dataset.search.toLocaleLowerCase().includes(q); item.hidden = !match; if (match) found++; }
      document.getElementById(emptyId).hidden = found > 0;
      if (groupSelector) document.querySelectorAll(groupSelector).forEach(group => { group.hidden = !group.querySelector(itemSelector + ':not([hidden])'); });
    });
  }
  search('prompt-search', '.prompt', 'prompt-empty'); search('web-search', '.site-row', 'web-empty', '.category');
  document.querySelectorAll('.copy').forEach(button => button.addEventListener('click', async () => {
    const text = button.closest('.prompt-content').querySelector('.raw-prompt').value;
    const status = button.nextElementSibling;
    try { if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable'); await navigator.clipboard.writeText(text); status.textContent = '已复制'; }
    catch { const temp = document.createElement('textarea'); temp.value = text; temp.style.position = 'fixed'; temp.style.opacity = '0'; document.body.append(temp); temp.select(); const ok = document.execCommand('copy'); temp.remove(); status.textContent = ok ? '已复制' : '无法自动复制，请选中正文复制'; }
  }));
  const dialog = document.getElementById('viewer'), image = document.getElementById('viewer-img'); let scale = 1;
  document.querySelectorAll('.zoom').forEach(button => button.addEventListener('click', () => { image.src = button.dataset.image; image.alt = button.querySelector('img').alt; scale = 1; image.style.width = '100%'; dialog.showModal(); }));
  document.getElementById('close-viewer').addEventListener('click', () => dialog.close());
  document.getElementById('zoom-in').addEventListener('click', () => { scale = Math.min(3, scale + .5); image.style.width = `${scale * 100}%`; });
  document.getElementById('zoom-out').addEventListener('click', () => { scale = Math.max(1, scale - .5); image.style.width = `${scale * 100}%`; });
})();
