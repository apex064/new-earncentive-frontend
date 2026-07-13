import * as THREE from 'three'
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { PieceModelProps } from '../types/piece-model-props'

type GLTFResult = GLTF & {
    nodes: {
        Plane: THREE.Mesh
        Cone: THREE.Mesh
        Sphere: THREE.Mesh
        Sphere001: THREE.Mesh
    }
    materials: {
        ['Material.001']: THREE.MeshStandardMaterial
    }
}

export function Queen(props: PieceModelProps) {
    const { nodes, materials } = useGLTF('/models/queen.glb') as GLTFResult
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
                geometry={nodes.Cone.geometry}
                material={props.material}
                position={[0, 1.731, -0.423]}
                scale={0.128}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Sphere.geometry}
                material={props.material}
                position={[0, 1.63, 0]}
                scale={0.27}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Sphere001.geometry}
                material={props.material}
                position={[0, 2.001, 0]}
                scale={0.118}
            />
        </group>
    )
}

useGLTF.preload('/models/queen.glb')
