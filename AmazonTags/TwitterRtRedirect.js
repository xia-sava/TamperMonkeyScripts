// ==UserScript==
// @name            Twitter RT Redirect
// @namespace       http://xia.sava.to
// @description     twitterでRTのURLを元ツイートへリダイレクトします
// @version         1.0.0
// @author          xia@silvia.com
// @include         https://twitter.com/*
// ==/UserScript==]

class TwitterRtRedirect {
    async sleep(msec) {
        return new Promise(resolve => setTimeout(resolve, msec));
    }

    async main() {
        'use strict';

        // status 以外だったらスルー
        if (!document.location.href.match(new RegExp(/twitter.com\/.+?\/status\/\d+/))) {
            return;
        }

        // Twitterのスクリプトがコンテンツを作り終えてくれるのを待つ
        let retry = 50;
        while (document.querySelector('article:first-child') === null && retry-- > 0) {
            await this.sleep(100);
        }

        // RT のリンクが存在しないようならスルー
        const rt_name = document.querySelector('article > div > div:first-child a');
        if (rt_name === null) {
            console.log('not rt');
            return;
        }

        // 元URLはRT数のところから取得するしかないのだろうか
        const rt_nums = document.querySelector('article > div > div:nth-last-child(2) > div:first-child > a');
        if (rt_nums === null) {
            console.log('no rt');
            return;
        }

        // 何はともあれリダイレクトしちゃう
        document.location.href = rt_nums.href.replace('/retweets', '');
    }
}

new TwitterRtRedirect().main().then();
