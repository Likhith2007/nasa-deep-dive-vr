// data-visualizer.js - Transforms NASA data into immersive visualizations
AFRAME.registerComponent('data-visualizer', {
    init: function() {
        this.loadNASAData();
    },

    loadNASAData: function() {
        // Load multiple NASA datasets
        const datasets = [
            'https://neo.sci.gsfc.nasa.gov/wms/wms?version=1.3.0&service=WMS&request=GetMap&layers=MODIST&styles=&format=image/png',
            'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?',
            // Add more NASA data endpoints
        ];

        datasets.forEach(url => this.loadDataset(url));
    },

    createDataVisualization: function(dataset, type) {
        switch(type) {
            case 'sea_surface_temp':
                return this.createTemperatureVisualization(dataset);
            case 'sea_level':
                return this.createSeaLevelVisualization(dataset);
            case 'ocean_currents':
                return this.createCurrentsVisualization(dataset);
        }
    },

    createTemperatureVisualization: function(data) {
        // Convert temperature data to color gradients
        const entity = document.createElement('a-entity');
        entity.setAttribute('temperature-gradient', {
            data: data,
            minTemp: -2,
            maxTemp: 35,
            colorScale: ['#0000ff', '#00ffff', '#ffff00', '#ff0000']
        });
        return entity;
    },

    createTimeLapseAnimation: function(data, duration) {
        // Animate data changes over time
        const timeline = document.createElement('a-entity');
        timeline.setAttribute('animation-timeline', {
            data: data,
            duration: duration,
            property: 'material.color'
        });
        return timeline;
    }
});