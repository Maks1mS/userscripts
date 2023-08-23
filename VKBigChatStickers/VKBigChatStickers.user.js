// ==UserScript==
// @name         VK Big Chat Stickers
// @namespace    https://github.com/Maks1mS/userscripts
// @version      0.1
// @description  Increases size of chat stickers
// @author       Maxim Slipenko
// @match        https://vk.com/*
// @icon         https://vk.com/favicon.ico
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const style = `
    img.StickerUGC {
        width: 256px;
        height: 256px;
    }
    `;

    GM_addStyle(style)
})();
