import { GameSituation } from './game-situation'
import { Rival } from './rival'
import { RivalStatus } from './rival-status'

export type GameStatus = {
    turn: Rival
    black: RivalStatus
    white: RivalStatus
    situation: GameSituation
    /** Full FEN; legal moves and backend sync must use this as source of truth */
    fen: string
    /** Pieces captured by white */
    capturedByWhite: PieceStatus[]
    /** Pieces captured by black */
    capturedByBlack: PieceStatus[]
    /** Last move made (for highlighting) */
    lastMove?: {
        from: { file: string; rank: number }
        to: { file: string; rank: number }
    }
}
