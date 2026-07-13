document.addEventListener('DOMContentLoaded', () => {
  const radioButtons = document.querySelectorAll('input[name="filterMode"]');
  const statusMessage = document.getElementById('status-message');
  let statusTimeout = null;

  chrome.storage.sync.get({ actionType: 'hide' }, (items) => {
    const savedMode = items.actionType;
    const targetRadio = document.getElementById(`mode-${savedMode}`);
    if (targetRadio) {
      targetRadio.checked = true;
    }
  });

  radioButtons.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const selectedValue = e.target.value;
      
      chrome.storage.sync.set({ actionType: selectedValue }, () => {
        showStatusSaved();
      });
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
