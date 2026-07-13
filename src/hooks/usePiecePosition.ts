import { useFrame } from '@react-three/fiber'
import { ChessPosition } from '@/types/chess-position'
import { useState, useEffect, useCallback } from 'react'

type Position = {
    x: number
    z: number
}

export type UsePiecePositionOptions = {
    duration: number
}

const _options = {
    duration: 500,
}

export function usePiecePosition(
    chessPosition: ChessPosition,
    isPiece?: boolean,
    options = _options
): Position {
    const [position, setPosition] = useState<Position>({ x: 0, z: 0 })
    const [targetPosition, setTargetPosition] = useState<Position>({
        x: 0,
        z: 0,
    })
    const [diffPosition, setDiffPosition] = useState<Position | null>(null)

    useEffect(() => {
        const position = {
            x: chessPosition.file.charCodeAt(0) - 64 - 4,
            z: chessPosition.rank - 4,
        }
        setPosition(position)
        setTargetPosition(position)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!isPiece) return
        const targetX = chessPosition.file.charCodeAt(0) - 64 - 4
        const targetZ = chessPosition.rank - 4
        setTargetPosition({
            x: targetX,
            z: targetZ,
        })
        setDiffPosition({
            x: targetX - position.x,
            z: targetZ - position.z,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chessPosition])

    const changeNumberInDuration = useCallback(
        (number: number, targetNumber: number, delta: number, diff: number) => {
            if (Math.abs(targetNumber - number) < 0.1) return targetNumber
            const speed = (delta / options.duration) * 1000
            return number + diff * speed
        },
        [options]
    )

    useFrame((_, delta) => {
        if (position.x === targetPosition.x && position.z === targetPosition.z)
            return
        setPosition((prev) => ({
            x: changeNumberInDuration(
                prev.x,
                targetPosition.x,
                delta,
                diffPosition?.x || 0
            ),
            z: changeNumberInDuration(
                prev.z,
                targetPosition.z,
                delta,
                diffPosition?.z || 0
            ),
        }))
    })

    return position
}
