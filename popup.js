document.addEventListener('DOMContentLoaded', () => {
  const radioButtons = document.querySelectorAll('input[name="filterMode"]');
  const statusMessage = document.getElementById('status-message');
  const removeHiddenCheckbox = document.getElementById('remove-hidden-checkbox');
  const removeHiddenRow = document.getElementById('remove-hidden-row');
  let statusTimeout = null;

  function updateRemoveHiddenAvailability(mode) {
    removeHiddenRow.classList.toggle('disabled', mode !== 'hide');
  }

  chrome.storage.sync.get({ actionType: 'hide', removeHidden: false }, (items) => {
    const savedMode = items.actionType;
    const targetRadio = document.getElementById(`mode-${savedMode}`);
    if (targetRadio) {
      targetRadio.checked = true;
    }
    removeHiddenCheckbox.checked = items.removeHidden;
    updateRemoveHiddenAvailability(savedMode);
  });

  radioButtons.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const selectedValue = e.target.value;
      updateRemoveHiddenAvailability(selectedValue);

      chrome.storage.sync.set({ actionType: selectedValue }, () => {
        showStatusSaved();
      });
    });
  });

  removeHiddenCheckbox.addEventListener('change', (e) => {
    chrome.storage.sync.set({ removeHidden: e.target.checked }, () => {
      showStatusSaved();
    });
  });


  function showStatusSaved() {
    if (statusTimeout) {
      clearTimeout(statusTimeout);
      statusMessage.classList.remove('show');
    }

    setTimeout(() => {
      statusMessage.classList.add('show');
      
      statusTimeout = setTimeout(() => {
        statusMessage.classList.remove('show');
      }, 2000);
    }, 50);
  }
});
