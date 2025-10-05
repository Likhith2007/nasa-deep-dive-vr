// audio-manager.js
// NASA Deep Dive VR - Spatial Audio Management

AFRAME.registerComponent('audio-manager', {
    init: function() {
        this.audioContext = null;
        this.currentAudio = null;
        this.isAudioEnabled = false;
        this.audioBuffers = new Map();
        
        this.setupAudioContext();
        this.preloadAudio();
        this.setupSpatialAudio();
    },

    setupAudioContext: function() {
        // Create Web Audio Context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Resume audio context on user interaction
        document.addEventListener('click', () => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        });
    },

    preloadAudio: function() {
        const audioFiles = {
            'space': 'assets/audio/space-narration.mp3',
            'ocean-surface': 'assets/audio/ocean-narration.mp3',
            'coral-reef': 'assets/audio/coral-narration.mp3',
            'sst-data': 'assets/audio/sst-explanation.mp3',
            'coral-bleaching': 'assets/audio/coral-bleaching.mp3',
            'sea-level-rise': 'assets/audio/sea-level-rise.mp3',
            'ocean-ambient': 'assets/audio/ocean-ambient.mp3',
            'space-ambient': 'assets/audio/space-ambient.mp3'
        };

        // Preload all audio files
        Object.entries(audioFiles).forEach(([key, url]) => {
            this.loadAudioBuffer(url, key);
        });
    },

    loadAudioBuffer: function(url, key) {
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.audioBuffers.set(key, audioBuffer);
                console.log(`Loaded audio: ${key}`);
            })
            .catch(error => {
                console.warn(`Failed to load audio ${url}:`, error);
            });
    },

    setupSpatialAudio: function() {
        // Create spatial audio entities
        this.createSpatialAudioSource('space-ambient', [0, 0, -10], 1.0);
        this.createSpatialAudioSource('ocean-ambient', [0, -5, -15], 0.8);
        this.createHotspotAudio('coral-hotspot', [-3, 1, 0], 'coral-bleaching', 0.3);
        this.createHotspotAudio('sst-hotspot', [2, 0, -9], 'sst-data', 0.4);
    },

    createSpatialAudioSource: function(audioKey, position, volume = 1.0) {
        const audioEntity = document.createElement('a-entity');
        audioEntity.setAttribute('position', position);
        audioEntity.setAttribute('sound', {
            src: `assets/audio/${audioKey}.mp3`,
            autoplay: false,
            loop: true,
            volume: volume,
            poolSize: 1,
            positional: true,
            distanceModel: 'inverse',
            refDistance: 5,
            maxDistance: 50,
            rolloffFactor: 1
        });
        audioEntity.setAttribute('id', `${audioKey}-audio`);
        
        document.querySelector('a-scene').appendChild(audioEntity);
    },

    createHotspotAudio: function(hotspotId, position, audioKey, triggerDistance = 2.0) {
        const hotspot = document.createElement('a-entity');
        hotspot.setAttribute('position', position);
        hotspot.setAttribute('id', hotspotId);
        hotspot.setAttribute('audio-trigger', {
            audioKey: audioKey,
            triggerDistance: triggerDistance,
            cooldown: 10000 // 10 seconds cooldown
        });
        
        // Visual indicator
        const ring = document.createElement('a-ring');
        ring.setAttribute('color', '#00ff88');
        ring.setAttribute('radius-inner', 0.1);
        ring.setAttribute('radius-outer', 0.15);
        ring.setAttribute('opacity', 0.7);
        ring.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: 3000; loop: true');
        
        hotspot.appendChild(ring);
        document.querySelector('a-scene').appendChild(hotspot);
    },

    playSceneAudio: function(sceneName) {
        // Stop all current audio
        this.stopAllAudio();
        
        // Play scene-specific audio
        switch(sceneName) {
            case 'space':
                this.playSpatialAudio('space-ambient-audio');
                this.playNarration('space', 2000); // Delay for immersion
                break;
                
            case 'ocean-surface':
                this.playSpatialAudio('ocean-ambient-audio');
                this.stopSpatialAudio('space-ambient-audio');
                this.playNarration('ocean-surface', 1500);
                break;
                
            case 'coral-reef':
                this.playSpatialAudio('ocean-ambient-audio');
                this.playNarration('coral-reef', 1000);
                break;
        }
    },

    playSpatialAudio: function(audioEntityId) {
        const audioEntity = document.getElementById(audioEntityId);
        if (audioEntity && audioEntity.components.sound) {
            audioEntity.components.sound.playSound();
        }
    },

    stopSpatialAudio: function(audioEntityId) {
        const audioEntity = document.getElementById(audioEntityId);
        if (audioEntity && audioEntity.components.sound) {
            audioEntity.components.sound.stopSound();
        }
    },

    stopAllAudio: function() {
        const allAudio = document.querySelectorAll('[sound]');
        allAudio.forEach(audioEntity => {
            if (audioEntity.components.sound) {
                audioEntity.components.sound.stopSound();
            }
        });
    },

    playNarration: function(audioKey, delay = 0) {
        setTimeout(() => {
            this.playOneShotAudio(audioKey);
        }, delay);
    },

    playOneShotAudio: function(audioKey) {
        const audioBuffer = this.audioBuffers.get(audioKey);
        if (!audioBuffer) {
            console.warn(`Audio buffer not found for: ${audioKey}`);
            return;
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = audioBuffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Set volume based on audio type
        gainNode.gain.value = audioKey.includes('ambient') ? 0.3 : 0.7;
        
        source.start(0);
        this.currentAudio = source;
        
        // Clean up when done
        source.onended = () => {
            source.disconnect();
            gainNode.disconnect();
        };
    },

    playProximityAudio: function(audioKey, position, maxDistance = 5) {
        const camera = document.querySelector('[camera]').object3D;
        const cameraPosition = camera.position;
        
        const distance = Math.sqrt(
            Math.pow(cameraPosition.x - position.x, 2) +
            Math.pow(cameraPosition.y - position.y, 2) + 
            Math.pow(cameraPosition.z - position.z, 2)
        );
        
        if (distance <= maxDistance) {
            const volume = 1 - (distance / maxDistance);
            this.playSpatialAudioWithVolume(audioKey, volume);
            return true;
        }
        return false;
    },

    playSpatialAudioWithVolume: function(audioKey, volume) {
        const audioBuffer = this.audioBuffers.get(audioKey);
        if (!audioBuffer) return;

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = audioBuffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        gainNode.gain.value = Math.max(0.1, Math.min(1.0, volume));
        
        source.start(0);
    },

    // Fade out audio smoothly
    fadeOutAudio: function(duration = 1000) {
        if (this.currentAudio) {
            const gainNode = this.audioContext.createGain();
            this.currentAudio.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);
            
            setTimeout(() => {
                if (this.currentAudio) {
                    this.currentAudio.stop();
                    this.currentAudio = null;
                }
            }, duration);
        }
    }
});

