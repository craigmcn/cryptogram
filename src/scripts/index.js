const startCryptogram = document.getElementById('start-cryptogram'),
    enterCryptogram = document.getElementById('enter-cryptogram'),
    cryptogramText = document.getElementById('cryptogram-text'),
    cryptogramSolution = document.getElementById('cryptogram-solution'),
    alphabet = document.getElementById('alpha'),
    actionButtons = document.getElementById('action-buttons'),
    editButton = document.getElementById('edit-button'),
    clearButton = document.getElementById('clear-button'),
    newButton = document.getElementById('new-button')

enterCryptogram.addEventListener('submit', e => {
    e.preventDefault()
    if (cryptogramText.value) initCryptogram()
})

editButton.addEventListener('click', e => {
    show(startCryptogram)
    hide(alphabet)
    hide(actionButtons)
    empty(cryptogramSolution)
    e.target.blur()
})

newButton.addEventListener('click', e => {
    empty(cryptogramSolution)
    cryptogramText.value = ''
    show(startCryptogram)
    hide(alphabet)
    hide(actionButtons)
    e.target.blur()
})

clearButton.addEventListener('click', e => {
    initCryptogram()
    e.target.blur()
})

const initCryptogram = () => {

    empty(cryptogramSolution)
    hide(startCryptogram)
    show(actionButtons)
    show(alphabet, 'flex')
    alphabet.querySelectorAll('.alpha__letter').forEach(l => {
        l.classList.remove('used', 'error')
        l.dataset.count = 0
    })

    const text = cryptogramText.value.toUpperCase().split(' ')
    const crypto = text.map(t => {
        let letters = t.split('').map(l => {
            let input = l.match(/[A-Z]/) ? `<input class="solution__input" type="text" maxlength="2" data-puzzle="${l}">` : l
            return `<div class="flex flex--column"><div class="solution__item flex flex--ai-end flex--jc-center">${input}</div><div class="solution__puzzle">${l}</div></div>`
        })
        return `<div class="flex flex__item">${letters.join('')}</div>`
    })
    cryptogramSolution.classList.remove('solution--complete')
    cryptogramSolution.innerHTML = crypto.join('')

    const inputs = cryptogramSolution.querySelectorAll('.solution__input')
    inputs.forEach(i => {
        i.addEventListener('input', e => {
            const value = e.target.value.slice(-1).toUpperCase()
            const puzzle = e.target.dataset.puzzle
            const oldValue = e.target.dataset.oldValue
            if (value && (value === puzzle || !value.match(/[A-Z]/))) {
                e.target.value = ''
                return false
            }
            e.target.value = value
            inputs.forEach(i => {
                if (i.dataset.puzzle === puzzle) {
                    i.value = value
                    i.dataset.oldValue = value
                }
            })

            let alphaLetter
            console.log()
            if (value && value != oldValue) {
                alphaLetter = alphabet.querySelector(`[data-letter="${value}"]`)
                alphaLetter.dataset.count = parseInt(alphaLetter.dataset.count) + 1
                if (parseInt(alphaLetter.dataset.count) > 1) {
                    alphaLetter.classList.add('error')
                } else {
                    alphaLetter.classList.add('used')
                }
                if (oldValue) {
                    alphaLetter = alphabet.querySelector(`[data-letter="${oldValue}"]`)
                    alphaLetter.dataset.count = parseInt(alphaLetter.dataset.count) - 1
                    if (parseInt(alphaLetter.dataset.count) === 1) {
                        alphaLetter.classList.remove('error')
                    } else if (parseInt(alphaLetter.dataset.count) === 0) {
                        alphaLetter.classList.remove('used')
                    }
                }
            } else if (!value && oldValue) {
                alphaLetter = alphabet.querySelector(`[data-letter="${oldValue}"]`)
                alphaLetter.dataset.count = parseInt(alphaLetter.dataset.count) - 1
                if (parseInt(alphaLetter.dataset.count) === 1) {
                    alphaLetter.classList.remove('error')
                } else if (parseInt(alphaLetter.dataset.count) === 0) {
                    alphaLetter.classList.remove('used')
                }
            }
            e.target.dataset.oldValue = value

            let complete = true
            inputs.forEach(i => {
                if (!i.value && complete) {
                    complete = false
                }
            })
            cryptogramSolution.classList.toggle('solution--complete', complete)
        })

        i.addEventListener('focus', e => {
            inputs.forEach(i => {
                if (i.dataset.puzzle === e.target.dataset.puzzle) {
                    i.classList.add('active')
                }
            })
        })

        i.addEventListener('blur', e => {
            inputs.forEach(i => {
                if (i.dataset.puzzle === e.target.dataset.puzzle) {
                    i.classList.remove('active')
                }
            })
        })
    })
}

const show = (el, display = 'block') => {
    el.style.display = display
}
const hide = el => {
    el.style.display = 'none'
}
const empty = el => {
    el.innerHTML = ''
}