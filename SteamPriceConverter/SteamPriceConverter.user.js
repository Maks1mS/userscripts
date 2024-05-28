// ==UserScript==
// @name         Steam Price Converter
// @namespace    https://github.com/Maks1mS/userscripts
// @version      0.2
// @description  Converts prices to rubles
// @author       Maxim Slipenko
// @match        https://store.steampowered.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=steampowered.com
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    const SYMBOL_TO_CODE_MAPPING = {
        '₸': 'KZT',
        '$': 'USD',
        '₴': 'UAH',
    }

    let state = {
        source_symbol: undefined
    }

    async function getRates() {
        const arr = await new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://www.cbr-xml-daily.ru/daily_utf8.xml',
                onload: function(res) {
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

    async function main() {
        const rates = await getRates();
        const source_valute = getCurrentValute();

        if (!source_valute) {
            return;
        }

        const convert = (n) => +(n * rates[source_valute].value).toFixed(2);
        replace(convert);

        GM_registerMenuCommand("update", () => replace(convert), "u");
    }

    function replace(convert) {
        let r = document.evaluate(`//text()[contains(., \"${state.source_symbol}\")]`,document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        for (let i = 0; i < r.snapshotLength; i++) {
            let n = r.snapshotItem(i);
            const value = parseFloat(n.textContent.replace(" ", "").replace(',', '.'))
            n.replaceWith(`${convert(value)} ₽`);
            console.log(n)
        }
    }

    main();
})();
