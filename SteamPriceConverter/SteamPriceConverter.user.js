// ==UserScript==
// @name         Steam Price Converter
// @namespace    https://github.com/Maks1mS/userscripts
// @version      0.7
// @description  Converts prices to rubles
// @author       Maxim Slipenko
// @match        https://store.steampowered.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=steampowered.com
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    const SYMBOL_TO_CODE_MAPPING = {
        '₸': 'KZT',
        '$': 'USD',
        '₴': 'UAH',
    }

    let state = {
        source_symbol: undefined
    }

    const delay = (ms) =>
        new Promise(resolve => setTimeout(resolve, ms));

    async function getRates() {
        const arr = await new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://www.cbr-xml-daily.ru/daily_utf8.xml',
                onload: function (res) {
                    const valutes = res.responseXML.getElementsByTagName('Valute');
                    resolve([...valutes].map((valute) => {
                        const charCode = valute.getElementsByTagName('CharCode')[0].textContent;
                        const value = parseFloat(valute.getElementsByTagName('Value')[0].textContent.replace(',', '.'));
                        const nominal = parseFloat(valute.getElementsByTagName('Nominal')[0].textContent.replace(',', '.'));

                        return {
                            charCode,
                            value: +(value / nominal).toFixed(4)
                        }
                    }))
                },
            })
        })
        return Object.fromEntries(
            arr.map(obj => [obj.charCode, obj])
        );
    }

    function getCurrentValute() {
        const walletText = document.getElementById('header_wallet_balance').innerText;
        state.source_symbol = Object.keys(SYMBOL_TO_CODE_MAPPING).find(symbol => walletText.includes(symbol))
        return SYMBOL_TO_CODE_MAPPING[state.source_symbol];
    }

    const observers = new WeakMap();
    function addObserver(element, callback, config = { childList: true }) {
        if (element && !observers.has(element)) {
            const observer = new MutationObserver(callback);
            observer.observe(element, config);
            observers.set(element, observer);
        }
    }

    function qs(...args) {
        return document.querySelector(...args);
    }

    function debounce(callback, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                callback(...args);
            }, delay);
        };
    }

    async function main() {
        const rates = await getRates();
        const source_valute = getCurrentValute();

        if (!source_valute) {
            return;
        }

        // await delay(75);

        const convert = (n) => +(n * rates[source_valute].value).toFixed(2);
        const execute = () => {
            replace(convert);
        }

        const config = { childList: true, subtree: true };

        function handle(mutationsList, observer) {
            observer.disconnect();
            execute();
            observer.observe(document.body, config);
        }

        const debouncedCallback = debounce(handle, 300);

        addObserver(document.body, debouncedCallback, config);

        window.addEventListener('popstate', execute);
        window.addEventListener('load', execute);
        document.addEventListener('DOMContentLoaded', execute);

        if (document.readyState == "complete" ||
            document.readyState == "loaded" ||
            document.readyState == "interactive"
        ) {
            execute();
        }

        // GM_registerMenuCommand("update", () => replace(convert), "u");
    }

    function replace(convert) {
        let xpath = `//text()[contains(., \"${state.source_symbol}\") and not(ancestor::*[@data-converted]) and not(ancestor::script)]`;
        let r = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        for (let i = 0; i < r.snapshotLength; i++) {
            let n = r.snapshotItem(i);
            let textContent = n.textContent;
            let regex = new RegExp(`(\\${state.source_symbol}\\s*[0-9\\s]+[.,]?[0-9]*(?:USD)?|[0-9\\s]*[.,]?[0-9]+\\s*\\${state.source_symbol})`, 'g');

            let newContent = textContent.replace(regex, (match) => {
                let value;
                let originalValue;
                originalValue = match.replace(state.source_symbol, '').replace(' ', '').replace(',', '.').trim();
                value = parseFloat(originalValue);

                let convertedValue = convert(value);
                let formattedConvertedValue;
                let formattedOriginalValue;

                if (match.trim().startsWith(state.source_symbol)) {
                    formattedOriginalValue = `${state.source_symbol}${originalValue}`;
                } else {
                    formattedOriginalValue = `${originalValue}${state.source_symbol}`;
                }

                formattedConvertedValue = `${convertedValue}₽`;

                return `${formattedConvertedValue} / ${formattedOriginalValue}`;
            });

            let newNode = document.createTextNode(newContent);
            n.parentNode.setAttribute('data-converted', 'true');
            n.parentNode.replaceChild(newNode, n);
            // console.log(newNode);
        }
    }


    main();
})();
