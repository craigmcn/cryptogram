import { deleteStore } from './store'

const registerServiceWorker = () => {
    // https://deanhume.com/displaying-a-new-version-available-progressive-web-app/
    let newWorker
    document.getElementById('reload').addEventListener('click', (e) => {
        e.preventDefault()
        newWorker.postMessage({ action: 'skipWaiting' })
        deleteStore()
        window.location.reload()
    })
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then((reg) => {
            reg.addEventListener('updatefound', () => {
                newWorker = reg.installing
                newWorker.addEventListener('statechange', () => {
                    switch (newWorker.state) {
                        case 'installed':
                            if (navigator.serviceWorker.controller) {
                                document
                                    .getElementById('notification')
                                    .removeAttribute('hidden')
                            }
                            break
                    }
                })
            })
        })
    }
}

export default registerServiceWorker
