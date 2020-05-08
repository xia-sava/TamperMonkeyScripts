// ==UserScript==
// @name            Twitter RT Redirect
// @namespace       http://xia.sava.to
// @description     twitterでRTのURLを元ツイートへリダイレクトします
// @version         1.1.0
// @author          xia@silvia.com
// @include         https://twitter.com/*
// ==/UserScript==]

class TwitterRtRedirect {
    async sleep(msec) {
        return new Promise(resolve => setTimeout(resolve, msec));
    }

    async main() {
        'use strict'

        // status 以外だったらスルー
        if (!document.location.href.match(/twitter.com\/.+?\/status\/\d+/)) {
            return
        }

        // Twitterのスクリプトがコンテンツを作り終えてくれるのを待つ
        let retry = 50;
        while (document.querySelector('article:first-child') === null && retry-- > 0) {
            await this.sleep(100);
        }

        // 元URLはRT数やいいね数のところから取得するしかないのだろうか
        const walker = document.createTreeWalker(
            document.querySelector('article:first-child'),
            window.NodeFilter.SHOW_TEXT
        );
        /** @type HTMLAnchorElement */
        let found = null
        while (walker.nextNode()) {
            const text = walker.currentNode.textContent
            if (text === 'リツイート' || text === 'いいねの数') {
                found = walker.currentNode.parentNode.closest('a')
                break
            }
        }
        if (found) {
            // 何はともあれリダイレクトしちゃう
            document.location.href = found.href.replace(/\/(?:retweets|likes)$/, '')
        }
    }
}

new TwitterRtRedirect().main().then()
