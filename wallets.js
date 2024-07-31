document.addEventListener('DOMContentLoaded', function() {
  const walletList = document.getElementById('wallet-list');
  const addWalletButton = document.getElementById('add-wallet');
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
        walletItem.innerHTML = `
          <span class="wallet-label">${wallet.label}</span>
          <span class="wallet-address" data-address="${wallet.address}">${truncatedAddress}</span>
          <button class="copy-wallet edit-delete" data-address="${wallet.address}" data-index="${index}">Copy</button>
          <button class="edit-wallet edit-delete" data-index="${index}">Edit</button>
          <button class="delete-wallet edit-delete" data-index="${index}">Delete</button>
        `;
        walletList.appendChild(walletItem);
      });
    });
  }

  function truncateAddress(address) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }

  function saveWallets(wallets) {
    chrome.storage.local.set({ wallets }, function() {
      loadWallets();
    });
  }

  function showAlert(message) {
    alertBox.textContent = message;
    alertBox.style.display = 'block';
    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 5000);
  }

  addWalletButton.addEventListener('click', () => {
    const label = walletLabelInput.value.trim();
    const address = walletAddressInput.value.trim();
    if (label && address) {
      chrome.storage.local.get(['wallets'], function(result) {
        const wallets = result.wallets || [];
        const addressExists = wallets.some(wallet => wallet.address === address);
        if (addressExists) {
          showAlert('This address has already been added.');
        } else {
          wallets.push({ label, address });
          saveWallets(wallets);
          walletLabelInput.value = '';
          walletAddressInput.value = '';
        }
      });
    }
  });

  walletList.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-wallet')) {
      const index = e.target.dataset.index;
      chrome.storage.local.get(['wallets'], function(result) {
        const wallets = result.wallets || [];
        const wallet = wallets[index];
        walletLabelInput.value = wallet.label;
        walletAddressInput.value = wallet.address;
        wallets.splice(index, 1);
        saveWallets(wallets);
      });
    } else if (e.target.classList.contains('delete-wallet')) {
      const index = e.target.dataset.index;
      chrome.storage.local.get(['wallets'], function(result) {
        const wallets = result.wallets || [];
        wallets.splice(index, 1);
        saveWallets(wallets);
      });
    } else if (e.target.classList.contains('copy-wallet')) {
      const address = e.target.dataset.address;
      navigator.clipboard.writeText(address).then(() => {
        const copyButton = e.target;
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '&#10003;'; // Unicode for checkmark
        setTimeout(() => {
          copyButton.innerHTML = originalText;
        }, 2000);
      });
    }
  });

  loadWallets();
});
