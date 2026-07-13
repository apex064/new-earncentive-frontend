import * as THREE from 'three'
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { PieceModelProps } from '@/types/piece-model-props'

type GLTFResult = GLTF & {
    nodes: {
        Plane: THREE.Mesh
    }
    materials: {
        ['Material.001']: THREE.MeshStandardMaterial
    }
}

export function Pawn(props: PieceModelProps) {
    const { nodes, materials } = useGLTF('/models/pawn.glb') as GLTFResult
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Plane.geometry}
                material={props.material}
                rotation={[0, 0, -Math.PI / 2]}
            />
        </group>
    )
}

useGLTF.preload('/models/pawn.glb')