// Audio Trigger Component for Hotspots
AFRAME.registerComponent('audio-trigger', {
    schema: {
        audioKey: { type: 'string', default: '' },
        triggerDistance: { type: 'number', default: 2.0 },
        cooldown: { type: 'number', default: 10000 } // ms
    },

    init: function() {
        this.camera = document.querySelector('[camera]');
        this.lastTriggerTime = 0;
        this.isInRange = false;
    },

    tick: function() {
        const now = Date.now();
        const cameraPos = this.camera.object3D.position;
        const triggerPos = this.el.object3D.position;
        
        const distance = cameraPos.distanceTo(triggerPos);
        
        if (distance <= this.data.triggerDistance && !this.isInRange) {
            if (now - this.lastTriggerTime > this.data.cooldown) {
                this.triggerAudio();
                this.lastTriggerTime = now;
                this.isInRange = true;
            }
        } else if (distance > this.data.triggerDistance) {
            this.isInRange = false;
        }
    },

    triggerAudio: function() {
        const audioManager = document.querySelector('[audio-manager]').components['audio-manager'];
        if (audioManager) {
            audioManager.playOneShotAudio(this.data.audioKey);
            
            // Visual feedback
            this.el.setAttribute('animation', {
                property: 'scale',
                to: '1.5 1.5 1.5',
                dur: 500,
                easing: 'easeOutElastic',
                dir: 'alternate'
            });
        }
    }
});

// Audio Control System
AFRAME.registerSystem('audio-controls', {
    init: function() {
        this.volume = 0.7;
        this.isMuted = false;
        
        this.setupUI();
    },

    setupUI: function() {
        // Create audio control UI
        const audioUI = document.createElement('div');
        audioUI.innerHTML = `
            <div style="position: absolute; top: 20px; right: 20px; color: white; font-family: Arial;">
                <button id="mute-btn">🔊</button>
                <input id="volume-slider" type="range" min="0" max="100" value="70">
            </div>
        `;
        document.body.appendChild(audioUI);

        // Add event listeners
        document.getElementById('mute-btn').addEventListener('click', () => this.toggleMute());
        document.getElementById('volume-slider').addEventListener('input', (e) => this.setVolume(e.target.value / 100));
    },

    toggleMute: function() {
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('mute-btn');
        btn.textContent = this.isMuted ? '🔇' : '🔊';
        
        // Implement mute logic here
        const allAudio = document.querySelectorAll('[sound]');
        allAudio.forEach(audio => {
            if (audio.components.sound) {
                audio.components.sound.volume = this.isMuted ? 0 : this.volume;
            }
        });
    },

    setVolume: function(volume) {
        this.volume = volume;
        if (!this.isMuted) {
            const allAudio = document.querySelectorAll('[sound]');
            allAudio.forEach(audio => {
                if (audio.components.sound) {
                    audio.components.sound.volume = volume;
                }
            });
        }
    }
});