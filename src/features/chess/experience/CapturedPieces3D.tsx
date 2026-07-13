// CapturedPieces3D.tsx
import React from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

import { King } from './meshes/pieces/King'
import { Queen } from './meshes/pieces/Queen'
import { Bishop } from './meshes/pieces/Bishop'
import { Knight } from './meshes/pieces/Knight'
import { Rook } from './meshes/pieces/Rook'
import { Pawn } from './meshes/pieces/Pawn'

import { PieceStatus } from '../types/piece-status'

type CapturedPieces3DProps = {
    pieces: PieceStatus[]
    rival: 'white' | 'black'
    myColor: 'white' | 'black'
}

// Map piece type to component
const PieceComponents = {
    king: King,
    queen: Queen,
    bishop: Bishop,
    knight: Knight,
    rook: Rook,
    pawn: Pawn,
}

// Smaller captured-piece sizing
const getPieceStats = () => {
    return {
        positionY: 0.08,
        scale: 0.2,
    }
}

// Create material matching your Piece component styling
const getPieceMaterial = (rival: 'white' | 'black') => {
    if (rival === 'black') {
        return new THREE.MeshStandardMaterial({
            color: '#374151',
            metalness: 0.85,
            roughness: 0.25,
            emissive: '#4c1d95',
            emissiveIntensity: 0.08,
        })
    }

    return new THREE.MeshStandardMaterial({
        color: '#f3f4f6',
        metalness: 0.9,
        roughness: 0.2,
        emissive: '#8b5cf6',
        emissiveIntensity: 0.1,
    })
}

export function CapturedPieces3D({
    pieces,
    rival,
    myColor,
}: CapturedPieces3DProps) {

    const getPosition = (index: number, total: number) => {

        // Better spacing for small pieces
        const spacing = total > 8 ? 0.28 : 0.38

        // Center all pieces
        const startX = -((total - 1) * spacing) / 2

        const isMyCapture = rival !== myColor

        // Platform top
        const platformTopY = 0.04

        const zPos = isMyCapture
            ? (myColor === 'white' ? -4.8 : 4.8)
            : (myColor === 'white' ? 4.8 : -4.8)

        return {
            x: startX + (index * spacing),
            y: platformTopY,
            z: zPos,
        }
    }

    const getPlatformInfo = () => {

        const isMyCapture = rival !== myColor

        const totalPieces = pieces.length

        const platformWidth = Math.max(
            2.8,
            totalPieces * 0.6
        )

        if (isMyCapture) {
            return {
                position: myColor === 'white'
                    ? { x: 0, y: -0.12, z: -4.8 }
                    : { x: 0, y: -0.12, z: 4.8 },

                width: platformWidth,
                height: 0.05,
                depth: 0.55,
            }
        }

        return {
            position: myColor === 'white'
                ? { x: 0, y: -0.12, z: 4.8 }
                : { x: 0, y: -0.12, z: -4.8 },

            width: platformWidth,
            height: 0.05,
            depth: 0.55,
        }
    }

    const getLabelInfo = () => {

        const isMyCapture = rival !== myColor

        if (isMyCapture) {
            return {
                text: `✓ Captured (${pieces.length})`,
                position: myColor === 'white'
                    ? { x: 0, y: 0.28, z: -4.8 }
                    : { x: 0, y: 0.28, z: 4.8 },

                color: '#22c55e'
            }
        }

        return {
            text: `✗ Lost (${pieces.length})`,
            position: myColor === 'white'
                ? { x: 0, y: 0.28, z: 4.8 }
                : { x: 0, y: 0.28, z: -4.8 },

            color: '#ef4444'
        }
    }

    if (pieces.length === 0) return null

    const platformInfo = getPlatformInfo()
    const labelInfo = getLabelInfo()

    // Platform materials matching board aesthetic
    const platformMaterial = new THREE.MeshStandardMaterial({
        color: '#1a1a2e',
        metalness: 0.7,
        roughness: 0.3,
        emissive: '#16213e',
        emissiveIntensity: 0.1,
    })

    const borderMaterial = new THREE.MeshStandardMaterial({
        color: '#4a18a8',
        metalness: 0.9,
        roughness: 0.2,
        emissive: '#2e1065',
        emissiveIntensity: 0.1,
    })

    return (
        <group>

            {/* Main Platform Base */}
            <mesh
                position={[
                    platformInfo.position.x,
                    platformInfo.position.y,
                    platformInfo.position.z
                ]}
                receiveShadow
                castShadow
            >
                <boxGeometry
                    args={[
                        platformInfo.width,
                        platformInfo.height,
                        platformInfo.depth
                    ]}
                />

                <primitive
                    object={platformMaterial}
                    attach="material"
                />
            </mesh>

            {/* Platform Border */}
            <mesh
                position={[
                    platformInfo.position.x,
                    platformInfo.position.y + 0.03,
                    platformInfo.position.z
                ]}
                receiveShadow
            >
                <boxGeometry
                    args={[
                        platformInfo.width + 0.08,
                        0.02,
                        platformInfo.depth + 0.08
                    ]}
                />

                <primitive
                    object={borderMaterial}
                    attach="material"
                />
            </mesh>

            {/* Label */}
            <Html
                position={[
                    labelInfo.position.x,
                    labelInfo.position.y,
                    labelInfo.position.z
                ]}
                center
            >
                <div
                    style={{
                        background: `${labelInfo.color}15`,
                        color: labelInfo.color,
                        padding: '2px 10px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${labelInfo.color}`,
                        fontFamily: 'monospace',
                    }}
                >
                    {labelInfo.text}
                </div>
            </Html>

            {/* Captured Pieces */}
            {pieces.map((piece, index) => {

                const pos = getPosition(index, pieces.length)

                const PieceComponent =
                    PieceComponents[
                        piece.type as keyof typeof PieceComponents
                    ]

                if (!PieceComponent) return null

                const stats = getPieceStats()

                const material = getPieceMaterial(rival)

                const rotationY =
                    rival === 'black'
                        ? Math.PI
                        : 0

                // slight natural variation
                const randomTilt =
                    (index % 2 === 0 ? 1 : -1) * 0.08

                const pieceProps = {
                    position: [
                        pos.x,
                        pos.y + stats.positionY,
                        pos.z,
                    ],

                    scale: stats.scale,

                    rotation: [
                        0,
                        rotationY + randomTilt,
                        0,
                    ],

                    material,

                    onClick: () => {},

                    onPointerOver: () => {},

                    onPointerOut: () => {},
                }

                return (
                    <PieceComponent
                        key={`${piece.type}-${index}`}
                        {...pieceProps}
                    />
                )
            })}
        </group>
    )
}
