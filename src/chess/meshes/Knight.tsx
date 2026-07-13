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

export function Knight(props: PieceModelProps) {
    const { nodes, materials } = useGLTF('/models/knight.glb') as GLTFResult
    return (
        <group {...props} dispose={null}>
            <group rotation={[0, Math.PI, 0]}>
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
                    position={[0, -0.719, -0.31]}
                    scale={0.686}
                />
            </group>
        </group>
    )
}

useGLTF.preload('/models/knight.glb')
