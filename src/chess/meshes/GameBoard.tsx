import { ChessRank } from '@/types/chess-rank'
import { SquareCell } from './SquareCell'
import { ChessFile } from '@/types/chess-file'
import { ChessPosition } from '@/types/chess-position'
import { Moves } from '@/types/moves'

type GameBoardProps = {
    moves?: Moves
    movePiece: (position: ChessPosition) => void
    lastMove?: {
        from: { file: string; rank: number }
        to: { file: string; rank: number }
    }
}

const FILES: ChessFile[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export function GameBoard({ moves, movePiece, lastMove }: GameBoardProps) {
    const board = Array.from({ length: 8 }, () => [...FILES]) as ChessFile[][]

    return (
        <>
            {board.map((files, rowIndex) => {
                const rank = (rowIndex + 1) as ChessRank
                return files.map((file, fileIndex) => {
                    const isAvailableMove = (moves?.available ?? []).some(
                        (move) => move.rank === rank && move.file === file
                    )
                    const isCaptureMove = (moves?.captures ?? []).some(
                        (move) => move.rank === rank && move.file === file
                    )

                    const isLastMoveFrom = lastMove?.from.file === file && lastMove?.from.rank === rank
                    const isLastMoveTo = lastMove?.to.file === file && lastMove?.to.rank === rank

                    function onClick() {
                        if (isAvailableMove || isCaptureMove) {
                            movePiece({ rank, file })
                        }
                    }

                    return (
                        <SquareCell
                            isAvailableMove={isAvailableMove}
                            isCaptureMove={isCaptureMove}
                            isLastMoveFrom={isLastMoveFrom}
                            isLastMoveTo={isLastMoveTo}
                            key={`${file}-${rank}`}
                            file={file as ChessFile}
                            rank={rank as ChessRank}
                            onClick={onClick}
                        />
                    )
                })
            })}
        </>
    )
}
