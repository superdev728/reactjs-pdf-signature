import {useEffect, useLayoutEffect} from 'react'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
function useEsc(effect) {
    useIsomorphicLayoutEffect(() => {
        const callback = (e) => {
            console.log('key press')
            effect(e)
        }
        document.body.addEventListener('keypress', callback)
        return () => document.body.removeEventListener('keypress', callback)
    }, [])
}

export default useEsc