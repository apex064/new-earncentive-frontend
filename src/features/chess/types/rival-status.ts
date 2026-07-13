import { ChessFile } from './chess-file'
import { ChessRank } from './chess-rank'
import { Piece } from './piece'
import { PieceStatus } from './piece-status'

export type RivalStatus = {
    pieces: Array<PieceStatus>
}
