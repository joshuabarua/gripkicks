import React, { useRef } from 'react'
import { useGLTF, Text, MeshTransmissionMaterial } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'

export default function ShoeModel() {
    const { nodes, materials } = useGLTF('/shoe.glb')
    const { viewport } = useThree();

    const mesh = useRef<any>(null);

    useFrame(() => {
        if (mesh.current) {
            mesh.current.rotation.y += 0.01;
            mesh.current.rotation.x += 0.01;
        }
    });

    const materialProps = useControls({
        thickness: { value: 0.2, min: 0, max: 3, step: 0.05 },
        roughness: { value: 0, min: 0, max: 1, step: 0.1 },
        transmissions: { value: 1, min: 0, max: 1, step: 0.1 },
        ior: { value: 1.2, min: 0, max: 3, step: 0.1 },
        chromaticAberration: { value: 0.02, min: 0, max: 1 },
        backside: { value: true }
    });

    return (
        <group dispose={null} scale={viewport.width / 3.5}>
            <Text fontSize={0.5} position={[0, 0, -0.4]}>GripKicks</Text>
            <mesh ref={mesh}
                {...nodes.CimbingShoe}
                castShadow
                receiveShadow
                material={materials.ClimbingShoe}
                position={[0.1, 0.1, 0.1]}>
                <MeshTransmissionMaterial {...materialProps} />
            </mesh>
        </group>
    )
}

useGLTF.preload('/shoe.glb')
