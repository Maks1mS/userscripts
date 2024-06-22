// ==UserScript==
// @name         БЕСПЛАТНЫЕ ПВЗ ОЗОН
// @namespace    https://github.com/Maks1mS/userscripts
// @version      0.1
// @description  Заменяет партнерские ПВЗ на понятные адреса 
// @author       Maxim Slipenko
// @match        https://www.ozon.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ozon.ru
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    function qs(...args) {
        return document.querySelector(...args);
    }

    function qsa(...args) {
        return Array.from(document.querySelectorAll(...args));
    }

    async function GM_fetch(url, { method = "get", headers } = {}) {
        return new Promise((resolve, _reject) => {
            const blobPromise = new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    url,
                    method,
                    headers,
                    responseType: "blob",
                    onload: response => resolve(response.response),
                    onerror: reject,
                    ontimeout: reject,
                    onreadystatechange: onHeadersReceived
                });
            });
            blobPromise.catch(_reject);
            function onHeadersReceived(response) {
                const {
                    readyState, responseHeaders, status, statusText
                } = response;
                if (readyState === 2) { // HEADERS_RECEIVED
                    const headers = parseHeaders(responseHeaders);
                    resolve({
                        headers,
                        status,
                        statusText,
                        ok: status.toString().startsWith("2"),
                        arrayBuffer: () => blobPromise.then(blob => blob.arrayBuffer()),
                        blob: () => blobPromise,
                        json: () => blobPromise.then(blob => blob.text()).then(text => JSON.parse(text)),
                        text: () => blobPromise.then(blob => blob.text()),
                    });
                }
            }
        });
    }

    function parseHeaders(headersString) {
        class Headers {
            get(key) {
                return this[key.toLowerCase()];
            }
        }
        const headers = new Headers();
        for (const line of headersString.trim().split("\n")) {
            const [key, ...valueParts] = line.split(":"); // last-modified: Fri, 21 May 2021 14:46:56 GMT
            headers[key.trim().toLowerCase()] = valueParts.join(":").trim();
        }
        return headers;
    }

    const observers = new WeakMap();

    function addObserver(element, callback, config = { childList: true }) {
        if (element && !observers.has(element)) {
            const observer = new MutationObserver(callback);
            observer.observe(element, config);
            observers.set(element, observer);
        }
    }

    async function main() {
        const result = await GM_fetch('https://free-ozon-dpr.vercel.app/merged-data.json');
        const json = await result.json()

        function updateInfo(node) {
            const text = node.textContent;
            const id = text.split(' ').at(-1);
            const pvz = json.find(obj => obj.id === id);
            if (pvz) {
                node.title = node.textContent;
                node.textContent = pvz.address;
            }
        }

        function handleElement(element) {
            if (element) {
                updateInfo(element);
                addObserver(element, () => {
                    updateInfo(element);
                });   
            }
        }

        function updateInfoALL() {
            console.log('updateall!');

            const headerAddress = qs('[data-widget="addressBookBarWeb"] .tsBody400Small');
            const commonAddressBook = qsa('[data-widget="commonAddressBook"] .tsBody500Medium');
            const delivery = qsa('[data-widget="orderDeliveryDetails"] .tsBody500Medium');

            const elements = [headerAddress, ...commonAddressBook, ...delivery];

            elements.forEach(handleElement);
        }

        function updateInfoPeriodically(interval) {
            setInterval(updateInfoALL, interval);
            updateInfoALL();
        }

        let called = false;

        function fullExecute() {
            if (called) return;

            called = true;

            updateInfoPeriodically(5000);

            function handleNewElement(mutationsList) {
                for (let mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('vue-portal-target')) {
                                setTimeout(() => {
                                    updateInfoALL();
                                }, 1000);
                            }
                        });
                    }
                }
            }

            const observer = new MutationObserver(handleNewElement);

            const targetNode = document.body;
            const config = { childList: true, subtree: true };

            observer.observe(targetNode, config);
        }

        window.addEventListener('popstate', fullExecute);
        window.addEventListener('load', fullExecute);
        document.addEventListener('DOMContentLoaded', fullExecute);
        setTimeout(fullExecute, 2500);
    }

    main();
})();