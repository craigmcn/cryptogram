import { describe, it, expect, beforeEach } from 'vitest'
import { clear, clearRestart, load, restart, start } from './actions'
import { defaultStore, getStore, setStore } from './store'

// ─── DOM helpers ─────────────────────────────────────────────────────────────

const el = (id) => document.getElementById(id)

const resetDOM = () => {
  localStorage.clear()

  el('cryptogram-text').value = ''
  el('cryptogram-solution').innerHTML = ''
  el('cryptogram-solution').classList.remove('solution--complete')

  el('start-cryptogram').removeAttribute('hidden')
  el('alpha').setAttribute('hidden', '')
  el('action-buttons').setAttribute('hidden', '')

  el('alpha')
    .querySelectorAll('.alpha__letter')
    .forEach((l) => {
      l.classList.remove('used', 'error')
      l.dataset.count = 0
    })

  el('cryptogram-text')
    .parentElement.querySelector('.form__control-error')
    .setAttribute('hidden', '')
}

// Call start() directly with a mock event (no index.js listener needed).
const submitPuzzle = (text) => {
  el('cryptogram-text').value = text
  start({ preventDefault: () => {} })
}

// Dispatch an input event on an element with a given value.
const typeInto = (inputEl, value) => {
  inputEl.value = value
  inputEl.dispatchEvent(new Event('input', { bubbles: true }))
}

// Return the first solution input for a given puzzle letter.
const inputFor = (letter) =>
  el('cryptogram-solution').querySelector(`[data-puzzle="${letter}"]`)

// Return all solution inputs for a given puzzle letter.
const inputsFor = (letter) =>
  el('cryptogram-solution').querySelectorAll(`[data-puzzle="${letter}"]`)

