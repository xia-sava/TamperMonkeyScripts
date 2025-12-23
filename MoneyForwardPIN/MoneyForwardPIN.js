// ==UserScript==
// @name            MoneyForward PIN
// @namespace       http://xia.sava.to
// @description     MoneyForward ワンタイムパスワード入力 省力化
// @version         1.0.0
// @author          xia@silvia.com
// @match           https://mizuho.x.moneyforward.com/*
// ==/UserScript==

class MoneyForwardPIN {
    constructor() {
        this.inputAdded = false
    }

    findOtpLink() {
        const links = document.querySelectorAll('a')
        for (const link of links) {
            if (link.innerText === '要ワンタイムパスワード' ||
                link.dataset.originalTitle === '要ワンタイムパスワード') {
                return link
            }
        }
        return null
    }

    addInputField(link) {
        if (this.inputAdded) return

        const input = document.createElement('input')
        input.type = 'text'
        input.placeholder = 'OTP'
        input.style.marginLeft = '8px'
        input.style.width = '80px'

        const stopEvent = (e) => e.stopPropagation()
        input.addEventListener('keyup', stopEvent)
        input.addEventListener('keypress', stopEvent)
        input.addEventListener('keydown', async (e) => {
            e.stopPropagation()
            if (e.key === 'Enter') {
                e.preventDefault()
                const pin = input.value.trim()
                if (pin) {
                    input.disabled = true
                    await this.submitPIN(link.href, pin)
                }
            }
        })

        link.parentNode.insertBefore(input, link.nextSibling)
        this.inputAdded = true
    }

    async submitPIN(url, pin) {
        const popup = window.open(url, '_blank', 'width=600,height=400')

        await new Promise(resolve => {
            const checkLoaded = setInterval(() => {
                try {
                    if (popup.document.readyState === 'complete') {
                        clearInterval(checkLoaded)
                        resolve()
                    }
                } catch (e) {
                    // まだアクセスできない
                }
            }, 100)
        })

        const inputField = await this.waitForElement(
            popup.document,
            '#additional_request_response_data'
        )

        if (!inputField) {
            alert('MoneyForwardPIN: input field not found')
            return
        }

        inputField.value = pin

        const submitButton = popup.document.querySelector('input[type=submit]')
        if (submitButton) {
            submitButton.click()
            setTimeout(() => {
                popup.close()
                location.reload()
            }, 2000)
        } else {
            alert('MoneyForwardPIN: submit button not found')
        }
    }

    waitForElement(doc, selector) {
        return new Promise(resolve => {
            const existing = doc.querySelector(selector)
            if (existing) {
                resolve(existing)
                return
            }

            const observer = new MutationObserver(() => {
                const element = doc.querySelector(selector)
                if (element) {
                    observer.disconnect()
                    resolve(element)
                }
            })

            observer.observe(doc.body, {
                childList: true,
                subtree: true
            })
        })
    }

    main() {
        'use strict'

        const checkAndAddInput = () => {
            const link = this.findOtpLink()
            if (link) {
                this.addInputField(link)
            }
        }

        const observer = new MutationObserver(checkAndAddInput)
        observer.observe(document.body, {
            childList: true,
            subtree: true
        })

        checkAndAddInput()
    }
}

new MoneyForwardPIN().main()
