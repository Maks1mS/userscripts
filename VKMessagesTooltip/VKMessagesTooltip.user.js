// ==UserScript==
// @name         VK Messages Tooltip
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add tooltip to messages in dialog list
// @author       Maxim Slipenko
// @match        https://vk.com/*
// @icon         https://vk.com/favicon.ico
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const styles = `
span.nim-dialog--preview._dialog_body {
    pointer-events: auto;
}
span.nim-dialog--preview._dialog_body:hover {
    background: white;
    position: absolute;
    white-space: normal;
    z-index: 130;
    border-radius: 6px;
    box-shadow: 0 1px 3px var(--black_alpha12);
    color: var(--text_primary);
    background: var(--modal_card_background);

    border: 1px solid var(--separator_common);
    padding: 5px;
    transform: translate(-6px, -6px);
}

.nim-dialog--text-preview:has(span.nim-dialog--preview._dialog_body:hover):before {
    content: ' ';
    display: inline-block;
    vertical-align: middle;
    height: 100%;
}

.nim-dialog:not(.nim-dialog_deleted):not(.nim-dialog_classic).nim-dialog_selected .nim-dialog--preview._dialog_body:hover {
    color: var(--white);
    background: var(--dynamic_blue);
}

li.nim-dialog:has(span.nim-dialog--preview._dialog_body:hover) {
    pointer-events:none;
}
`

    document.addEventListener('click', function(event) {
        var t = event.target.closest('li.nim-dialog');
        if (t?.querySelector('span.nim-dialog--preview._dialog_body:hover')) {
            event.stopPropagation();
        }
    }, { capture: true });

    GM_addStyle(styles);
})();
