// NASA Data Scenes
AFRAME.registerComponent('scene-manager', {
    init: function() {
        this.setupOceanSurface();
        this.setupCoralReef();
    },

    setupOceanSurface: function() {
        const oceanScene = document.createElement('a-entity');
        oceanScene.setAttribute('id', 'ocean-surface-scene');
        oceanScene.setAttribute('position', '0 -10 -20');
        oceanScene.setAttribute('visible', 'false');

        // Ocean plane
        const ocean = document.createElement('a-plane');
        ocean.setAttribute('color', '#006994');
        ocean.setAttribute('rotation', '-90 0 0');
        ocean.setAttribute('width', 50);
        ocean.setAttribute('height', 50);
        
        // Currents visualization
        const currents = document.createElement('a-entity');
        currents.setAttribute('particle-system', {
            preset: 'default',
            color: '#88ffff',
            particleCount: 500
        });

        oceanScene.appendChild(ocean);
        oceanScene.appendChild(currents);
        document.querySelector('a-scene').appendChild(oceanScene);
    },

    setupCoralReef: function() {
        const reefScene = document.createElement('a-entity');
        reefScene.setAttribute('id', 'coral-reef-scene');
        reefScene.setAttribute('position', '0 -15 -25');
        reefScene.setAttribute('visible', 'false');

        // Coral models would go here
        const coral1 = document.createElement('a-entity');
        coral1.setAttribute('gltf-model', 'assets/models/simple-coral.glb');
        coral1.setAttribute('position', '-3 0 0');
        coral1.setAttribute('scale', '2 2 2');

        // Data hotspot
        const hotspot = document.createElement('a-ring');
        hotspot.setAttribute('color', '#ff4444');
        hotspot.setAttribute('radius-inner', 0.2);
        hotspot.setAttribute('radius-outer', 0.3);
        hotspot.setAttribute('position', '-3 1 0');
        hotspot.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: 4000; loop: true');

        reefScene.appendChild(coral1);
        reefScene.appendChild(hotspot);
        document.querySelector('a-scene').appendChild(reefScene);
    }
});