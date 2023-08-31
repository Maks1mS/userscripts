// ==UserScript==
// @name         VK Big Chat Stickers
// @namespace    https://github.com/Maks1mS/userscripts
// @version      0.2
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

    .StickersEmojiKeyboard-module__in--GCR5_:has(.StickersKeyboardGroupItem-module__in--CKjkC.StickersKeyboardGroupItem-module__inActive--iqstp > div[aria-label="Стикеры чата"]) .StickersKeyboard-module__keyboard--HhSGu.View-module__panel--WNKKi.View-module__panelSwitched--hg3jP {
       --stickers-columns: 2 !important;
       --stickers-size: 172px !important;
    }
    .StickersEmojiKeyboard-module__in--GCR5_:has(.StickersKeyboardGroupItem-module__in--CKjkC.StickersKeyboardGroupItem-module__inActive--iqstp > div[aria-label="Стикеры чата"]) .Sticker-module__sticker--CtZU6.Sticker-module__tappable--M4lob.StickersKeyboardRow-module__sticker--m7W0R {
       --sticker-size: 172px !important;
       --sticker-scale: 2 !important;
       width: 172px !important;
       height: 172px !important;
    }
    `;

    GM_addStyle(style)
})();
