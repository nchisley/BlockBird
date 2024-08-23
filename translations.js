// translations.js
(function() {
    window.applyTranslations = function() {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (window.translations[key]) {
                if (element.tagName === 'INPUT' && element.placeholder) {
                    element.placeholder = window.translations[key];
                } else {
                    element.innerText = window.translations[key];
                }
            }
        });
    };

    window.loadLanguage = function(lang, callback) {
        fetch(`languages/${lang}.json`)
            .then(response => response.json())
            .then(data => {
                window.translations = data;
                applyTranslations();
                if (callback) callback();
            })
            .catch(error => console.error('Error loading translations:', error));
    };

    function initializeTranslations() {
        chrome.storage.local.get(['language'], function(result) {
            const userLang = result.language || navigator.language.split('-')[0] || 'en';
            loadLanguage(userLang);
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        initializeTranslations();
    });
})();
