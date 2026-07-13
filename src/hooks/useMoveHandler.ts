import { useCallback } from 'react'
import { Chess } from 'chess.js'
import type { Square } from 'chess.js'
import { GameActions } from './useGame'
import { PieceData } from '@/types/piece-data'
import { ChessPosition } from '@/types/chess-position'
import { playMoveSound } from '@/utils/soundUtils'

export type PromotionPiece = 'q' | 'r' | 'b' | 'n'

export function useMoveHandler(
    gameActions: GameActions,
    isVsBot: boolean,
    sendMove: (move: string) => boolean,
    currentFen: string
) {
    const handleMove = useCallback(
        (
            selectedPiece: PieceData,
            position: ChessPosition,
            promotion: PromotionPiece = 'q'
        ) => {
            const from = `${selectedPiece.file.toLowerCase()}${selectedPiece.rank}` as Square
            const to = `${position.file.toLowerCase()}${position.rank}` as Square

            const preview = new Chess(currentFen)
            const pieceOnBoard = preview.get(from)
            if (
                !pieceOnBoard ||
                pieceOnBoard.color !== (selectedPiece.rival === 'white' ? 'w' : 'b')
            ) {
                return
            }

            const needsPromotion =
                pieceOnBoard.type === 'p' && (to[1] === '8' || to[1] === '1')

            const attempted = preview.move({
                from,
                to,
                ...(needsPromotion ? { promotion } : {}),
            })
            if (!attempted) return

            // Play sound based on whether it's a capture
            const isCapture = attempted.captured !== undefined
            playMoveSound(isCapture)

            const uci = `${attempted.from}${attempted.to}${attempted.promotion ?? ''}`

            const moveSent = sendMove(uci)

            if (!moveSent) {
                const result = needsPromotion
                    ? gameActions.movePiece(selectedPiece, position, promotion)
                    : gameActions.movePiece(selectedPiece, position)
                if (result.valid && isVsBot) {
                    setTimeout(() => gameActions.makeBotMove(), 800)
                }
            }
        },
        [gameActions, isVsBot, sendMove, currentFen]
    )

    return { handleMove }
}
