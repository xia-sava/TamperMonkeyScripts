// ==UserScript==
// @name         Amazon Order History
// @namespace    https://xia.sava.to
// @description  Amazon 注文履歴に「未発送の注文」を取り戻す
// @version      1.0.0
// @author       xia@silvia.com
// @match        https://www.amazon.co.jp/gp/*/order-history*
// @icon         https://www.google.com/s2/favicons?domain=amazon.co.jp
// @updateURL    https://github.com/xia-sava/TamperMonkeyScripts/raw/master/AmazonOrderHistory/AmazonOrderHistory.js
// @downloadURL  https://github.com/xia-sava/TamperMonkeyScripts/raw/master/AmazonOrderHistory/AmazonOrderHistory.js
// ==/UserScript==

class AmazonOrderHistory {
    async main() {
        if (window !== window.parent) {
            return;
        }
        await this.modifyTabLink();
        await this.revSortOrders();
    }

    // タブ名とリンク先を変更
    async modifyTabLink() {
        const baseA = document.querySelector('a[href*="orderFilter=freshOrders-months-6"]');
        if (baseA === null) {
            return;
        }
        const baseTab = baseA.parentNode.parentNode;
        const newTab = baseTab.cloneNode(true);
        const newA = newTab.querySelector('a');
        newA.href = baseA.href.replace("orderFilter=freshOrders-months-6", "orderFilter=open");
        newA.textContent = "未発送の注文 ";
        baseTab.parentNode.insertBefore(newTab, baseTab);
    }

    async revSortOrders() {
        if (document.location.href.indexOf("orderFilter=open") === -1) {
            return;
        }
        const container = document.querySelector("#ordersContainer");
        if (container === null) {
            return;
        }
        /** @type Node[] */
        const orders = Array.from(this.collectOrders(document));

        await Promise.all(Array.from(
            document.querySelectorAll("ul.a-pagination li.a-normal a"),
            async elem => {
                return new Promise((resolve, reject) => {
                    const iframe = document.createElement("iframe");
                    iframe.src = elem.href;
                    iframe.width = "1";
                    iframe.height = "1";
                    iframe.onload = () => {
                        const doc = iframe.contentDocument;
                        orders.push(...this.collectOrders(doc));
                        resolve();
                    };
                    document.querySelector("body").append(iframe);
                })
            }));

        orders.sort((a, b) => this.ft(a) - this.ft(b));

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        container.append(...orders);
    }

    ft(elem) {
        let text = elem.querySelector("div.shipment span")?.textContent?.trim() ?? "";
        const m1 = text.match(/(\d+)月(\d+)日/);
        if (m1) {
            const now = new Date();
            const m = m1[1];
            const d = m1[2];
            const y = now.getFullYear() + ((m < now.getMonth() + 1) ? 1 : 0);
            return new Date(y, parseInt(m), parseInt(d));
        }
        const m2 = text.match(/(\d+)\/(\d+)\/(\d+)/);
        if (m2) {
            return new Date(parseInt(m2[1]), parseInt(m2[2]), parseInt(m2[3]));
        }
        return new Date();
    }

    collectOrders(page) {
        return page.querySelectorAll("#ordersContainer > div.order") ?? [];
    }
}


(function () {
    'use strict';

    try {
        (new AmazonOrderHistory()).main().then();
    } catch (e) {
        console.log(e);
    }
})();
