// ==UserScript==
// @name         TweetDeck画像クリックで新ウィンドウ表示
// @namespace    http://xia.sava.to
// @version      0.1
// @description  TweetDeckで画像クリック時に、新ウィンドウでツイートを表示するスクリプト
// @author       xia
// @match        https://pro.x.com/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";
    let popupWindow = null;
    let currentHoveredImage = null;

    // ポップアップウィンドウを作成
    function createPopupWindow(imageUrl, windowName) {
        const tweetDeckX = window.screenX || window.screenLeft;
        const tweetDeckY = window.screenY || window.screenTop;
        const tweetDeckWidth = window.outerWidth;
        const popupLeft = tweetDeckX + tweetDeckWidth;
        const popupTop = tweetDeckY;
        const title = windowName === "_blank" ? "Fixed Image Preview" : "Image Preview";
        const newWin = window.open("", windowName, "left=" + popupLeft + ",top=" + popupTop + ",width=800,height=800");
        const origUrl = imageUrl.replace(/name=\w+/, 'name=orig');
        if (newWin) {
            newWin.document.write(
                '<html><head><title>' + title + '</title></head>' +
                '<body style="margin:0;padding:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;">' +
                '<img id="popup-img" src="' + origUrl + '" style="max-width:100%;max-height:100%;display:block;cursor:pointer;">' +
                '</body></html>'
            );
            newWin.document.close();
            // DOM が構築されるのを setTimeout で待つ
            const addListeners = () => {
                const imgElem = newWin.document.getElementById("popup-img");
                if (imgElem) {
                    // キー押下で ESC キーが押されたらウィンドウを閉じる
                    newWin.document.addEventListener("keydown", function(e) {
                        if (e.key === "Escape") {
                            newWin.close();
                        }
                    });
                    // 画像がクリックされたらウィンドウを閉じる
                    imgElem.addEventListener("click", function(e) {
                        newWin.close();
                    });
                } else {
                    // まだ要素が見つからなければ再試行
                    setTimeout(addListeners, 50);
                }
            };
            addListeners();
        }
        return newWin;
    }

    // ホバー用ポップアップを開く関数（即時）
    function openPopup(imageUrl) {
        if (popupWindow && !popupWindow.closed) {
            popupWindow.close();
        }
        popupWindow = createPopupWindow(imageUrl, "ImagePreview");
    }

    // ホバー解除時に呼ぶ関数
    function closePopup() {
        if (popupWindow && !popupWindow.closed) {
            popupWindow.close();
            popupWindow = null;
        }
    }

    // 対象画像かどうかのチェック関数
    function isTargetImage(target) {
        if (target.tagName.toLowerCase() !== "img") return false;
        if (!target.src.startsWith("https://pbs.twimg.com/")) return false;
        const aElem = target.closest("a");
        if (!aElem || !aElem.href.includes("/photo/")) return false;
        return true;
    }

    // 画像にホバーしたとき、対象なら記録し、ctrlキーが押されていれば即ポップアップ表示
    document.addEventListener("mouseover", function(e) {
        if (!isTargetImage(e.target)) return;
        currentHoveredImage = e.target;
        if (e.ctrlKey) {
            openPopup(currentHoveredImage.src);
        }
    });

    // 画像からマウスが離れたら、記録をクリアしポップアップを閉じる
    document.addEventListener("mouseout", function(e) {
        if (!isTargetImage(e.target)) return;
        currentHoveredImage = null;
        closePopup();
    });

    // ctrl キーが押された場合、hover中の画像があればポップアップを表示
    document.addEventListener("keydown", function(e) {
        if (e.key === "Control" && currentHoveredImage && (!popupWindow || popupWindow.closed)) {
            openPopup(currentHoveredImage.src);
        }
    });

    // TweetDeck が document キャプチャフェーズで処理するため、
    // window キャプチャフェーズで先に止める
    window.addEventListener("pointerdown", function(e) {
        if (!isTargetImage(e.target)) return;
        e.stopImmediatePropagation();
        e.preventDefault();
    }, true);

    // クリックイベント：元の画像がクリックされたら固定用ウィンドウを新規に開く
    window.addEventListener("click", function(e) {
        const target = e.target;
        if (!isTargetImage(target)) return;
        e.stopImmediatePropagation();
        e.preventDefault();
        if (popupWindow && !popupWindow.closed) {
            popupWindow.close();
            popupWindow = null;
        }
        // "_blank"で新規ウィンドウとして固定表示
        createPopupWindow(target.src, "_blank");
    }, true);
})();
