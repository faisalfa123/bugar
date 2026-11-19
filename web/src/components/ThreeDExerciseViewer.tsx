import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Eye, ZoomIn, ZoomOut, Compass, Play, Pause } from 'lucide-react';
import { ExerciseGuide } from '../data/exerciseGuides';
import { t } from '../data/i18n';

interface ThreeDExerciseViewerProps {
  guide: ExerciseGuide;
}

export const ThreeDExerciseViewer: React.FC<ThreeDExerciseViewerProps> = ({ guide }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<0.5 | 1 | 1.5>(1);
  const [cameraView, setCameraView] = useState<'iso' | 'front' | 'side' | 'top'>('iso');
  const [jointAngle, setJointAngle] = useState(170);
  const [currentPhase, setCurrentPhase] = useState('Turun (Eksentrik)');

  // Refs for animation & Three.js objects
  const stateRef = useRef({
    isPlaying: true,
    speed: 1,
    cameraView: 'iso',
    orbitAngleX: 0.4,
    orbitAngleY: 0.5,
    cameraDist: 3.6,
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    t: 0,
  });

  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
    stateRef.current.speed = speed;
  }, [isPlaying, speed]);

  const setCameraPreset = (view: 'iso' | 'front' | 'side' | 'top') => {
    setCameraView(view);
    stateRef.current.cameraView = view;
    if (view === 'front') {
      stateRef.current.orbitAngleX = 0;
      stateRef.current.orbitAngleY = 0.05;
      stateRef.current.cameraDist = 3.2;
    } else if (view === 'side') {
      stateRef.current.orbitAngleX = Math.PI / 2;
      stateRef.current.orbitAngleY = 0.05;
      stateRef.current.cameraDist = 3.2;
    } else if (view === 'top') {
      stateRef.current.orbitAngleX = 0;
      stateRef.current.orbitAngleY = Math.PI / 2 - 0.05;
      stateRef.current.cameraDist = 3.8;
    } else {
      // Isometric 45
      stateRef.current.orbitAngleX = Math.PI / 4;
      stateRef.current.orbitAngleY = 0.45;
      stateRef.current.cameraDist = 3.6;
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 360;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.5, 1.8, 2.5);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x10b981, 1.8);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x3b82f6, 1.2);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xf97316, 1.5, 15);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // Gym Grid Floor
    const gridHelper = new THREE.GridHelper(10, 20, 0x10b981, 0x1e293b);
    gridHelper.position.y = -0.9;
    scene.add(gridHelper);

    // Materials
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.35,
      metalness: 0.15,
    });
    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.2,
      metalness: 0.6,
      emissive: 0x059669,
      emissiveIntensity: 0.3,
    });
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.4,
    });

    // Mannequin Hierarchy Root
    const mannequinGroup = new THREE.Group();
    scene.add(mannequinGroup);

    // Torso Group
    const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.20, 0.65, 16), skinMaterial);
    torsoMesh.castShadow = true;
    mannequinGroup.add(torsoMesh);

    // Chest plate
    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.26, 0.22), accentMaterial);
    chestPlate.position.set(0, 0.12, 0.04);
    mannequinGroup.add(chestPlate);

    // Head
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), skinMaterial);
    headMesh.position.set(0, 0.48, 0);
    mannequinGroup.add(headMesh);

    // Visor
    const visorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.12), jointMaterial);
    visorMesh.position.set(0, 0.48, 0.10);
    mannequinGroup.add(visorMesh);

    // Shoulders
    const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), jointMaterial);
    leftShoulder.position.set(-0.30, 0.24, 0);
    mannequinGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), jointMaterial);
    rightShoulder.position.set(0.30, 0.24, 0);
    mannequinGroup.add(rightShoulder);

    // Left Arm Hierarchy
    const leftUpperArm = new THREE.Group();
    leftUpperArm.position.copy(leftShoulder.position);
    mannequinGroup.add(leftUpperArm);
    const leftUpperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.32, 12), skinMaterial);
    leftUpperArmMesh.position.y = -0.16;
    leftUpperArm.add(leftUpperArmMesh);

    const leftElbow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), jointMaterial);
    leftElbow.position.y = -0.32;
    leftUpperArm.add(leftElbow);

    const leftForearm = new THREE.Group();
    leftForearm.position.y = -0.32;
    leftUpperArm.add(leftForearm);
    const leftForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.30, 12), skinMaterial);
    leftForearmMesh.position.y = -0.15;
    leftForearm.add(leftForearmMesh);

    // Right Arm Hierarchy
    const rightUpperArm = new THREE.Group();
    rightUpperArm.position.copy(rightShoulder.position);
    mannequinGroup.add(rightUpperArm);
    const rightUpperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.32, 12), skinMaterial);
    rightUpperArmMesh.position.y = -0.16;
    rightUpperArm.add(rightUpperArmMesh);

    const rightElbow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), jointMaterial);
    rightElbow.position.y = -0.32;
    rightUpperArm.add(rightElbow);

    const rightForearm = new THREE.Group();
    rightForearm.position.y = -0.32;
    rightUpperArm.add(rightForearm);
    const rightForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.30, 12), skinMaterial);
    rightForearmMesh.position.y = -0.15;
    rightForearm.add(rightForearmMesh);

    // Pelvis
    const pelvisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.20, 16), jointMaterial);
    pelvisMesh.position.y = -0.36;
    mannequinGroup.add(pelvisMesh);

    // Left Leg Hierarchy
    const leftHip = new THREE.Group();
    leftHip.position.set(-0.14, -0.42, 0);
    mannequinGroup.add(leftHip);
    const leftThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.40, 12), skinMaterial);
    leftThighMesh.position.y = -0.20;
    leftHip.add(leftThighMesh);

    const leftKnee = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), jointMaterial);
    leftKnee.position.y = -0.40;
    leftHip.add(leftKnee);

    const leftShin = new THREE.Group();
    leftShin.position.y = -0.40;
    leftHip.add(leftShin);
    const leftShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.40, 12), skinMaterial);
    leftShinMesh.position.y = -0.20;
    leftShin.add(leftShinMesh);

    // Right Leg Hierarchy
    const rightHip = new THREE.Group();
    rightHip.position.set(0.14, -0.42, 0);
    mannequinGroup.add(rightHip);
    const rightThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.40, 12), skinMaterial);
    rightThighMesh.position.y = -0.20;
    rightHip.add(rightThighMesh);

    const rightKnee = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), jointMaterial);
    rightKnee.position.y = -0.40;
    rightHip.add(rightKnee);

    const rightShin = new THREE.Group();
    rightShin.position.y = -0.40;
    rightHip.add(rightShin);
    const rightShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.40, 12), skinMaterial);
    rightShinMesh.position.y = -0.20;
    rightShin.add(rightShinMesh);

    // Orbital Drag Handlers
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      stateRef.current.isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      stateRef.current.prevMouseX = clientX;
      stateRef.current.prevMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!stateRef.current.isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - stateRef.current.prevMouseX;
      const deltaY = clientY - stateRef.current.prevMouseY;

      stateRef.current.orbitAngleX += deltaX * 0.008;
      stateRef.current.orbitAngleY = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 2.1, stateRef.current.orbitAngleY + deltaY * 0.008)
      );

      stateRef.current.prevMouseX = clientX;
      stateRef.current.prevMouseY = clientY;
    };

    const onPointerUp = () => {
      stateRef.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stateRef.current.cameraDist = Math.max(1.8, Math.min(6.5, stateRef.current.cameraDist + e.deltaY * 0.003));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domEl.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (stateRef.current.isPlaying) {
        stateRef.current.t += 0.025 * stateRef.current.speed;
      }

      const tVal = stateRef.current.t;
      const cycle = Math.sin(tVal); // -1 to 1
      const normalizedCycle = (cycle + 1) / 2; // 0 to 1

      const animType = guide.animationType || 'pushup';

      // Kinematic solvers for each exercise type
      if (animType === 'pushup') {
        // Horizontal body alignment
        mannequinGroup.rotation.x = -Math.PI / 2 + 0.1;
        mannequinGroup.rotation.y = 0;
        mannequinGroup.rotation.z = 0;

        // Up & Down movement
        const heightY = -0.45 + normalizedCycle * 0.35;
        mannequinGroup.position.set(0, heightY, 0);

        // Elbow flexion (90 deg bottom to 170 deg top)
        const elbowAngleDeg = Math.round(90 + normalizedCycle * 80);
        setJointAngle(elbowAngleDeg);

        leftUpperArm.rotation.z = -0.4 - (1 - normalizedCycle) * 0.6;
        rightUpperArm.rotation.z = 0.4 + (1 - normalizedCycle) * 0.6;

        leftUpperArm.rotation.x = -(1 - normalizedCycle) * 0.8;
        rightUpperArm.rotation.x = -(1 - normalizedCycle) * 0.8;

        leftForearm.rotation.x = (1 - normalizedCycle) * 1.5;
        rightForearm.rotation.x = (1 - normalizedCycle) * 1.5;

        // Legs straight
        leftHip.rotation.x = 0;
        rightHip.rotation.x = 0;
        leftShin.rotation.x = 0;
        rightShin.rotation.x = 0;

        // Phase
        if (Math.cos(tVal) < -0.3) {
          setCurrentPhase('Turun (Eksentrik)');
        } else if (Math.abs(Math.cos(tVal)) <= 0.3) {
          setCurrentPhase('Tahan Dada (Isometrik)');
        } else {
          setCurrentPhase('Dorong Naik (Konsentrik)');
        }
      } else if (animType === 'squat') {
        mannequinGroup.rotation.x = 0;
        mannequinGroup.rotation.y = 0;
        mannequinGroup.rotation.z = 0;

        // Squat depth
        const depth = 1 - normalizedCycle;
        mannequinGroup.position.y = -depth * 0.45;

        // Torso forward lean
        torsoMesh.rotation.x = depth * 0.35;
        headMesh.position.z = depth * 0.15;

        // Hip & Knee flexion
        leftHip.rotation.x = -depth * 1.4;
        rightHip.rotation.x = -depth * 1.4;
        leftShin.rotation.x = depth * 1.5;
        rightShin.rotation.x = depth * 1.5;

        // Arms stretched out for balance
        leftUpperArm.rotation.x = 1.2;
        rightUpperArm.rotation.x = 1.2;
        leftUpperArm.rotation.z = -0.2;
        rightUpperArm.rotation.z = 0.2;
        leftForearm.rotation.x = 0;
        rightForearm.rotation.x = 0;

        const kneeAngleDeg = Math.round(175 - depth * 85);
        setJointAngle(kneeAngleDeg);

        if (Math.cos(tVal) < -0.3) {
          setCurrentPhase('Turun Jongkok (Eksentrik)');
        } else if (Math.abs(Math.cos(tVal)) <= 0.3) {
          setCurrentPhase('Tahan Kedalaman 90°');
        } else {
          setCurrentPhase('Dorong Tumit Berdiri');
        }
      } else if (animType === 'pullup') {
        mannequinGroup.rotation.x = 0;
        mannequinGroup.rotation.y = 0;
        mannequinGroup.rotation.z = 0;

        // Ascend to bar
        const pullUpY = -0.2 + normalizedCycle * 0.55;
        mannequinGroup.position.set(0, pullUpY, 0);

        // Arms overhead to pulled down
        const armPull = normalizedCycle;
        leftUpperArm.rotation.z = -2.6 + armPull * 1.4;
        rightUpperArm.rotation.z = 2.6 - armPull * 1.4;
        leftForearm.rotation.z = -armPull * 1.2;
        rightForearm.rotation.z = armPull * 1.2;

        // Knees slightly bent hollow body
        leftHip.rotation.x = 0.2;
        rightHip.rotation.x = 0.2;
        leftShin.rotation.x = -0.3;
        rightShin.rotation.x = -0.3;

        const elbowAngleDeg = Math.round(165 - armPull * 95);
        setJointAngle(elbowAngleDeg);

        if (Math.cos(tVal) > 0.3) {
          setCurrentPhase('Tarik Siku ke Pinggang (Konsentrik)');
        } else if (Math.abs(Math.cos(tVal)) <= 0.3) {
          setCurrentPhase('Puncak Dagu Melewati Bar');
        } else {
          setCurrentPhase('Turun Dead Hang Terkontrol');
        }
      } else if (animType === 'plank') {
        // Isometric Plank Hold
        mannequinGroup.rotation.x = -Math.PI / 2 + 0.05;
        mannequinGroup.rotation.y = 0;
        mannequinGroup.rotation.z = 0;
        mannequinGroup.position.set(0, -0.48, 0);

        leftUpperArm.rotation.x = -0.3;
        rightUpperArm.rotation.x = -0.3;
        leftUpperArm.rotation.z = -0.2;
        rightUpperArm.rotation.z = 0.2;
        leftForearm.rotation.x = 1.4;
        rightForearm.rotation.x = 1.4;

        leftHip.rotation.x = 0;
        rightHip.rotation.x = 0;
        leftShin.rotation.x = 0;
        rightShin.rotation.x = 0;

        setJointAngle(180);
        setCurrentPhase('Isometrik Kunci Inti Tubuh');
      } else if (animType === 'bicep_curl') {
        mannequinGroup.rotation.x = 0;
        mannequinGroup.position.set(0, -0.1, 0);

        // Upper arm stays pinned
        leftUpperArm.rotation.x = 0;
        rightUpperArm.rotation.x = 0;
        leftUpperArm.rotation.z = -0.1;
        rightUpperArm.rotation.z = 0.1;

        // Forearm curls up
        const curl = normalizedCycle;
        leftForearm.rotation.x = curl * 2.3;
        rightForearm.rotation.x = curl * 2.3;

        leftHip.rotation.x = 0;
        rightHip.rotation.x = 0;
        leftShin.rotation.x = 0;
        rightShin.rotation.x = 0;

        const curlAngleDeg = Math.round(160 - curl * 110);
        setJointAngle(curlAngleDeg);

        if (Math.cos(tVal) > 0.3) {
          setCurrentPhase('Peras Bisep Naik');
        } else {
          setCurrentPhase('Turunkan Beban Terkontrol');
        }
      } else {
        // Dynamic Running / Mobility Cycle
        mannequinGroup.rotation.x = 0.15; // forward torso lean
        mannequinGroup.position.set(0, 0, 0);

        const legPhase = Math.sin(tVal * 2);
        leftHip.rotation.x = legPhase * 0.8;
        rightHip.rotation.x = -legPhase * 0.8;

        leftShin.rotation.x = Math.max(0, -legPhase * 1.2);
        rightShin.rotation.x = Math.max(0, legPhase * 1.2);

        // Opposite arm swing
        leftUpperArm.rotation.x = -legPhase * 0.9;
        rightUpperArm.rotation.x = legPhase * 0.9;
        leftForearm.rotation.x = 1.2;
        rightForearm.rotation.x = 1.2;

        setJointAngle(Math.round(90 + Math.abs(legPhase) * 45));
        setCurrentPhase('Irama Gerak Berkelanjutan (180 SPM)');
      }

      // Update Camera Orbit
      const dist = stateRef.current.cameraDist;
      const ox = stateRef.current.orbitAngleX;
      const oy = stateRef.current.orbitAngleY;

      camera.position.x = dist * Math.sin(ox) * Math.cos(oy);
      camera.position.y = dist * Math.sin(oy) + 0.1;
      camera.position.z = dist * Math.cos(ox) * Math.cos(oy);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domEl.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (domEl.parentNode) domEl.parentNode.removeChild(domEl);
    };
  }, [guide]);

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Orbit & Biomechanical HUD Overlay */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
        <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5 shadow-md">
          <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
          <span>3D Mannequin 360° Interaktif</span>
        </div>
      </div>

      {/* Camera Presets Selector */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-xl shadow-lg z-10">
        {[
          { id: 'iso', label: '45° 3D' },
          { id: 'front', label: 'Depan' },
          { id: 'side', label: 'Samping' },
          { id: 'top', label: 'Atas' },
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setCameraPreset(view.id as any)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              cameraView === view.id
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            style={{ cursor: 'pointer' }}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Live Biomechanics Readout */}
      <div className="absolute bottom-16 right-3 flex flex-col gap-1.5 items-end z-10 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-md">
          <span className="text-[10px] text-slate-400 block font-semibold">{t('jointAngles')}</span>
          <span className="text-sm font-bold font-mono text-emerald-400">{jointAngle}°</span>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-md">
          <span className="text-[10px] text-slate-400 block font-semibold">{t('phaseTempo')}</span>
          <span className="text-xs font-bold text-amber-400">{currentPhase}</span>
        </div>
      </div>

      {/* Bottom Interactive Prompt & Controls */}
      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white shadow-lg transition-all"
            style={{ cursor: 'pointer' }}
            title={isPlaying ? 'Jeda 3D' : 'Jalankan 3D'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={() => setSpeed(speed === 1 ? 0.5 : speed === 0.5 ? 1.5 : 1)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-[11px] font-mono font-bold text-emerald-400 hover:bg-slate-800 shadow-lg"
            style={{ cursor: 'pointer' }}
            title="Kecepatan Gerakan 3D"
          >
            {speed}x
          </button>
        </div>

        <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-slate-700/60 text-[10px] text-slate-300 pointer-events-none">
          👆 Geser jari/mouse untuk putar 360° • Zoom in/out
        </div>
      </div>
    </div>
  );
};
