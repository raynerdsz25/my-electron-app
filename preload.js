// preload.js

const { ipcRenderer } = require('electron');

// Listen for devices event from the main process


    // Populate the dropdown with options
    ipcRenderer.on('devices', (event, data) => {
        const deviceSelect = document.getElementById('deviceSelect');
        data.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option._id;
            optionElement.textContent = option.name;
            deviceSelect.appendChild(optionElement);
        });
  

    deviceSelect.addEventListener('change', (event) => {
        const selectedId = event.target.value;
        ipcRenderer.send('selected-option', selectedId);
    });
});
