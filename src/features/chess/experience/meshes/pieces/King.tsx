import React, { useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { PieceModelProps } from '../types/piece-model-props'
import { GLTF } from 'three-stdlib'
import * as THREE from 'three'

type GLTFResult = GLTF & {
    nodes: {
        Plane: THREE.Mesh
        Cube: THREE.Mesh
    }
    materials: {
        ['Material.001']: THREE.MeshStandardMaterial
    }
}

export function King(props: PieceModelProps) {
    const { nodes, materials } = useGLTF('/models/king.glb') as GLTFResult

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
                position={[0, 0.434, 0]}
                scale={0.051}
            />
        </group>
    )
}

useGLTF.preload('/models/king.glb')
