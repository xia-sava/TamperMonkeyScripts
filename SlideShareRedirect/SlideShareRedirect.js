// ==UserScript==
// @name            SlideShare Redirect
// @namespace       http://xia.sava.to
// @description     SlideShare の URL を SSSSLIDE へリダイレクトします
// @version         1.0.0
// @author          xia@silvia.com
// @include         https://www.slideshare.net/*
// ==/UserScript==]

class SlideShareRedirect {
    async sleep(msec) {
        return new Promise(resolve => setTimeout(resolve, msec));
    }

    async main() {
        'use strict'

        const url = document.location.href
        if (url.match(/slideshare.net\/.+\/.+/)) {
            // if (confirm("SSSSLIDEに遷移しますか？")) {
            document.location.href = `https://sssslide.com/${url}`
            // }
        }
    }
}

new SlideShareRedirect().main().then()
