import { ChessPosition } from './chess-position'

export type Moves = {
    available: ChessPosition[]
    captures: ChessPosition[]
}
