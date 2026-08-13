import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function Plant3DViewer({ 
  fallbackImage, 
  color = 0x2e7d32 
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Set up Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = null; // transparent

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Add Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Directional Light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create a stylized 3D plant (A stalk and some leaves)
    const plantGroup = new THREE.Group();

    // Stem
    const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 16);
    const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x4caf50 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = -0.5;
    plantGroup.add(stem);

    // Pot
    const potGeometry = new THREE.CylinderGeometry(0.6, 0.4, 1, 32);
    const potMaterial = new THREE.MeshPhongMaterial({ color: 0x8d6e63 });
    const pot = new THREE.Mesh(potGeometry, potMaterial);
    pot.position.y = -2;
    plantGroup.add(pot);

    // Dirt
    const dirtGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 32);
    const dirtMaterial = new THREE.MeshPhongMaterial({ color: 0x3e2723 });
    const dirt = new THREE.Mesh(dirtGeometry, dirtMaterial);
    dirt.position.y = -1.5;
    plantGroup.add(dirt);

    // Leaves
    const leafGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    leafGeometry.scale(1, 0.2, 0.5);
    const leafMaterial = new THREE.MeshPhongMaterial({ color, shininess: 30 });

    const createLeaf = (x, y, z, rotZ, rotY) => {
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      leaf.position.set(x, y, z);
      leaf.rotation.z = rotZ;
      leaf.rotation.y = rotY;
      return leaf;
    };

    plantGroup.add(createLeaf(0.5, 0, 0, Math.PI / 4, 0));
    plantGroup.add(createLeaf(-0.5, -0.3, 0, -Math.PI / 4, 0));
    plantGroup.add(createLeaf(0, 0.3, 0.5, 0, Math.PI / 4));
    plantGroup.add(createLeaf(0, -0.6, -0.5, 0, -Math.PI / 4));

    // Top leaf cluster
    const topLeaf = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), leafMaterial);
    topLeaf.position.y = 0.5;
    plantGroup.add(topLeaf);

    scene.add(plantGroup);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating and rotating
      plantGroup.rotation.y += 0.01;
      plantGroup.position.y = Math.sin(elapsedTime * 2) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      // Dispose Geometries and Materials
      stemGeometry.dispose();
      stemMaterial.dispose();
      potGeometry.dispose();
      potMaterial.dispose();
      dirtGeometry.dispose();
      dirtMaterial.dispose();
      leafGeometry.dispose();
      leafMaterial.dispose();
    };
  }, [color]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '350px', 
        position: 'relative',
        cursor: 'grab'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#2E7D32',
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        3D Preview
      </div>
    </div>
  );
}
