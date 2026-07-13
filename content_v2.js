let currentAction = 'hide';

chrome.storage.sync.get({ actionType: 'hide' }, (items) => {
  currentAction = items.actionType;
  runFilter();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.actionType) {
    currentAction = changes.actionType.newValue;
    resetAllCardsManualUnblurState();
    runFilter();
  }
});

function isBooked(card) {
  const elements = card.querySelectorAll('span, div, p, strong, small');
  for (const el of elements) {
    const text = el.textContent.trim().toLowerCase();
    if (text.includes('забронировано') && text.length < 25) {
      return true;
    }
  }
  return false;
}

function getCardContentTarget(card) {
  const innerContent = card.querySelector('[class*="iva-item-content-"]');
  if (innerContent) {
    return innerContent;
  }
  return card;
}

function getCardLayoutWrapper(card) {
  const wrapper = card.closest('[class*="styles-item-"], [class*="styles-compactGridItem-"], [class*="iva-item-root-"]');
  return wrapper || card;
}

function applyFilterToCard(card) {
  const hasBadge = isBooked(card);

  if (!hasBadge) {
    resetCardStyles(card);
    return;
  }

  const target = getCardContentTarget(card);
  const layoutTarget = getCardLayoutWrapper(card);

  if (currentAction === 'disabled') {
    resetCardStyles(card);
  } else if (currentAction === 'hide') {
    resetCardStyles(card);
    layoutTarget.classList.add('notobooked-item-hidden');
  } else if (currentAction === 'blur') {
    if (card.getAttribute('data-notobooked-manually-unblurred') === 'true') {
      layoutTarget.classList.remove('notobooked-item-hidden');
      target.classList.remove('notobooked-item-blurred-active');
      return;
    }

    layoutTarget.classList.remove('notobooked-item-hidden');
    target.classList.add('notobooked-item-blurred-active');

    let overlay = target.querySelector('.notobooked-unblur-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'notobooked-unblur-overlay';

      const text = document.createElement('div');
      text.className = 'notobooked-unblur-text';
      text.textContent = 'Товар забронирован';

      const subtext = document.createElement('div');
      subtext.className = 'notobooked-unblur-subtext';
      subtext.textContent = 'Показать объявление';

      overlay.appendChild(text);
      overlay.appendChild(subtext);

      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        target.classList.add('notobooked-item-unblurring');
        
        setTimeout(() => {
          target.classList.remove('notobooked-item-blurred-active');
          target.classList.remove('notobooked-item-unblurring');
          overlay.remove();
        }, 200);

        card.setAttribute('data-notobooked-manually-unblurred', 'true');
      });

      target.appendChild(overlay);
    }
  }
}

function resetCardStyles(card) {
  const layoutTarget = getCardLayoutWrapper(card);
  layoutTarget.classList.remove('notobooked-item-hidden');
  card.classList.remove('notobooked-item-hidden');
  card.removeAttribute('data-notobooked-manually-unblurred');
  
  const target = getCardContentTarget(card);
  target.classList.remove('notobooked-item-blurred-active');
  
  const overlay = target.querySelector('.notobooked-unblur-overlay');
  if (overlay) {
    overlay.remove();
  }
}

function resetAllCardsManualUnblurState() {
  const cards = document.querySelectorAll('[data-marker="item"], [data-marker*="recommendation"], [data-marker*="catalog-item"], [data-marker*="feed-item"]');
  cards.forEach(card => {
    card.removeAttribute('data-notobooked-manually-unblurred');
  });
}

function runFilter() {
  const cards = document.querySelectorAll('[data-marker="item"], [data-marker*="recommendation"], [data-marker*="catalog-item"], [data-marker*="feed-item"]');
  cards.forEach(applyFilterToCard);
}

const observer = new MutationObserver((mutations) => {
  debounceFilter();
});

let filterTimeout = null;
function debounceFilter() {
  if (filterTimeout) {
    clearTimeout(filterTimeout);
  }
  filterTimeout = setTimeout(() => {
    runFilter();
  }, 100);
}

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});

if (document.readyState === 'complete') {
  runFilter();
} else {
  window.addEventListener('load', runFilter);
}

