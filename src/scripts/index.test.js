import { vi, describe, it, expect, beforeAll } from 'vitest'

// Mock actions before index.js is imported so that module-level
// calls (load()) and event-listener callbacks use the mock versions.
vi.mock('./actions', () => ({
  clear: vi.fn(),
  clearRestart: vi.fn(),
  load: vi.fn(),
  restart: vi.fn(),
  start: vi.fn()
}))

describe('index', () => {
  let actions

  beforeAll(async () => {
    actions = await import('./actions')
    await import('./index')
  })

  it('calls load() on initialisation', () => {
    expect(actions.load).toHaveBeenCalledOnce()
  })

  it('binds start() to the form submit event', () => {
    document
      .getElementById('enter-cryptogram')
      .dispatchEvent(new Event('submit'))
    expect(actions.start).toHaveBeenCalledOnce()
  })

  it('binds restart() to the edit button click', () => {
    document.getElementById('edit-button').dispatchEvent(new Event('click'))
    expect(actions.restart).toHaveBeenCalledOnce()
  })

  it('binds clear() to the clear button click', () => {
    document.getElementById('clear-button').dispatchEvent(new Event('click'))
    expect(actions.clear).toHaveBeenCalledOnce()
  })

  it('binds clearRestart() to the new button click', () => {
    document.getElementById('new-button').dispatchEvent(new Event('click'))
    expect(actions.clearRestart).toHaveBeenCalledOnce()
  })
})
