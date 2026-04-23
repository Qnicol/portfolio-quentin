import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";

const host = document.querySelector("[data-three-webgl]");

if (host) {
  const engine = host.closest("[data-3d-scene]");
  const statusBadge = engine?.querySelector("[data-three-status]") || null;

  try {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.46, 8.6);

    const ambientLight = new THREE.AmbientLight(0xe5eeff, 1.28);
    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(0x67d7ff, 28, 30, 2);
    keyLight.position.set(3.2, 2.6, 5.4);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x6c63ff, 18, 28, 2);
    rimLight.position.set(-3.6, 0.8, 3.2);
    scene.add(rimLight);

    const underLight = new THREE.PointLight(0x7fe5ff, 10, 18, 2);
    underLight.position.set(0, -2.2, 2.8);
    scene.add(underLight);

    const root = new THREE.Group();
    scene.add(root);

    const loader = new THREE.TextureLoader();
    const panelTextures = [
      "assets/expertises/modelisation-rendu-card.svg",
      "assets/experience/video-premiere.webp",
      "assets/experience/support-communication-02.webp",
      "assets/video-previews/reel-v22.jpg",
    ];

    const panelConfigs = [
      { size: [3.2, 2.05], pos: [0, 0.72, 0.75], rot: [0.02, 0, 0], frame: 0x6cc8ff },
      { size: [1.7, 1.2], pos: [-2.45, 0.0, 1.95], rot: [-0.08, 0.65, -0.18], frame: 0x72b8ff },
      { size: [1.55, 2.15], pos: [2.35, 0.02, 2.35], rot: [0.08, -0.72, 0.12], frame: 0x7a7bff },
      { size: [1.4, 2.2], pos: [0.25, -1.45, 3.1], rot: [0.12, 0.26, 0.04], frame: 0x73e0ff },
    ];

    const floatingPanels = [];

    panelTextures.forEach((textureUrl, index) => {
      const config = panelConfigs[index];
      const panelGroup = new THREE.Group();
      panelGroup.position.set(...config.pos);
      panelGroup.rotation.set(...config.rot);

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(config.size[0] + 0.12, config.size[1] + 0.12, 0.08),
        new THREE.MeshPhysicalMaterial({
          color: config.frame,
          emissive: config.frame,
          emissiveIntensity: 0.22,
          transparent: true,
          opacity: 0.38,
          roughness: 0.3,
          metalness: 0.12,
          transmission: 0.08,
        })
      );
      panelGroup.add(frame);

      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(config.size[0], config.size[1]),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.98,
        })
      );
      screen.position.z = 0.045;
      panelGroup.add(screen);

      loader.load(textureUrl, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        screen.material.map = texture;
        screen.material.needsUpdate = true;
      });

      root.add(panelGroup);
      floatingPanels.push(panelGroup);
    });

    const floorGlow = new THREE.Mesh(
      new THREE.CircleGeometry(3.2, 64),
      new THREE.MeshBasicMaterial({
        color: 0x6bd6ff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
      })
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.set(0, -2.1, 1.8);
    root.add(floorGlow);

    const orb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.42, 4),
      new THREE.MeshPhysicalMaterial({
        color: 0xcff5ff,
        emissive: 0x69d5ff,
        emissiveIntensity: 1.1,
        roughness: 0.14,
        metalness: 0.18,
        transparent: true,
        opacity: 0.96,
        transmission: 0.24,
      })
    );
    orb.position.set(0.45, -0.3, 3.9);
    root.add(orb);

    const ringA = new THREE.Mesh(
      new THREE.TorusGeometry(3.05, 0.03, 20, 180),
      new THREE.MeshBasicMaterial({
        color: 0x79d8ff,
        transparent: true,
        opacity: 0.4,
      })
    );
    ringA.rotation.x = Math.PI / 2.95;
    root.add(ringA);

    const ringB = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.022, 20, 140),
      new THREE.MeshBasicMaterial({
        color: 0x7b79ff,
        transparent: true,
        opacity: 0.32,
      })
    );
    ringB.rotation.x = Math.PI / 2.95;
    ringB.rotation.z = 0.5;
    root.add(ringB);

    const glowSpriteCanvas = document.createElement("canvas");
    glowSpriteCanvas.width = 256;
    glowSpriteCanvas.height = 256;
    const glowCtx = glowSpriteCanvas.getContext("2d");
    const glowGradient = glowCtx.createRadialGradient(128, 128, 10, 128, 128, 110);
    glowGradient.addColorStop(0, "rgba(227,248,255,1)");
    glowGradient.addColorStop(0.25, "rgba(111,206,255,0.85)");
    glowGradient.addColorStop(0.55, "rgba(108,99,255,0.35)");
    glowGradient.addColorStop(1, "rgba(0,0,0,0)");
    glowCtx.fillStyle = glowGradient;
    glowCtx.fillRect(0, 0, 256, 256);

    const glowSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(glowSpriteCanvas),
        transparent: true,
        depthWrite: false,
      })
    );
    glowSprite.scale.set(2.6, 2.6, 1);
    glowSprite.position.copy(orb.position);
    root.add(glowSprite);

    const particleCount = window.innerWidth < 760 ? 60 : 110;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 9;
      positions[i3 + 1] = (Math.random() - 0.5) * 5.5;
      positions[i3 + 2] = (Math.random() - 0.5) * 6;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({
        color: 0xd3f3ff,
        size: 0.035,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
      })
    );
    scene.add(particles);

    const actorAnchor = new THREE.Group();
    actorAnchor.position.set(0, -1.85, 1.7);
    root.add(actorAnchor);

    const actorShadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.95, 40),
      new THREE.MeshBasicMaterial({
        color: 0x71d7ff,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
      })
    );
    actorShadow.rotation.x = -Math.PI / 2;
    actorShadow.position.set(0, 0.02, 0);
    actorAnchor.add(actorShadow);

    let actorModel = null;
    let actorMixer = null;
    let idleAction = null;
    let moveAction = null;
    let activeAction = null;

    const setAction = (nextAction) => {
      if (!nextAction || nextAction === activeAction) {
        return;
      }

      if (activeAction) {
        activeAction.fadeOut(0.25);
      }

      nextAction.reset().fadeIn(0.25).play();
      activeAction = nextAction;
    };

    const findAction = (actions, patterns) =>
      actions.find((action) =>
        patterns.some((pattern) => action.getClip().name.toLowerCase().includes(pattern))
      ) || null;

    const gltfLoader = new GLTFLoader();
    if (statusBadge) {
      statusBadge.textContent = "Chargement GLB";
    }

    gltfLoader.load(
      "assets/models/character-scene.glb",
      (gltf) => {
        actorModel = gltf.scene || gltf.scenes[0];

        actorModel.traverse((node) => {
          if (node.isMesh) {
            node.frustumCulled = true;
          }
        });

        const rawBox = new THREE.Box3().setFromObject(actorModel);
        const rawSize = new THREE.Vector3();
        const rawCenter = new THREE.Vector3();
        rawBox.getSize(rawSize);
        rawBox.getCenter(rawCenter);

        const targetHeight = 2.5;
        const scale = targetHeight / Math.max(rawSize.y, 0.001);
        actorModel.scale.setScalar(scale);
        actorModel.position.set(
          -rawCenter.x * scale,
          -rawBox.min.y * scale,
          -rawCenter.z * scale
        );

        actorAnchor.add(actorModel);

        if (gltf.animations?.length) {
          actorMixer = new THREE.AnimationMixer(actorModel);
          const actions = gltf.animations.map((clip) => actorMixer.clipAction(clip));

          idleAction =
            findAction(actions, ["idle", "breath", "stand", "pose"]) || actions[0];
          moveAction =
            findAction(actions, ["walk", "run", "jog", "move"]) || idleAction;

          if (idleAction) {
            idleAction.play();
            activeAction = idleAction;
          }
        }

        engine.classList.add("is-model-ready");
        if (statusBadge) {
          statusBadge.textContent = "Modele actif";
        }
      },
      undefined,
      (error) => {
        console.warn("GLB load fallback:", error);
        if (statusBadge) {
          statusBadge.textContent = "Fallback visuel";
        }
      }
    );

    const pressed = Object.create(null);
    window.addEventListener("keydown", (event) => {
      pressed[event.code] = true;
    });
    window.addEventListener("keyup", (event) => {
      pressed[event.code] = false;
    });

    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    engine.classList.add("is-webgl-ready");

    host.addEventListener("pointermove", (event) => {
      const bounds = host.getBoundingClientRect();
      pointerTarget.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointerTarget.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
    });

    host.addEventListener("pointerleave", () => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    });

    let rafId = 0;
    const clock = new THREE.Clock();

    const renderLoop = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      pointer.x += (pointerTarget.x - pointer.x) * 0.05;
      pointer.y += (pointerTarget.y - pointer.y) * 0.05;

      root.rotation.y = elapsed * 0.08 + pointer.x * 0.18;
      root.rotation.x = Math.sin(elapsed * 0.36) * 0.03 + pointer.y * 0.08;

      floatingPanels.forEach((panel, index) => {
        if (panel.userData.baseY == null) {
          panel.userData.baseY = panel.position.y;
          panel.userData.baseX = panel.position.x;
        }
        const drift = elapsed * 0.95 + index * 0.7;
        panel.position.y = panel.userData.baseY + Math.sin(drift) * 0.12;
        panel.position.x = panel.userData.baseX + Math.cos(drift * 0.8) * 0.04;
      });

      orb.rotation.x += 0.008;
      orb.rotation.y += 0.012;
      orb.position.y = -0.22 + Math.sin(elapsed * 1.6) * 0.12;
      glowSprite.position.copy(orb.position);

      ringA.rotation.z = elapsed * 0.22;
      ringB.rotation.z = -elapsed * 0.18 + 0.45;
      particles.rotation.y = elapsed * 0.035;

      const moveX =
        (pressed.KeyD || pressed.ArrowRight ? 1 : 0) -
        (pressed.KeyA || pressed.KeyQ || pressed.ArrowLeft ? 1 : 0);
      const moveZ =
        (pressed.KeyS || pressed.ArrowDown ? 1 : 0) -
        (pressed.KeyW || pressed.KeyZ || pressed.ArrowUp ? 1 : 0);
      const isMoving = moveX !== 0 || moveZ !== 0;

      if (actorModel) {
        const moveVector = new THREE.Vector3(moveX, 0, moveZ);
        if (isMoving) {
          moveVector.normalize();
          actorAnchor.position.x += moveVector.x * delta * 1.9;
          actorAnchor.position.z += moveVector.z * delta * 1.9;
          actorAnchor.position.x = THREE.MathUtils.clamp(actorAnchor.position.x, -2.2, 2.2);
          actorAnchor.position.z = THREE.MathUtils.clamp(actorAnchor.position.z, 0.35, 3.15);

          const targetRotation = Math.atan2(moveVector.x, moveVector.z);
          actorAnchor.rotation.y = THREE.MathUtils.lerp(
            actorAnchor.rotation.y,
            targetRotation,
            0.12
          );
        }

        actorAnchor.position.y = -1.85 + (isMoving ? Math.sin(elapsed * 11) * 0.03 : 0);
        actorShadow.scale.setScalar(isMoving ? 1.08 : 1);

        if (actorMixer) {
          setAction(isMoving ? moveAction : idleAction);
          actorMixer.update(delta);
        } else {
          actorModel.rotation.y += isMoving ? 0.01 : 0.004;
        }
      }

      const lookX = actorAnchor.position.x * 0.45;
      const lookY = -0.55;
      const lookZ = actorAnchor.position.z;
      const targetCamX = actorAnchor.position.x * 0.22 + pointer.x * 0.55;
      const targetCamY = 0.46 + pointer.y * 0.28;
      const targetCamZ = 8.6;

      camera.position.x += (targetCamX - camera.position.x) * 0.045;
      camera.position.y += (targetCamY - camera.position.y) * 0.045;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;
      camera.lookAt(lookX, lookY, lookZ);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
        return;
      }

      if (!document.hidden && !rafId) {
        clock.getDelta();
        rafId = requestAnimationFrame(renderLoop);
      }
    });
  } catch (error) {
    console.warn("Three.js scene fallback:", error);
    if (statusBadge) {
      statusBadge.textContent = "Fallback visuel";
    }
  }
}
