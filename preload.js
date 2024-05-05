// preload.js

const { ipcRenderer } = require('electron');

// Listen for devices event from the main process
ipcRenderer.on('devices', (event, devices) => {
    // Populate the dropdown with options
    const deviceSelect = document.getElementById('deviceSelect');
    devices.forEach(device => {
        const option = document.createElement('option');
        option.textContent = device;
        deviceSelect.appendChild(option);
    });
});
