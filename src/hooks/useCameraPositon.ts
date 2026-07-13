import { useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useState } from 'react'
import { Rival } from '@/types/rival'
import { GameStatus } from '@/types/game-status'

type Position = {
    x: number
    y: number
    z: number
}

type CameraPosition = {
    white: Position
    black: Position
}

const _option = {
    duration: 500,
    coilRatio: 0.1,
}

export function useCameraPosition(status: GameStatus) {
    const { camera } = useThree()
    const [distance, setDistance] = useState<number>(0)
    const [cameraPosition, setCameraPosition] = useState<CameraPosition>({
        white: {
            x: -8,
            y: 8,
            z: -8,
        },
        black: {
            x: 8,
            y: 8,
            z: 8,
        },
    })

    const updateDistance = useCallback((first: Position, second: Position) => {
        const x = first.x - second.x
        const y = first.y - second.y
        const z = first.z - second.z
        setDistance(Math.sqrt(x * x + y * y + z * z))
    }, [])

    const coilPosition = useCallback((position: Position, target: Position) => {
        const resultX = Math.abs(position.x - target.x)
        const resultY = Math.abs(position.y - target.y)
        const resultZ = Math.abs(position.z - target.z)
        if (
            resultX < _option.coilRatio &&
            resultY < _option.coilRatio &&
            resultZ < _option.coilRatio
        ) {
            setDistance(0)
            return target
        }
        return position
    }, [])

    const changeCameraPosition = useCallback(
        (delta: number, first: Position, second: Position) => {
            const stepRatio = delta * _option.duration * 10 // how many steps per second
            const stepDistance = distance / stepRatio // The distance to move per step
            const directionVector: Position = {
                x: second.x - first.x,
                y: second.y - first.y,
                z: second.z - first.z,
            } // direction vector from first to second
            const directionDistance = Math.sqrt(
                directionVector.x * directionVector.x +
                    directionVector.y * directionVector.y +
                    directionVector.z * directionVector.z
            ) // Normalize Direction Vector to get Unit Vector
            const directionUnitVector: Position = {
                x: directionVector.x / directionDistance,
                y: directionVector.y / directionDistance,
                z: directionVector.z / directionDistance,
            } // The added distance for unit vector

            const addedDistance: Position = {
                x: directionUnitVector.x * stepDistance,
                y: directionUnitVector.y * stepDistance,
                z: directionUnitVector.z * stepDistance,
            } // Update the position of the camera

            const newPosition: Position = {
                x: first.x + addedDistance.x,
                y: first.y + addedDistance.y,
                z: first.z + addedDistance.z,
            }

            const coiledPosition = coilPosition(newPosition, second)

            camera.position.set(
                coiledPosition.x,
                coiledPosition.y,
                coiledPosition.z
            )
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [distance]
    )

    const onTurnChange = useCallback(
        (rival: Rival) => {
            const secondRival = rival === 'white' ? 'black' : 'white'
            const x = camera.position.x
            const y = camera.position.y
            const z = camera.position.z
            setCameraPosition((prev) => ({
                ...prev,
                [secondRival]: { x, y, z },
            }))
            updateDistance(camera.position, cameraPosition[rival])
        },
        [camera.position, cameraPosition, updateDistance]
    )

    useEffect(() => {
        if (
            status.turn === 'white' &&
            status.white.pieces.every((piece) => !piece.isMoved)
        ) {
            camera.position.set(
                cameraPosition.white.x,
                cameraPosition.white.y,
                cameraPosition.white.z
            )
            return
        }
        onTurnChange(status.turn)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status])

    useFrame((_, delta) => {
        if (distance === 0) return
        const rival = status.turn
        const first = camera.position
        const second = cameraPosition[rival]
        changeCameraPosition(delta, first, second)
    })
}
