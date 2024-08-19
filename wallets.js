document.addEventListener('DOMContentLoaded', function() {
    const walletList = document.getElementById('wallet-list');
    const addWalletButton = document.getElementById('add-wallet');
    const exportWalletsButton = document.getElementById('export-wallets');
    const importWalletsButton = document.getElementById('import-wallets-button');
    const importWalletsInput = document.getElementById('import-wallets');
    const walletLabelInput = document.getElementById('wallet-label');
    const walletAddressInput = document.getElementById('wallet-address');
    const alertBox = document.getElementById('alert-box');
    const walletSearchInput = document.getElementById('wallet-search');

    let allWallets = [];

    if (!window.walletListenersAdded) {
        addWalletButton.addEventListener('click', handleAddWallet);
        walletList.addEventListener('click', handleWalletListClick);
        exportWalletsButton.addEventListener('click', handleExportWallets);
        importWalletsButton.addEventListener('click', () => importWalletsInput.click());
        importWalletsInput.addEventListener('change', handleImportWallets);
        walletSearchInput.addEventListener('input', debounce(handleWalletSearch, 300));
        window.walletListenersAdded = true;
    }

    function loadWallets() {
        chrome.storage.local.get(['wallets'], function(result) {
            if (chrome.runtime.lastError) {
                console.error('Error loading wallets:', chrome.runtime.lastError);
                showAlert('Failed to load wallets. Please try again.', 'negative');
                return;
            }
            allWallets = result.wallets || [];
            renderWalletList(allWallets);
            initSortable(allWallets);
        });
    }

    function renderWalletList(wallets) {
        walletList.innerHTML = '';
        wallets.forEach((wallet, index) => {
            if (!wallet || !wallet.address) return; // Skip invalid wallets
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
    }

    function truncateAddress(address) {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }

    function saveWallets(wallets, callback) {
        chrome.storage.local.set({ wallets: wallets }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error saving wallets:', chrome.runtime.lastError);
                showAlert('Failed to save wallets. Please try again.', 'negative');
                return;
            }
            allWallets = wallets;
            if (callback) callback();
        });
    }

    function handleAddWallet() {
        const label = walletLabelInput.value.trim();
        const address = walletAddressInput.value.trim();
        if (!label || !address) {
            showAlert('Please enter both a label and an address.', 'negative');
            return;
        }
    
        chrome.storage.local.get(['wallets'], function(result) {
            if (chrome.runtime.lastError) {
                console.error('Error retrieving wallets:', chrome.runtime.lastError);
                showAlert('Failed to add wallet. Please try again.', 'negative');
                return;
            }
            const wallets = result.wallets || [];
            if (window.editingIndex !== undefined) {
                // If editing, update the existing wallet
                wallets[window.editingIndex] = { label, address };
                delete window.editingIndex;
            } else if (wallets.some(wallet => wallet?.address === address)) {
                showAlert('This address has already been added.', 'negative');
                return;
            } else if (wallets.length >= 1000) {
                showAlert('You have reached the limit of 1000 wallets.', 'negative');
                return;
            } else {
                // Add new wallet to the beginning of the array
                wallets.unshift({ label, address });
            }
            saveWallets(wallets, () => {
                renderWalletList(allWallets);
                showAlert('Wallet ' + (window.editingIndex !== undefined ? 'updated' : 'added') + ' successfully!', 'positive');
                clearInputs();
                initSortable(allWallets);
            });
        });
    }

    function clearInputs() {
        walletLabelInput.value = '';
        walletAddressInput.value = '';
    }

    function handleWalletListClick(e) {
        const target = e.target.closest('button');
        if (!target) return;

        const index = parseInt(target.dataset.index);
        chrome.storage.local.get(['wallets'], function(result) {
            if (chrome.runtime.lastError) {
                console.error('Error retrieving wallets:', chrome.runtime.lastError);
                showAlert('Failed to perform action. Please try again.', 'negative');
                return;
            }
            const wallets = result.wallets || [];
            if (target.classList.contains('edit-wallet')) {
                editWallet(index, wallets);
            } else if (target.classList.contains('delete-wallet')) {
                deleteWallet(index, wallets);
            } else if (target.classList.contains('copy-wallet')) {
                copyWallet(target);
            }
        });
    }

    function editWallet(index, wallets) {
        const wallet = wallets[index];
        if (wallet) {
            walletLabelInput.value = wallet.label;
            walletAddressInput.value = wallet.address;
            window.editingIndex = index;
            renderWalletList(allWallets);
        }
    }

    function deleteWallet(index, wallets) {
        if (confirm('Are you sure you want to delete this wallet?')) {
            wallets.splice(index, 1);
            saveWallets(wallets, () => {
                renderWalletList(allWallets);
                showAlert('Wallet deleted successfully!', 'positive');
                initSortable(allWallets);
            });
        }
    }

    function copyWallet(target) {
        const address = target.dataset.address;
        navigator.clipboard.writeText(address).then(() => {
            target.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                target.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            showAlert('Failed to copy wallet address.', 'negative');
        });
    }

    function handleExportWallets() {
        chrome.storage.local.get(['wallets'], function(result) {
            if (chrome.runtime.lastError) {
                console.error('Error retrieving wallets:', chrome.runtime.lastError);
                showAlert('Failed to export wallets. Please try again.', 'negative');
                return;
            }
            const wallets = result.wallets || [];
            const csvContent = wallets.map(w => `${w.label},${w.address}`).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "wallets.csv");
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    }

    function handleImportWallets(event) {
        const file = event.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                const lines = content.split('\n').filter(line => line.trim() !== '');
                // Limit the number of lines to 1000
                const limitedLines = lines.slice(0, 1000);
                
                const newWallets = limitedLines.map(line => {
                    const [label, address] = line.split(',').map(s => s.trim());
                    return { label, address };
                }).filter(wallet => wallet.label && wallet.address);
    
                chrome.storage.local.get(['wallets'], function(result) {
                    if (chrome.runtime.lastError) {
                        console.error('Error retrieving wallets:', chrome.runtime.lastError);
                        showAlert('Failed to import wallets. Please try again.', 'negative');
                        return;
                    }
                    let existingWallets = result.wallets || [];
                    const addedWallets = newWallets.filter(newWallet => 
                        !existingWallets.some(existing => existing.address === newWallet.address)
                    );
                    
                    // Check if we've reached the limit after adding new wallets
                    if (existingWallets.length + addedWallets.length > 1000) {
                        showAlert('You have reached the limit of 1000 wallets.', 'negative');
                        addedWallets.length = 1000 - existingWallets.length;
                    }
    
                    existingWallets = [...existingWallets, ...addedWallets];
                    
                    saveWallets(existingWallets, () => {
                        renderWalletList(existingWallets);
                        showAlert(`${addedWallets.length} new wallet(s) imported.`, 'positive');
                        initSortable(existingWallets);
                    });
                });
            } catch (error) {
                console.error('Error processing file:', error);
                showAlert('Failed to process import file. Please check the file format.', 'negative');
            }
        };
        reader.onerror = function() {
            console.error('Error reading file:', reader.error);
            showAlert('Failed to read file. Please try again with a valid file.', 'negative');
        };
        reader.readAsText(file);
    }

    function showAlert(message, type) {
        alertBox.textContent = message;
        alertBox.className = `alert-message alert-${type}`;
        alertBox.style.display = 'block';
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 5000);
    }

    function initSortable(wallets) {
        if (wallets.length > 1) {
            new Sortable(walletList, {
                animation: 150,
                onEnd: function (evt) {
                    const oldIndex = evt.oldIndex;
                    const newIndex = evt.newIndex;
                    const movedWallet = allWallets.splice(oldIndex, 1)[0];
                    allWallets.splice(newIndex, 0, movedWallet);
                    
                    if (typeof window.editingIndex !== 'undefined') {
                        if (oldIndex === window.editingIndex) {
                            window.editingIndex = newIndex;
                        } else if (oldIndex < window.editingIndex && newIndex > window.editingIndex) {
                            window.editingIndex--;
                        } else if (oldIndex > window.editingIndex && newIndex < window.editingIndex) {
                            window.editingIndex++;
                        }
                    }

                    saveWallets(allWallets, () => {
                        renderWalletList(allWallets);
                    });
                }
            });
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    function handleWalletSearch() {
        const searchTerm = walletSearchInput.value.toLowerCase();
        const filteredWallets = allWallets.filter(wallet => 
            wallet.label.toLowerCase().includes(searchTerm) || 
            wallet.address.toLowerCase().includes(searchTerm)
        );
        renderWalletList(filteredWallets);
    }

    loadWallets();
});