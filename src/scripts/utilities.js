export const show = el => {
    el.removeAttribute('hidden')
}

export const hide = el => {
    el.setAttribute('hidden', true)
}

export const empty = el => {
    el.innerHTML = ''
}
