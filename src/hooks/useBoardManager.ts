import { useEffect, useRef } from 'react'
import { useGame, GameActions } from './useGame'

export function useBoardManager(gameActions: GameActions, mounted: boolean) {
    const hasStartedLocalGame = useRef(false)
    const initAttempts = useRef(0)

    useEffect(() => {
        console.log('🎮 useBoardManager - mounted:', mounted, 'hasStarted:', hasStartedLocalGame.current)
        
        // Immediate start - don't wait for mounted
        if (!hasStartedLocalGame.current) {
            console.log('🎮 Starting local game immediately...')
            gameActions.startGame()
            hasStartedLocalGame.current = true
        }
        
        // Also start when mounted becomes true (fallback)
        if (mounted && !hasStartedLocalGame.current) {
            console.log('🎮 Starting local game from mounted...')
            hasStartedLocalGame.current = true
            gameActions.startGame()
        }
        
        // Extra fallback: if after 2 seconds board is still not initialized
        const fallbackTimer = setTimeout(() => {
            if (!hasStartedLocalGame.current) {
                console.log('🎮 Fallback: Force starting game after timeout')
                gameActions.startGame()
                hasStartedLocalGame.current = true
            }
        }, 2000)
        
        return () => clearTimeout(fallbackTimer)
    }, [mounted, gameActions])

    const manualRenderBoard = () => {
        console.log('🔄 Manual board render triggered')
        gameActions.startGame()
        hasStartedLocalGame.current = true
    }

    return { manualRenderBoard }
}
