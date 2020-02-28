export const STORAGEID = 'cryptogram'

export const defaultStore = {
    text: '',
    letters: {
        A: '',
        B: '',
        C: '',
        D: '',
        E: '',
        F: '',
        G: '',
        H: '',
        I: '',
        J: '',
        K: '',
        L: '',
        M: '',
        N: '',
        O: '',
        P: '',
        Q: '',
        R: '',
        S: '',
        T: '',
        U: '',
        V: '',
        W: '',
        X: '',
        Y: '',
        Z: '',
    },
}

export const getStore = () => {
    const store = window.localStorage.getItem(STORAGEID)
    if (store) return JSON.parse(store)
    return defaultStore
}

export const setStore = ({ text, letters }) => {
    const prevStore = getStore()
    const store = {
        ...prevStore,
        text: text || text === '' ? text : prevStore.text,
        letters: {
            ...prevStore.letters,
            ...letters,
        },
    }
    window.localStorage.setItem(STORAGEID, JSON.stringify(store))
}

export const deleteStore = () => {
    window.localStorage.removeItem(STORAGEID)
}
