// ==UserScript==
// @name            Amazon Tags
// @namespace       http://xia.sava.to
// @description     amazon.co.jp の商品ページのURLをちょいちょい変更します．
// @version         1.0
// @author          xia@silvia.com
// @include         https://www.amazon.co.jp/*
// @grant           GM_registerMenuCommand
// ==/UserScript==]

const assocTags = ['foo', 'bar'];

function amazonPlain() {
    goto(plainUrl());
}

function amazonOriginal() {
    goto(plainUrl(), {'emi': 'AN1VRQENFRJN5'});
}

function amazonAssoc() {
    const assocTag = assocTags[Math.floor(Math.random() * assocTags.length)];
    goto(plainUrl(), {'tag': assocTag});
}

function plainUrl() {
    const match = location.href.match(/\/([A-Z0-9]{10})/);
    if (match) {
        return `${location.protocol}//${location.host}/dp/${match[1]}`
    } else {
        return '';
    }
}

function goto(baseUrl, params = {}) {
    console.log(arguments);
    if (baseUrl) {
        const url = new URL(baseUrl);
        for (const key of Object.keys(params)) {
            url.searchParams.append(key, params[key]);
        }

        console.log(`Amazon Tags: Redirect to ${url}`);
        location.href = url;
    } else {
        console.log(`Amazon Tags: Not target url: ${location.href}`);
    }
}

GM_registerMenuCommand('plain URL', amazonPlain, 'p');
GM_registerMenuCommand('amazon original', amazonOriginal, 'o');
GM_registerMenuCommand('random assoc tags', amazonAssoc, 'a');
