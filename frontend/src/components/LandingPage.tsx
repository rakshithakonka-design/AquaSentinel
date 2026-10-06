import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Waves, 
  Cpu, 
  Sparkles, 
  Globe, 
  ChevronRight, 
  CheckCircle2, 
  Layers, 
  Radio, 
  Eye,
  Zap,
  BarChart3
} from 'lucide-react';

interface LandingPageProps {
  onEnterDashboard: () => void;
}

const BG_IMAGES = [
  {
    src: './assets/1b3461a4b07bb316385b61f71a8cffe9f957f71a3a8e161246759dd27bf19e7c.webp',
    title: 'Sunlit Reef & Deep Ocean Currents',
    subtitle: 'Photosynthetic oxygen generation & solar irradiation profile',
  },
  {
    src: './assets/e2ab4f76365a91e3c12aef7e005ab95d7336d9089faab823e0cd693ad7d8759e.webp',
    title: 'Vibrant Aquatic Ecosystem',
    subtitle: 'Balanced marine biophysical equilibrium and microalgae density',
  },
  {
    src: './assets/afab8180cb0cf2caa45750f255bd0103c4995ceeb09404da80aae6180865f0cd.webp',
    title: 'Precision Aquaculture Net Enclosures',
    subtitle: 'Sub-surface IoT sensor telemetry and active biomass welfare',
  },
  {
    src: './assets/ae5a793bd1aecc19d92157f350818aa676d42006cd51f7cdec5fff0ec57ce996.webp',
    title: 'Caustic Light Stream Penetration',
    subtitle: 'Turbidity monitoring & diurnal photosynthetic respiration cycles',
  },
  {
    src: './assets/89d79e793c1563974c2b0f8ea3a1ba7ff5d136638f7dfb3f0e94abbb886636cf.webp',
    title: 'Tropical Marine Biodiversity',
    subtitle: 'Autonomous anomaly alerting and stress mitigation',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeBgIndex, setActiveBgIndex] = useState(0);

  // Background image rotation interval
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBgIndex((prev) => (prev + 1) % BG_IMAGES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  // Three.js 3D Underwater Scene (Particles, Light Caustics & Holographic Logo Emblem)
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060f1e, 0.035);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 1. Floating Bioluminescent Marine Particles
    const particleCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
      scales[i] = Math.random() * 0.8 + 0.2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // 2. Floating 3D Geometric Aqua Hologram Emblem
    const emblemGroup = new THREE.Group();

    // Central Icosahedron core
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
      emissive: 0x0891b2,
      emissiveIntensity: 0.5,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    emblemGroup.add(coreMesh);

    // Inner glowing sphere
    const sphereGeo = new THREE.SphereGeometry(0.85, 24, 24);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    emblemGroup.add(sphereMesh);

    // Outer orbital rings
    const ringGeo1 = new THREE.TorusGeometry(2.4, 0.03, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    emblemGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.8, 0.02, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x14b8a6, transparent: true, opacity: 0.5 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    emblemGroup.add(ring2);

    emblemGroup.position.set(3.8, 0.2, -1);
    scene.add(emblemGroup);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0e7490, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2.5, 30);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize listener
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (window.innerWidth < 1024) {
        emblemGroup.position.set(0, -3.2, -2);
        emblemGroup.scale.set(0.7, 0.7, 0.7);
      } else {
        emblemGroup.position.set(3.8, 0.2, -1);
        emblemGroup.scale.set(1, 1, 1);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Animation loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotate particles slowly
      particles.rotation.y = elapsed * 0.04;
      particles.rotation.x = elapsed * 0.015;

      // Rotate hologram emblem
      coreMesh.rotation.x = elapsed * 0.25;
      coreMesh.rotation.y = elapsed * 0.35;
      sphereMesh.rotation.y = -elapsed * 0.4;
      ring1.rotation.z = elapsed * 0.2;
      ring2.rotation.x = elapsed * 0.15;

      // Gentle floating bob
      emblemGroup.position.y = (window.innerWidth < 1024 ? -3.2 : 0.2) + Math.sin(elapsed * 1.5) * 0.18;

      // Parallax smooth interpolation
      camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#040810] text-slate-100 overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Dynamic Background Image Layers with Smooth Crossfade */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {BG_IMAGES.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-cover bg-center"
            style={{
              backgroundImage: `url(${img.src})`,
              opacity: activeBgIndex === idx ? 0.32 : 0,
              filter: 'brightness(0.7) contrast(1.15) saturate(1.2)',
              transform: activeBgIndex === idx ? 'scale(1.04)' : 'scale(1)',
              transition: 'opacity 1.5s ease-in-out, transform 8s ease-out',
            }}
          />
        ))}

        {/* Cinematic Ocean Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#040810]/85 via-[#06101e]/80 to-[#040810]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/30 via-transparent to-transparent" />
      </div>

      {/* 3D WebGL Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Sticky Top Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-cyan-500/20 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/25">
              <div className="w-full h-full bg-[#071322] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>

            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-teal-200 to-white bg-clip-text text-transparent">
                AquaSentinel
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/30">
                AI Precision Aquaculture
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-300 transition-colors">Features</a>
            <a href="#biophysical" className="hover:text-cyan-300 transition-colors">Biophysical Matrix</a>
            <a href="#architecture" className="hover:text-cyan-300 transition-colors">AI Engine</a>
          </nav>

          {/* Primary CTA Button */}
          <button
            onClick={onEnterDashboard}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12 pt-14 pb-24">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[75vh]">
          {/* Left Column: Typography & Launch CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
              <span>Next-Gen Aquaculture Water-Quality & Fish Health Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Autonomous{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
                Telemetry
              </span>{' '}
              & Predictive{' '}
              <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
                Pond Intelligence
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Real-time multi-sensor monitoring for commercial fish & shrimp ponds. Powered by 
              <span className="text-cyan-300 font-semibold"> Isolation Forest Machine Learning</span>, 
              circadian diurnal solar simulations, and early-warning trend alerts.
            </p>

            {/* Launch & Explore Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onEnterDashboard}
                className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>ENTER LIVE DASHBOARD</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute -inset-1 rounded-2xl bg-cyan-400 opacity-30 blur-md group-hover:opacity-60 transition-opacity -z-10" />
              </button>

              <a
                href="#features"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 font-semibold text-sm backdrop-blur-md hover:bg-slate-800 transition-all"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Explore Features</span>
              </a>
            </div>

            {/* Trust & Key Capability Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Isolation Forest ML</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Diurnal Sine Simulator</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Tri-Lingual Agronomist</span>
              </div>
            </div>
          </div>

          {/* Right Column: Active Scene Caption & Interactive Background Switcher */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
            {/* Ambient Card */}
            <div className="w-full max-w-sm rounded-2xl glass-panel-elevated p-5 space-y-4 border border-cyan-500/30 glow-cyan">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  SCENE PERSPECTIVE {activeBgIndex + 1}/{BG_IMAGES.length}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live 3D WebGL
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {BG_IMAGES[activeBgIndex].title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {BG_IMAGES[activeBgIndex].subtitle}
                </p>
              </div>

              {/* Background Thumbnail Switcher */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                {BG_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBgIndex(idx)}
                    className={`relative w-12 h-10 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      activeBgIndex === idx ? 'border-cyan-400 scale-105 shadow-md shadow-cyan-500/30' : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.src} alt={img.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Live Telemetry Floating Ribbon */}
        <section className="mt-12 rounded-2xl glass-panel-elevated p-4 lg:p-6 border border-cyan-500/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  Simulated IoT Gateway Telemetry
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Continuous 10-Minute Diurnal Cycles • 5-Channel Ingestion
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs font-mono">
                <span className="text-slate-400">DO: </span>
                <span className="text-cyan-300 font-bold">6.2 mg/L</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs font-mono">
                <span className="text-slate-400">Temp: </span>
                <span className="text-amber-300 font-bold">28.5 °C</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs font-mono">
                <span className="text-slate-400">pH: </span>
                <span className="text-emerald-300 font-bold">7.45</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-xs font-mono">
                <span className="text-slate-400">Turbidity: </span>
                <span className="text-purple-300 font-bold">32 NTU</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-rose-500/30 text-xs font-mono">
                <span className="text-slate-400">NH₃: </span>
                <span className="text-rose-300 font-bold">0.12 mg/L</span>
              </div>

              <button
                onClick={onEnterDashboard}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Telemetry</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section id="features" className="mt-24 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              CORE CAPABILITIES
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Precision Biophysics for Sustainable Yields
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Engineered to prevent mass biomass mortality caused by sudden nocturnal dissolved oxygen crashes, 
              acid rain pH drops, and toxic ammonia spikes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="rounded-2xl glass-panel p-6 border border-cyan-500/20 hover:border-cyan-400/50 transition-all hover:translate-y-[-4px] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-cyan-500/20">
                  <Waves className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">
                  Predictive Hypoxia Alarm
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time trajectory forecasting calculates the exact time-to-threshold before dissolved oxygen 
                  breaches the 5.0 mg/L safe boundary, automating emergency aeration.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-cyan-400">
                • Target: ≥ 5.0 mg/L DO
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl glass-panel p-6 border border-cyan-500/20 hover:border-cyan-400/50 transition-all hover:translate-y-[-4px] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/20">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">
                  Isolation Forest ML Engine
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Unsupervised multi-variate anomaly detection trained on 4,000 circadian samples to spot complex 
                  cross-parameter anomalies before single-sensor threshold alarms trigger.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-emerald-400">
                • 150 Estimators (0.5% Contamination)
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl glass-panel p-6 border border-cyan-500/20 hover:border-cyan-400/50 transition-all hover:translate-y-[-4px] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-purple-500/20">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">
                  Pond Digital Twin
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive underwater pond cross-section showing dynamic water color shifts, paddlewheel aerator 
                  states, and fish swimming dynamics responding live to water quality.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-purple-400">
                • Depth Profiles & Benthic Sediment
              </div>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl glass-panel p-6 border border-cyan-500/20 hover:border-cyan-400/50 transition-all hover:translate-y-[-4px] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-500/20">
                  <Globe className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">
                  Tri-Lingual AI Copilot
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tailored specifically for coastal Indian shrimp and aquaculture farm operators, providing actionable 
                  remediation protocols in English, Telugu (తెలుగు), and Hindi (हिन्दी).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-amber-400">
                • English • తెలుగు • हिन्दी
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="mt-24 rounded-3xl p-8 sm:p-12 relative overflow-hidden bg-gradient-to-br from-cyan-950/70 via-slate-900/90 to-emerald-950/70 border border-cyan-500/40 text-center shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready to Monitor Your Pond with Precision AI?
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Access the live telemetry streaming station, disaster stress lab, interactive historical charts, 
              and AI agronomist advisory now.
            </p>
            <div className="pt-2">
              <button
                onClick={onEnterDashboard}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-extrabold text-base shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>OPEN AQUASENTINEL DASHBOARD</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Decorative aura blur */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#02060e] py-8 px-6 lg:px-12 text-xs text-slate-500 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-400">AquaSentinel</span>
            <span>• Sustainable Precision Aquaculture Water-Quality Monitoring</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onEnterDashboard}
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium cursor-pointer"
            >
              Telemetry Dashboard
            </button>
            <span>v2.4 IoT Production</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
