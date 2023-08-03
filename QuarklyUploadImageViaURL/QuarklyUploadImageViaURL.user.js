// ==UserScript==
// @name         Quarkly Upload Image via URL
// @namespace    https://github.com/Maks1mS/userscripts
// @version      0.2
// @description  try to take over the world!
// @author       Maxim Slipenko
// @match        https://quarkly.io/project/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=quarkly.io
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const QUARKLY_UPLOAD_BUTTON_ID = 'upload-image-button';
    const UPLOAD_BY_URL_ID = 'upload-image-button-by-url';

    function insertAfter(newNode, existingNode) {
        existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
    }

    function onClick() {
        let url = prompt("URL");
        let text;
        if (url == null || url == "") {
            return;
        }
        GM.xmlHttpRequest({
            method: "GET",
            url,
            responseType: "blob",
            onload: function(r) {
                const finalUrl = r.finalUrl;
                // TODO: Better filename detection
                const filename = url.substring(url.lastIndexOf('/')+1);
                var arr = r.responseHeaders.split('\r\n');
                var headers = arr.reduce(function (acc, current, i){
                    var parts = current.split(': ');
                    acc[parts[0]] = parts[1];
                    return acc;
                }, {});
                const file = new File(
                    [r.response],
                    filename,
                    {
                        type: headers['content-type'],
                        lastModified:new Date().getTime()
                    }
                );
                const uploadButton = document.getElementById(QUARKLY_UPLOAD_BUTTON_ID);
                if (!uploadButton) {
                    alert("Upload button not found!")
                    return;
                }

                const container = new DataTransfer();
                container.items.add(file);
                uploadButton.files = container.files;
                uploadButton.dispatchEvent(new Event('change', { bubbles: true }));
            }
        })
    }

    function createUploadButton() {
        const button = document.createElement("button");
        button.innerText = "Upload via URL";
        button.id = UPLOAD_BY_URL_ID;
        button.onclick = onClick;
        return button
    }

    function run() {
        const dest = document.querySelector(`label[for="${QUARKLY_UPLOAD_BUTTON_ID}"]`);
        if (dest) {
            if (document.getElementById(UPLOAD_BY_URL_ID)) return;
            const button = createUploadButton();
            insertAfter(button, dest);
        }
    }

    setInterval(run, 2500);

    var css = `
    #${UPLOAD_BY_URL_ID} {
        color: var(--white);
        background: var(--interface-primary-base);
        border-radius: var(--interface-controls-radius);
        padding: 6px 12px;
        line-height: 20px;
        font-size: 14px;
        font-weight: 600;
        border: 0;
        outline: none;
        cursor: pointer;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        text-decoration: none;
        margin-left: 20px;
        height: 44px;
     }
     #${UPLOAD_BY_URL_ID}:hover {
        background: var(--interface-primary-l1);
     }
     `

    GM_addStyle(css);
})();
