import { defaultStore, setStore, getStore } from './store'
import { show, hide, empty } from './utilities'

const startCryptogram = document.getElementById('start-cryptogram')
const cryptogramText = document.getElementById('cryptogram-text')
const cryptogramSolution = document.getElementById('cryptogram-solution')
const alphabet = document.getElementById('alpha')
const actionButtons = document.getElementById('action-buttons')

const resetAlphabet = () => {
    const { letters } = getStore()
    alphabet.querySelectorAll('.alpha__letter').forEach((l) => {
        l.classList.remove('used', 'error')
        l.dataset.count = 0

        const usedCount = Object.values(letters).filter(
            v => v === l.dataset.letter,
        ).length
        updateCount(l, usedCount)
    })
}

const setActive = (e) => {
    cryptogramSolution
        .querySelectorAll('.solution__input')
        .forEach(el =>
            el.classList.toggle(
                'active',
                el.dataset.puzzle === e.target.dataset.puzzle,
            ),
        )
}

const setComplete = () => {
    let inputsComplete = true
    let alphabetComplete = true

    cryptogramSolution.querySelectorAll('.solution__input').forEach((i) => {
        if (!i.value && inputsComplete) {
            inputsComplete = false
        }
    })

    alphabet.querySelectorAll('.alpha__letter').forEach((l) => {
        if (l.dataset.count > 1 && alphabetComplete) {
            alphabetComplete = false
        }
    })

    cryptogramSolution.classList.toggle(
        'solution--complete',
        inputsComplete && alphabetComplete,
    )
}

const updateCount = (el, amount) => {
    const elCount = parseInt(el.dataset.count) + amount
    el.classList.toggle('used', elCount > 0)
    el.classList.toggle('error', elCount > 1)
    el.dataset.count = elCount
}

export const clear = () => {
    setStore({ letters: defaultStore.letters })
    initCryptogram()
}

export const clearRestart = () => {
    cryptogramText.value = ''
    setStore({ text: '', letters: defaultStore.letters })
    restart()
}

export const load = () => {
    const store = getStore()
    if (store.text !== '') initCryptogram()
}

export const restart = () => {
    empty(cryptogramSolution)
    hide(alphabet)
    hide(actionButtons)
    cryptogramText.value = getStore().text
    show(startCryptogram)
    document.activeElement.blur()
    cryptogramSolution.classList.toggle('solution--complete', false)
}

export const start = (e) => {
    e.preventDefault()
    const errorEl = cryptogramText.parentElement.querySelector(
        '.form__control-error',
    )
    hide(errorEl)
    if (cryptogramText.value) {
        setStore({ text: cryptogramText.value, letters: defaultStore.letters })
        initCryptogram()
    } else {
        show(errorEl)
    }
}

const initCryptogram = () => {
    empty(cryptogramSolution)
    hide(startCryptogram)
    show(actionButtons)
    show(alphabet)
    document.activeElement.blur()

    resetAlphabet()

    const { text, letters } = getStore()
    cryptogramSolution.innerHTML = text
        .toUpperCase()
        .split(' ')
        .map((t) => {
            const textLetters = t.split('').map((l) => {
                const value = letters[l]
                    ? ` value="${letters[l]}" data-old-value="${letters[l]}"`
                    : ''
                const input = l.match(/[A-Z]/)
                    ? `<input class="solution__input" type="text" maxlength="2"${value} data-puzzle="${l}">`
                    : l

                return `<div class="flex flex--column"><div class="solution__item flex flex--ai-end flex--jc-center">${input}</div><div class="solution__puzzle">${l}</div></div>`
            })
            return `<div class="flex flex__item">${textLetters.join('')}</div>`
        })
        .join('')
    setComplete()

    const inputs = cryptogramSolution.querySelectorAll('.solution__input')
    inputs.forEach((i) => {
        i.addEventListener('input', (e) => {
            const value = e.target.value.slice(-1).toUpperCase()
            const puzzle = e.target.dataset.puzzle
            const oldValue = e.target.dataset.oldValue
            if (value && (value === puzzle || !value.match(/[A-Z]/))) {
                e.target.value = ''
                setStore({ letters: { [puzzle]: '' } })
                return false
            }
            e.target.value = value
            inputs.forEach((i) => {
                if (i.dataset.puzzle === puzzle) {
                    i.value = value
                    i.dataset.oldValue = value
                    setStore({ letters: { [puzzle]: value } })
                }
            })

            if (value && value !== oldValue) {
                updateCount(alphabet.querySelector(`[data-letter="${value}"]`), 1)

                if (oldValue) {
                    updateCount(alphabet.querySelector(`[data-letter="${oldValue}"]`), -1)
                }
            } else if (!value && oldValue) {
                updateCount(alphabet.querySelector(`[data-letter="${oldValue}"]`), -1)
            }
            e.target.dataset.oldValue = value

            setComplete()
        })

        i.addEventListener('focus', setActive)
        i.addEventListener('blur', setActive)
    })
}