// Return the alphabet tile for a given letter.
const alphaTile = (letter) =>
  el('alpha').querySelector(`[data-letter="${letter}"]`)

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('actions', () => {
  beforeEach(resetDOM)

  // ── start ──────────────────────────────────────────────────────────────────

  describe('start()', () => {
    it('shows the error element when textarea is empty', () => {
      submitPuzzle('')
      const errorEl = el('cryptogram-text').parentElement.querySelector(
        '.form__control-error'
      )
      expect(errorEl.hasAttribute('hidden')).toBe(false)
    })

    it('hides a previously shown error on next submit', () => {
      submitPuzzle('')
      submitPuzzle('ABC')
      const errorEl = el('cryptogram-text').parentElement.querySelector(
        '.form__control-error'
      )
      expect(errorEl.hasAttribute('hidden')).toBe(true)
    })

    it('saves the text to the store', () => {
      submitPuzzle('HELLO')
      expect(getStore().text).toBe('HELLO')
    })

    it('resets letters to default on new puzzle', () => {
      setStore({ letters: { A: 'B' } })
      submitPuzzle('ABC')
      expect(getStore().letters.A).toBe('')
    })

    it('hides the start form', () => {
      submitPuzzle('ABC')
      expect(el('start-cryptogram').hasAttribute('hidden')).toBe(true)
    })

    it('shows action buttons and alphabet', () => {
      submitPuzzle('ABC')
      expect(el('action-buttons').hasAttribute('hidden')).toBe(false)
      expect(el('alpha').hasAttribute('hidden')).toBe(false)
    })

    it('renders an input for each letter in the puzzle', () => {
      submitPuzzle('ABC')
      expect(
        el('cryptogram-solution').querySelectorAll('.solution__input')
      ).toHaveLength(3)
    })

    it('renders non-letter characters as plain text nodes', () => {
      submitPuzzle('A,B')
      const inputs = el('cryptogram-solution').querySelectorAll(
        '.solution__input'
      )
      expect(inputs).toHaveLength(2)
      expect(el('cryptogram-solution').innerHTML).toContain(',')
    })

    it('escapes HTML special characters in non-letter positions', () => {
      submitPuzzle('A<B')
      expect(el('cryptogram-solution').innerHTML).toContain('&lt;')
      expect(el('cryptogram-solution').innerHTML).not.toContain('<B')
    })

    it('uppercases the puzzle text', () => {
      submitPuzzle('abc')
      expect(inputFor('A')).not.toBeNull()
    })

    it('pre-fills inputs from letters already in the store', () => {
      // load() calls initCryptogram() without resetting letters;
      // start() always resets letters (new puzzle), so use load() here.
      setStore({ text: 'ABC', letters: { ...defaultStore.letters, A: 'X' } })
      load()
      expect(inputFor('A').value).toBe('X')
    })
  })

  // ── restart ────────────────────────────────────────────────────────────────

  describe('restart()', () => {
    beforeEach(() => submitPuzzle('ABC'))

    it('empties the solution grid', () => {
      restart()
      expect(el('cryptogram-solution').innerHTML).toBe('')
    })

    it('hides alphabet and action buttons', () => {
      restart()
      expect(el('alpha').hasAttribute('hidden')).toBe(true)
      expect(el('action-buttons').hasAttribute('hidden')).toBe(true)
    })

    it('shows the start form', () => {
      restart()
      expect(el('start-cryptogram').hasAttribute('hidden')).toBe(false)
    })

    it('restores the textarea with the stored text', () => {
      el('cryptogram-text').value = ''
      restart()
      expect(el('cryptogram-text').value).toBe('ABC')
    })

    it('removes the solution--complete class', () => {
      el('cryptogram-solution').classList.add('solution--complete')
      restart()
      expect(
        el('cryptogram-solution').classList.contains('solution--complete')
      ).toBe(false)
    })
  })

  // ── clearRestart ───────────────────────────────────────────────────────────

  describe('clearRestart()', () => {
    beforeEach(() => submitPuzzle('ABC'))

    it('clears the textarea', () => {
      clearRestart()
      expect(el('cryptogram-text').value).toBe('')
    })

    it('resets stored text to empty', () => {
      clearRestart()
      expect(getStore().text).toBe('')
    })

    it('resets stored letters to default', () => {
      setStore({ letters: { A: 'X' } })
      clearRestart()
      expect(getStore().letters.A).toBe('')
    })

    it('shows the start form', () => {
      clearRestart()
      expect(el('start-cryptogram').hasAttribute('hidden')).toBe(false)
    })
  })

  // ── clear ──────────────────────────────────────────────────────────────────

  describe('clear()', () => {
    beforeEach(() => {
      submitPuzzle('ABC')
      setStore({ letters: { A: 'X', B: 'Y' } })
    })

    it('resets all letters to empty in the store', () => {
      clear()
      const { letters } = getStore()
      expect(Object.values(letters).every((v) => v === '')).toBe(true)
    })

    it('clears all input values in the solution grid', () => {
      clear()
      el('cryptogram-solution')
        .querySelectorAll('.solution__input')
        .forEach((i) => {
          expect(i.value).toBe('')
        })
    })

    it('removes used/error classes from alphabet tiles', () => {
      alphaTile('X').classList.add('used')
      clear()
      expect(alphaTile('X').classList.contains('used')).toBe(false)
    })
  })

  // ── load ───────────────────────────────────────────────────────────────────

  describe('load()', () => {
    it('does nothing when the store is empty', () => {
      load()
      expect(el('start-cryptogram').hasAttribute('hidden')).toBe(false)
      expect(el('cryptogram-solution').innerHTML).toBe('')
    })

    it('initialises the cryptogram when the store has text', () => {
      setStore({ text: 'XYZ' })
      load()
      expect(el('start-cryptogram').hasAttribute('hidden')).toBe(true)
      expect(
        el('cryptogram-solution').querySelectorAll('.solution__input')
      ).toHaveLength(3)
    })
  })

  // ── input event handler ────────────────────────────────────────────────────

  describe('input event handler', () => {
    beforeEach(() => submitPuzzle('ABC'))

    it('sets the input value and stores the letter', () => {
      typeInto(inputFor('A'), 'X')
      expect(inputFor('A').value).toBe('X')
      expect(getStore().letters.A).toBe('X')
    })

    it('upcases the entered letter', () => {
      typeInto(inputFor('A'), 'x')
      expect(inputFor('A').value).toBe('X')
    })

    it('takes only the last character when multiple are entered', () => {
      typeInto(inputFor('A'), 'XY')
      expect(inputFor('A').value).toBe('Y')
    })

    it('updates all inputs sharing the same puzzle letter', () => {
      submitPuzzle('ABA')
      typeInto(inputsFor('A')[0], 'X')
      inputsFor('A').forEach((i) => expect(i.value).toBe('X'))
    })

    it('rejects input matching the puzzle letter', () => {
      typeInto(inputFor('A'), 'A')
      expect(inputFor('A').value).toBe('')
      expect(getStore().letters.A).toBe('')
    })

    it('rejects non-alpha input', () => {
      typeInto(inputFor('A'), '1')
      expect(inputFor('A').value).toBe('')
    })

    it('marks the alphabet tile as used when a letter is entered', () => {
      typeInto(inputFor('A'), 'X')
      expect(alphaTile('X').classList.contains('used')).toBe(true)
      expect(alphaTile('X').dataset.count).toBe('1')
    })

    it('marks the alphabet tile as error when letter is used twice', () => {
      typeInto(inputFor('A'), 'X')
      typeInto(inputFor('B'), 'X')
      expect(alphaTile('X').classList.contains('error')).toBe(true)
      expect(alphaTile('X').dataset.count).toBe('2')
    })

    it('decrements the old tile count when changing to a new letter', () => {
      typeInto(inputFor('A'), 'X')
      typeInto(inputFor('A'), 'Y')
      expect(alphaTile('X').dataset.count).toBe('0')
      expect(alphaTile('X').classList.contains('used')).toBe(false)
      expect(alphaTile('Y').dataset.count).toBe('1')
    })

    it('decrements the tile count when clearing a value', () => {
      typeInto(inputFor('A'), 'X')
      typeInto(inputFor('A'), '')
      expect(alphaTile('X').dataset.count).toBe('0')
      expect(alphaTile('X').classList.contains('used')).toBe(false)
    })

    it('does not change counts when clearing an already-empty input', () => {
      typeInto(inputFor('A'), '')
      expect(alphaTile('A').dataset.count).toBe('0')
    })

    it('adds solution--complete when all inputs filled with unique letters', () => {
      typeInto(inputFor('A'), 'X')
      typeInto(inputFor('B'), 'Y')
      typeInto(inputFor('C'), 'Z')
      expect(
        el('cryptogram-solution').classList.contains('solution--complete')
      ).toBe(true)
    })

    it('removes solution--complete when a duplicate letter is used', () => {
      typeInto(inputFor('A'), 'X')
      typeInto(inputFor('B'), 'Y')
      typeInto(inputFor('C'), 'Z')
      typeInto(inputFor('B'), 'X')
      expect(
        el('cryptogram-solution').classList.contains('solution--complete')
      ).toBe(false)
    })

    it('removes solution--complete when an input is cleared', () => {
      typeInto(inputFor('A'), 'X')
      typeInto(inputFor('B'), 'Y')
      typeInto(inputFor('C'), 'Z')
      typeInto(inputFor('A'), '')
      expect(
        el('cryptogram-solution').classList.contains('solution--complete')
      ).toBe(false)
    })
  })

  // ── setActive (focus / blur) ───────────────────────────────────────────────

  describe('setActive (focus/blur)', () => {
    beforeEach(() => submitPuzzle('ABA'))

    it('adds active class to all inputs sharing the focused puzzle letter', () => {
      inputsFor('A')[0].dispatchEvent(
        new FocusEvent('focus', { bubbles: true })
      )
      inputsFor('A').forEach((i) =>
        expect(i.classList.contains('active')).toBe(true)
      )
    })

    it('removes active class from inputs with a different puzzle letter', () => {
      inputsFor('A')[0].dispatchEvent(
        new FocusEvent('focus', { bubbles: true })
      )
      expect(inputFor('B').classList.contains('active')).toBe(false)
    })

    it('updates active class correctly when focus moves to a different letter', () => {
      inputsFor('A')[0].dispatchEvent(
        new FocusEvent('focus', { bubbles: true })
      )
      inputFor('B').dispatchEvent(new FocusEvent('focus', { bubbles: true }))
      inputsFor('A').forEach((i) =>
        expect(i.classList.contains('active')).toBe(false)
      )
      expect(inputFor('B').classList.contains('active')).toBe(true)
    })
  })

  // ── resetAlphabet ──────────────────────────────────────────────────────────

  describe('resetAlphabet (via clear)', () => {
    it('reflects pre-existing store letter assignments on re-render', () => {
      setStore({ text: 'AB', letters: { ...defaultStore.letters, A: 'X' } })
      load()
      expect(alphaTile('X').classList.contains('used')).toBe(true)
      expect(alphaTile('X').dataset.count).toBe('1')
    })

    it('marks error when the same solution letter appears more than once in store', () => {
      setStore({
        text: 'AB',
        letters: { ...defaultStore.letters, A: 'X', B: 'X' }
      })
      load()
      expect(alphaTile('X').classList.contains('error')).toBe(true)
      expect(alphaTile('X').dataset.count).toBe('2')
    })
  })
})
