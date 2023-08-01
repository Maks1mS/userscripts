// ==UserScript==
// @name         Github Link External Resources
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Github Link External Resources
// @author       Maxim Slipenko
// @match        https://github.com/*
// @icon         https://github.com/favicon.ico
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_registerMenuCommand
// @grant        window.onurlchange
// ==/UserScript==

(function() {
    'use strict';

    const translations = {
        'ru-RU': {
            settings: 'Настройки',
            config: 'Параметры'
        },
        'en-US': {
            settings: 'Settings',
            config: 'Config'
        }
    }

    function t(key) {
        const currentLang = navigator.language;
        return translations?.[currentLang]?.[key] ?? translations?.['en-US'] ?? key;
    }

    const settingsId = 'GithubLinkExternalResources';

    const gmc = new GM_config({
		events: {
			save () {
				this.close();
			},
		},
		fields: {
			data: {
				label: t('config'),
				type: 'textarea',
                // github prefix org or org/repo | prefix | url ($1 - numeric identifier)
                default: 'pyside | PYSIDE- | https://bugreports.qt.io/browse/$1'
			},
		},
		id: settingsId,
		title: 'Github Link External Resources',
        css: `
        #${settingsId} .field_label {
           font-size: 20px;
        }
        textarea {
           width: 60%;
           font-size: 16px;
        }`
	});

	GM_registerMenuCommand(t('settings'), () => gmc.open());

    const selector = '.js-issue-title.markdown-title,' +
          '.js-navigation-open.markdown-title,' +
          '#partial-actions-workflow-runs .Link--primary,' + // actions
          '.repository-content h3.PageHeader-title > span > span,' + // actions
          'div.my-2.Details-content--hidden,' + // commit message
          '.wb-break-word.width-fit > .color-fg-default.lh-0.mb-2.markdown-title'; // sidebar

    const replace = (node, row) => {
         if (!node) return;
         const re = new RegExp(`\\b(${row[1]}\\d+)\\b(?!<\\/a>|")`, 'g');
         node.innerHTML = node.innerHTML.replace(re, `<a href="${row[2]}">$1</a>`);
    }

    let data = '';

    const run = (url) => {
        const row = data.find(row => url.startsWith(`https://github.com/${row[0]}`));

        console.log(row)

        const matches = document.querySelectorAll(selector)
        matches.forEach(n => replace(n, row));
    }

    const onInit = gmc => new Promise(resolve => {
       let isInit = () => setTimeout(() =>
       gmc.isInit ? resolve() : isInit(), 0);
       isInit();
    });

    onInit(gmc).then(() => {
        data = gmc.get('data').split('\n').map(l => l.split('|').map(w => w.trim()))
        if (window.onurlchange === null) {
            window.addEventListener('urlchange', (info) => {
                run(info?.url);
            });
        }
    });
})();
