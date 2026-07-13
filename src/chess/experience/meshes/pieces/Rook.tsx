import * as THREE from 'three'
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { PieceModelProps } from '@/types/piece-model-props'

type GLTFResult = GLTF & {
    nodes: {
        Plane: THREE.Mesh
        Cube: THREE.Mesh
    }
    materials: {
        ['Material.001']: THREE.MeshStandardMaterial
    }
}

export function Rook(props: PieceModelProps) {
    const { nodes, materials } = useGLTF('/models/rook.glb') as GLTFResult
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Plane.geometry}
                material={props.material}
                rotation={[0, 0, -Math.PI / 2]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube.geometry}
                material={props.material}
                position={[0, 1.889, -0.956]}
                scale={[0.122, 0.129, 0.147]}
            />
        </group>
    )
}

useGLTF.preload('/models/rook.glb')
