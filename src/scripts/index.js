import registerServiceWorker from './serviceWorker'
import { clear, clearRestart, load, restart, start } from './actions'

registerServiceWorker()

document.getElementById('enter-cryptogram').addEventListener('submit', start)
document.getElementById('clear-button').addEventListener('click', clear)

document.getElementById('edit-button').addEventListener('click', restart)
document.getElementById('new-button').addEventListener('click', clearRestart)

load()
