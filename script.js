/**
 * Looi Yu Zhi — Modern Portfolio & Interactive Hub Logic
 * Standards: Modern Web Guidance, Native Dialog APIs, Clipboard API, Web Share API
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. THEME & STAR BUTTON HANDLING
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);

    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      showToast(`Switched to ${newTheme} mode`);
    });
  }

  // 2. DIALOG MODAL HELPERS WITH LIGHT DISMISS
  const dialogs = document.querySelectorAll('dialog.modern-dialog');

  dialogs.forEach((dialog) => {
    // Light dismiss: Click outside dialog card (on backdrop)
    dialog.addEventListener('click', (event) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });

    // Close buttons inside dialog
    const closeBtns = dialog.querySelectorAll('[data-close-dialog]');
    closeBtns.forEach((btn) => {
      btn.addEventListener('click', () => dialog.close());
    });
  });



  // 6. SHARE MODAL, QR CODE & WEB SHARE API
  const shareModal = document.getElementById('shareModal');
  const shareBtn = document.getElementById('shareBtn');
  const copyShareUrlBtn = document.getElementById('copyShareUrlBtn');
  const shareUrlInput = document.getElementById('shareUrlInput');
  const nativeShareBtn = document.getElementById('nativeShareBtn');
  const qrCodeCanvas = document.getElementById('qrCodeCanvas');
  const shareWhatsAppLink = document.getElementById('shareWhatsAppLink');
  const shareLinkedInLink = document.getElementById('shareLinkedInLink');
  const shareEmailLink = document.getElementById('shareEmailLink');

  const currentUrl = window.location.href;
  if (shareUrlInput) shareUrlInput.value = currentUrl;

  // Pre-fill social share links
  if (shareWhatsAppLink) {
    shareWhatsAppLink.href = `https://api.whatsapp.com/send?text=${encodeURIComponent('Check out Looi Yu Zhi\'s portfolio: ' + currentUrl)}`;
  }
  if (shareLinkedInLink) {
    shareLinkedInLink.href = 'https://www.linkedin.com/in/yu-zhi-looi-947228360';
  }
  if (shareEmailLink) {
    shareEmailLink.href = 'mailto:looi8943@gmail.com';
  }

  // Render stylized QR Code to canvas
  function drawQrMatrix(canvas, text) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Generate pseudo-deterministic QR matrix pattern
    const cells = 21;
    const cellSize = size / cells;
    ctx.fillStyle = '#0f172a';

    // Helper for position detection patterns (Corners)
    function drawCorner(x, y) {
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    }

    drawCorner(0, 0);
    drawCorner(14, 0);
    drawCorner(0, 14);

    // Alignment and data dots
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        // Skip corner patterns
        if ((r < 7 && c < 7) || (r < 7 && c >= 14) || (r >= 14 && c < 7)) continue;
        
        // Timing tracks
        if (r === 6 || c === 6) {
          if ((r + c) % 2 === 0) {
            ctx.fillRect(c * cellSize + 1, r * cellSize + 1, cellSize - 2, cellSize - 2);
          }
          continue;
        }

        // Pseudo pseudo-data
        const pseudoRand = Math.sin(r * 13 + c * 37 + hash) * 10000;
        if (pseudoRand - Math.floor(pseudoRand) > 0.5) {
          ctx.fillRect(c * cellSize + 1.2, r * cellSize + 1.2, cellSize - 2.4, cellSize - 2.4);
        }
      }
    }

    // Center badge emblem
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, cellSize * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  drawQrMatrix(qrCodeCanvas, currentUrl);

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      shareModal.showModal();
    });
  }

  if (nativeShareBtn) {
    nativeShareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: 'Looi Yu Zhi | Portfolio & Link Hub',
          text: 'Check out Looi Yu Zhi\'s portfolio (FSKTM IS Year 2, SJAM Officer)',
          url: currentUrl
        }).catch(() => {});
      } else {
        copyShareUrl();
      }
    });
  }

  function copyShareUrl() {
    navigator.clipboard.writeText(shareUrlInput.value).then(() => {
      showToast('Profile link copied to clipboard!');
    }).catch(() => {
      showToast('Link ready to copy');
    });
  }

  if (copyShareUrlBtn) {
    copyShareUrlBtn.addEventListener('click', copyShareUrl);
  }

  // 7. CARD CONTEXT OPTIONS MODAL (3-Dots on Cards)
  const cardOptionsModal = document.getElementById('cardOptionsModal');
  const moreBtns = document.querySelectorAll('.card-more-btn');
  const optionOpenDirect = document.getElementById('optionOpenDirect');
  const optionCopyUrl = document.getElementById('optionCopyUrl');

  let activeCardUrl = '';

  const cardUrlMap = {
    floorplan: 'https://fsktm-floorplan.netlify.app/',
    gitflow: 'https://git-visualizer-wheat.vercel.app/',
    instagram: 'https://www.instagram.com/_yuzhiii',
    linkedin: 'https://www.linkedin.com/in/yu-zhi-looi-947228360',
    email: 'mailto:looi8943@gmail.com'
  };

  moreBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cardType = btn.getAttribute('data-card-info');
      activeCardUrl = cardUrlMap[cardType] || window.location.href;
      cardOptionsModal.showModal();
    });
  });

  if (optionOpenDirect) {
    optionOpenDirect.addEventListener('click', () => {
      if (activeCardUrl.startsWith('#')) {
        cardOptionsModal.close();
        if (activeCardUrl === '#floorplan') openFloorPlan();
      } else {
        window.open(activeCardUrl, '_blank');
        cardOptionsModal.close();
      }
    });
  }

  if (optionCopyUrl) {
    optionCopyUrl.addEventListener('click', () => {
      const url = activeCardUrl.startsWith('#') ? window.location.href + activeCardUrl : activeCardUrl;
      navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard!');
        cardOptionsModal.close();
      });
    });
  }

  // 8. GLOBAL TOAST HELPER
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // 9. EDITORIAL LANDING PAGE HOOKS & CONTROLS
  const navShareBtn = document.getElementById('navShareBtn');
  if (navShareBtn && shareModal) {
    navShareBtn.addEventListener('click', () => shareModal.showModal());
  }

  // Projects & Featured Links Drawer Modal
  const projectsDrawerModal = document.getElementById('projectsDrawerModal');
  const openProjectsHubBtn = document.getElementById('openProjectsHubBtn');
  const navProjectsTrigger = document.getElementById('navProjectsTrigger');

  function openProjectsModal() {
    if (projectsDrawerModal) projectsDrawerModal.showModal();
  }

  if (openProjectsHubBtn) openProjectsHubBtn.addEventListener('click', openProjectsModal);
  if (navProjectsTrigger) navProjectsTrigger.addEventListener('click', openProjectsModal);

  // Bio Details Modal
  const bioModal = document.getElementById('bioModal');
  const readMoreBioBtn = document.getElementById('readMoreBioBtn');
  const navLeadershipTrigger = document.getElementById('navLeadershipTrigger');
  const avatarTriggerSjam = document.getElementById('avatarTriggerSjam');

  function openBio() {
    if (bioModal) bioModal.showModal();
  }

  if (readMoreBioBtn) readMoreBioBtn.addEventListener('click', openBio);
  if (navLeadershipTrigger) navLeadershipTrigger.addEventListener('click', openBio);
  if (avatarTriggerSjam) avatarTriggerSjam.addEventListener('click', openBio);


});
