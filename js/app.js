// app.js - NASA Deep Dive VR - Enhanced Earth with Immediate Visuals
AFRAME.registerComponent('nav-controls', {
    init: function() {
        this.camera = document.querySelector('[camera]');
        this.currentScene = 'space';
        this.currentGalleryPanel = 0;
        this.isInGallery = false;
        this.earthEnhanced = false;
        
        this.setupEventListeners();
        this.setupGalleryInteractions();
        this.createEnhancedEarth(); // IMMEDIATELY create enhanced Earth
    },
    
    createEnhancedEarth: function() {
        console.log('Creating enhanced Earth...');
        
        const earthEntity = document.getElementById('earth');
        if (!earthEntity) {
            console.error('Earth entity not found!');
            return;
        }

        // 1. ENHANCE BASE EARTH MATERIAL
        earthEntity.setAttribute('material', {
            shader: 'standard',
            metalness: 0.2,
            roughness: 0.7,
            src: 'assets/images/earth-texture.jpg'
        });

        // 2. ADD CLOUDS LAYER (IMMEDIATELY VISIBLE)
        const clouds = document.createElement('a-sphere');
        clouds.setAttribute('radius', '3.02');
        clouds.setAttribute('position', '0 0 0');
        clouds.setAttribute('material', {
            shader: 'standard',
            src: 'assets/images/earth-clouds.jpg',
            transparent: true,
            opacity: 0.4,
            side: 'double'
        });
        clouds.setAttribute('animation', {
            property: 'rotation',
            to: '0 -360 0',
            dur: '25000',
            loop: true
        });
        clouds.setAttribute('id', 'earth-clouds');
        earthEntity.appendChild(clouds);
        console.log('Clouds layer added');

        // 3. ADD ATMOSPHERE GLOW (IMMEDIATELY VISIBLE)
        const atmosphere = document.createElement('a-sphere');
        atmosphere.setAttribute('radius', '3.3');
        atmosphere.setAttribute('position', '0 0 0');
        atmosphere.setAttribute('material', {
            shader: 'flat',
            color: '#4fa3f7',
            transparent: true,
            opacity: 0.15,
            side: 'back'
        });
        atmosphere.setAttribute('id', 'earth-atmosphere');
        
        // Pulsing atmosphere animation
        atmosphere.setAttribute('animation', {
            property: 'material.opacity',
            to: '0.25',
            dur: '3000',
            loop: true,
            dir: 'alternate'
        });
        
        earthEntity.appendChild(atmosphere);
        console.log('Atmosphere added');

        // 4. ADD NIGHT LIGHTS (IMMEDIATELY VISIBLE)
        const nightLights = document.createElement('a-sphere');
        nightLights.setAttribute('radius', '3.01');
        nightLights.setAttribute('position', '0 0 0');
        nightLights.setAttribute('material', {
            shader: 'standard',
            src: 'assets/images/earth-night.jpg',
            transparent: true,
            opacity: 0.9,
            side: 'double'
        });
        nightLights.setAttribute('id', 'earth-night');
        earthEntity.appendChild(nightLights);
        console.log('Night lights added');

        this.earthEnhanced = true;
        console.log('Enhanced Earth creation complete!');
    },

    setupEventListeners: function() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (e.shiftKey || e.ctrlKey) {
                        this.enterDataScene();
                    } else {
                        if (this.isInGallery) {
                            this.activateCurrentGalleryPanel();
                        } else {
                            this.moveToGalleryWall();
                        }
                    }
                    break;
                
                case 'ArrowDown':
                    if (this.isInGallery) {
                        this.returnToSpaceView();
                    }
                    break;
                    
                case 'ArrowLeft':
                    if (this.isInGallery) this.navigateGalleryLeft();
                    break;
                    
                case 'ArrowRight':
                    if (this.isInGallery) this.navigateGalleryRight();
                    break;
                    
                case ' ':
                    this.resetCamera();
                    break;
                    
                case '1':
                    this.toggleEarthEnhancement();
                    break;
                    
                case '2':
                    this.toggleEarthLayers();
                    break;
            }
        });
    },

    toggleEarthEnhancement: function() {
        const earth = document.getElementById('earth');
        const clouds = document.getElementById('earth-clouds');
        const atmosphere = document.getElementById('earth-atmosphere');
        
        if (this.earthEnhanced) {
            // Remove enhancements
            if (clouds) clouds.setAttribute('material', 'opacity', 0.2);
            if (atmosphere) atmosphere.setAttribute('material', 'opacity', 0.05);
            if (earth) earth.setAttribute('material', 'metalness', 0.1);
            console.log('Earth enhancements reduced');
        } else {
            // Enhance further
            if (clouds) clouds.setAttribute('material', 'opacity', 0.6);
            if (atmosphere) atmosphere.setAttribute('material', 'opacity', 0.3);
            if (earth) earth.setAttribute('material', 'metalness', 0.3);
            console.log('Earth enhancements increased');
        }
        this.earthEnhanced = !this.earthEnhanced;
    },

    toggleEarthLayers: function() {
        const clouds = document.getElementById('earth-clouds');
        const night = document.getElementById('earth-night');
        const atmosphere = document.getElementById('earth-atmosphere');
        
        if (clouds) {
            const currentOpacity = clouds.getAttribute('material').opacity || 0.4;
            clouds.setAttribute('material', 'opacity', currentOpacity > 0 ? 0 : 0.4);
            console.log('Clouds toggled:', currentOpacity > 0 ? 'OFF' : 'ON');
        }
        
        if (night) {
            const currentOpacity = night.getAttribute('material').opacity || 0.9;
            night.setAttribute('material', 'opacity', currentOpacity > 0 ? 0 : 0.9);
            console.log('Night lights toggled:', currentOpacity > 0 ? 'OFF' : 'ON');
        }
        
        if (atmosphere) {
            const currentOpacity = atmosphere.getAttribute('material').opacity || 0.15;
            atmosphere.setAttribute('material', 'opacity', currentOpacity > 0 ? 0 : 0.15);
            console.log('Atmosphere toggled:', currentOpacity > 0 ? 'OFF' : 'ON');
        }
    },

    // ... (keep all the other methods exactly the same as before)
    setupGalleryInteractions: function() {
        const galleryPanels = document.querySelectorAll('.gallery-panel');
        
        galleryPanels.forEach((panel, index) => {
            panel.addEventListener('click', (e) => {
                this.currentGalleryPanel = index;
                this.activateGalleryPanel(panel.id);
            });
            
            panel.addEventListener('mouseenter', () => {
                panel.setAttribute('animation', {
                    property: 'scale',
                    to: '1.05 1.05 1.05',
                    dur: 300,
                    easing: 'easeOutElastic'
                });
            });
            
            panel.addEventListener('mouseleave', () => {
                panel.setAttribute('animation', {
                    property: 'scale', 
                    to: '1 1 1',
                    dur: 300,
                    easing: 'easeOutElastic'
                });
            });
        });
    },

    transitionToScene: function(sceneName) {
        console.log('Transitioning to:', sceneName);
        
        this.camera.setAttribute('animation', {
            property: 'position',
            to: SCENE_POSITIONS[sceneName],
            dur: 2000,
            easing: 'easeInOutQuad'
        });

        this.playSceneAudio(sceneName);
        
        this.currentScene = sceneName;
        this.isInGallery = false;
        this.updateUI();
    },

    moveToGalleryWall: function() {
        console.log('Moving to gallery wall');
        
        const camera = this.camera;
        
        camera.setAttribute('animation', {
            property: 'position',
            to: '0 1.5 -8',
            dur: 2000,
            easing: 'easeInOutQuad'
        });
        
        camera.setAttribute('animation__rotation', {
            property: 'rotation',
            to: '0 0 0',
            dur: 2000,
            easing: 'easeInOutQuad'
        });

        const galleryWall = document.getElementById('gallery-wall');
        if (galleryWall) galleryWall.setAttribute('visible', 'true');
        
        this.isInGallery = true;
        this.currentGalleryPanel = 1;
        this.highlightCurrentPanel();
        this.updateUI();
    },

    returnToSpaceView: function() {
        console.log('Returning to space view');
        
        const camera = this.camera;
        
        camera.setAttribute('animation', {
            property: 'position',
            to: SCENE_POSITIONS['space'],
            dur: 2000,
            easing: 'easeInOutQuad'
        });
        
        camera.setAttribute('animation__rotation', {
            property: 'rotation', 
            to: '0 0 0',
            dur: 2000,
            easing: 'easeInOutQuad'
        });

        this.isInGallery = false;
        this.updateUI();
    },

    navigateGalleryLeft: function() {
        this.currentGalleryPanel = Math.max(0, this.currentGalleryPanel - 1);
        this.highlightCurrentPanel();
    },

    navigateGalleryRight: function() {
        this.currentGalleryPanel = Math.min(2, this.currentGalleryPanel + 1);
        this.highlightCurrentPanel();
    },

    highlightCurrentPanel: function() {
        const allPanels = document.querySelectorAll('.gallery-panel');
        allPanels.forEach(panel => {
            panel.setAttribute('animation', {
                property: 'scale',
                to: '1 1 1',
                dur: 500,
                easing: 'easeOutElastic'
            });
        });
        
        const currentPanel = allPanels[this.currentGalleryPanel];
        if (currentPanel) {
            currentPanel.setAttribute('animation', {
                property: 'scale',
                to: '1.1 1.1 1.1',
                dur: 500,
                easing: 'easeOutElastic'
            });
        }
    },

    activateCurrentGalleryPanel: function() {
        const panelIds = ['lunar-gravity-display', 'ocean-currents-display', 'temperature-display'];
        const currentPanelId = panelIds[this.currentGalleryPanel];
        this.activateGalleryPanel(currentPanelId);
    },

    activateGalleryPanel: function(panelId) {
        console.log('Activating gallery panel:', panelId);
        
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.setAttribute('animation', {
                property: 'scale',
                to: '1.15 1.15 1.15',
                dur: 300,
                easing: 'easeOutElastic',
                dir: 'alternate'
            });
            
            setTimeout(() => {
                panel.setAttribute('animation', {
                    property: 'scale',
                    to: '1.1 1.1 1.1',
                    dur: 300,
                    easing: 'easeOutElastic'
                });
            }, 600);
        }
    },

    enterDataScene: function() {
        if (this.currentScene === 'space') {
            const sstOverlay = document.getElementById('sst-overlay');
            if (sstOverlay) {
                const isVisible = sstOverlay.getAttribute('visible');
                sstOverlay.setAttribute('visible', !isVisible);
            }
        }
    },

    playSceneAudio: function(sceneName) {
        const audioSources = {
            'space': 'assets/audio/space-narration.mp3',
            'ocean-surface': 'assets/audio/ocean-narration.mp3', 
            'coral-reef': 'assets/audio/coral-narration.mp3'
        };
        this.playAudio(audioSources[sceneName]);
    },

    playAudio: function(src) {
        const audioEntity = document.querySelector('[sound]');
        if (audioEntity && audioEntity.components.sound) {
            audioEntity.setAttribute('src', src);
            audioEntity.components.sound.playSound();
        }
    },

    resetCamera: function() {
        this.camera.setAttribute('position', SCENE_POSITIONS['space']);
        this.camera.setAttribute('rotation', '0 0 0');
        this.isInGallery = false;
        this.updateUI();
    },

    updateUI: function() {
        const navHelp = document.getElementById('navigation-help');
        if (!navHelp) return;
        
        if (this.isInGallery) {
            navHelp.innerHTML = `
                <div>↑ Activate Panel • ↓ Return to Space</div>
                <div>← → Navigate Panels</div>
                <div>Press 1: Toggle Enhance • Press 2: Toggle Layers</div>
            `;
        } else {
            navHelp.innerHTML = `
                <div>↑ Enter Gallery • ↓ Return</div>
                <div>Hold ↑+Shift: Data Toggle</div>
                <div>Press 1: Toggle Enhance • Press 2: Toggle Layers</div>
            `;
        }
    }
});

// Scene positions
const SCENE_POSITIONS = {
    'space': '0 0 0',
    'ocean-surface': '0 -5 -5', 
    'coral-reef': '0 -8 -3'
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('NASA Deep Dive VR with IMMEDIATE Earth enhancements loaded!');
});