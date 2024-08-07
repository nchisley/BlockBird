document.addEventListener('DOMContentLoaded', function() {
  const walletList = document.getElementById('wallet-list');
  const addWalletButton = document.getElementById('add-wallet');
  const exportWalletsButton = document.getElementById('export-wallets');
  const importWalletsButton = document.getElementById('import-wallets-button');
  const importWalletsInput = document.getElementById('import-wallets');
  const walletLabelInput = document.getElementById('wallet-label');
  const walletAddressInput = document.getElementById('wallet-address');
  const alertBox = document.getElementById('alert-box');

  function loadWallets() {
    chrome.storage.local.get(['wallets'], function(result) {
      const wallets = result.wallets || [];
      walletList.innerHTML = '';
      wallets.forEach((wallet, index) => {
        const truncatedAddress = truncateAddress(wallet.address);
        const walletItem = document.createElement('div');
        walletItem.className = 'wallet-item';
        walletItem.setAttribute('data-id', index);
        walletItem.innerHTML = `
          <span class="wallet-label">${wallet.label}</span>
          <span class="wallet-address" data-address="${wallet.address}">${truncatedAddress}</span>
          <button class="copy-wallet edit-delete" data-address="${wallet.address}" data-index="${index}" title="Copy"><i class="fas fa-copy"></i></button>
          <button class="edit-wallet edit-delete" data-index="${index}" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="delete-wallet edit-delete" data-index="${index}" title="Delete"><i class="fas fa-trash-alt"></i></button>
        `;
        walletList.appendChild(walletItem);
      });
      initSortable();
    });
  }

  function truncateAddress(address) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }

  function saveWallets(wallets) {
    chrome.storage.local.set({ wallets }, function() {
      console.log('Wallets saved:', wallets);
      loadWallets();
    });
  }

  addWalletButton.addEventListener('click', () => {
    const label = walletLabelInput.value.trim();
    const address = walletAddressInput.value.trim();
    if (label && address) {
      chrome.storage.local.get(['wallets'], function(result) {
        const wallets = result.wallets || [];
        const addressExists = wallets.some(wallet => wallet.address === address);
        if (addressExists) {
          showAlert('This address has already been added.', 'negative');
        } else {
          wallets.push({ label, address });
          saveWallets(wallets);
          showAlert('Wallet added successfully!', 'positive');
          walletLabelInput.value = '';
          walletAddressInput.value = '';
        }
      });
    }
  });

  walletList.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    if (target.classList.contains('edit-wallet')) {
      const index = target.dataset.index;
      chrome.storage.local.get(['wallets'], function(result) {
        const wallets = result.wallets || [];
        const wallet = wallets[index];
        walletLabelInput.value = wallet.label;
        walletAddressInput.value = wallet.address;
        wallets.splice(index, 1);
        saveWallets(wallets);
      });
    } else if (target.classList.contains('delete-wallet')) {
      const index = target.dataset.index;
      chrome.storage.local.get(['wallets'], function(result) {
        const wallets = result.wallets || [];
        wallets.splice(index, 1);
        saveWallets(wallets);
        showAlert('Wallet deleted successfully!', 'positive');
      });
    } else if (target.classList.contains('copy-wallet')) {
      const address = target.dataset.address;
      navigator.clipboard.writeText(address).then(() => {
        const originalHTML = target.innerHTML;
        target.innerHTML = '<i class="fas fa-check"></i>'; // Use Font Awesome checkmark icon
        setTimeout(() => {
          target.innerHTML = originalHTML;
        }, 2000);
      });
    }
  });

  exportWalletsButton.addEventListener('click', () => {
    chrome.storage.local.get(['wallets'], function(result) {
      const wallets = result.wallets || [];
      const csvContent = wallets.map(wallet => `${wallet.label},${wallet.address}`).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wallets.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  });

  importWalletsButton.addEventListener('click', () => {
    importWalletsInput.click();
  });

  importWalletsInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const content = e.target.result;
        const lines = content.split('\n');
        const newWallets = lines.map(line => {
          const [label, address] = line.split(',');
          return { label: label.trim(), address: address.trim() };
        });
        chrome.storage.local.get(['wallets'], function(result) {
          let existingWallets = result.wallets || [];
          let addedWallets = [];
          newWallets.forEach(newWallet => {
            const exists = existingWallets.some(wallet => wallet.address === newWallet.address);
            if (!exists) {
              existingWallets.push(newWallet);
              addedWallets.push(newWallet);
            }
          });
          saveWallets(existingWallets);
          if (addedWallets.length > 0) {
            showAlert(`${addedWallets.length} new wallet(s) imported.`, 'positive');
          } else {
            showAlert('No new wallets were imported.', 'negative');
          }
        });
      };
      reader.readAsText(file);
    }
  });

  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = 'alert-message alert-' + type;
    alertBox.style.display = 'block';
    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 5000);
  }

  function initSortable() {
    const sortable = new Sortable(walletList, {
      animation: 150,
      onEnd: function (evt) {
        const oldIndex = evt.oldIndex;
        const newIndex = evt.newIndex;
        console.log('Dragged from index', oldIndex, 'to index', newIndex);
        chrome.storage.local.get(['wallets'], function(result) {
          const wallets = result.wallets || [];
          const movedWallet = wallets.splice(oldIndex, 1)[0];
          wallets.splice(newIndex, 0, movedWallet);
          saveWallets(wallets);
        });
      }
    });
    console.log('Sortable initialized:', sortable);
  }

  loadWallets();
});
