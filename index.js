const { app, BrowserWindow, screen, ipcMain} = require('electron/main')
const path = require('path');
const url = require('url');
const fs = require('fs');
const { exec } = require('child_process');
const https = require('https');
const getmac = require('getmac');
const rl = require ("readline-promise")
const readline = rl.default;
const os  = require('os');
const disk = require('diskusage');
const si = require('systeminformation');
const wmi = require('wmi-client');
const { contextBridge } = require('electron');
const process = require('process');
var connectionManager = require('./connectionManager')
require('electron-reloader')(module);

function createWindow() {
    // Create the browser window
   var devices = []
        
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Load the index.html file
    
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }));
        // Send devices array to the renderer process
    mainWindow.webContents.on('did-finish-load', () => {
        getDevices().then(devicesResult=>{
            devices = devicesResult
            console.log(devicesResult)
            mainWindow.webContents.send('devices', devicesResult);
        }).catch(err=>{
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'network-error.html'),
                protocol: 'file:',
                slashes: true
            }));
            
            console.log(err)
        })
    });
     // Listen for selected option ID
     ipcMain.on('selected-option', (event, selectedId) => {
        console.log('Selected Option ID:', selectedId);
        // Handle the selected ID as needed
    });

}
// Event handler for when Electron has finished initialization
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Activate the app on macOS when the dock icon is clicked
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden:true}
)
function getDevices(){

    return new Promise((resolve, reject) => {
        https.get('https://1c29-103-164-197-211.ngrok-free.app/api/users', (res) => {
            res.setEncoding('utf8');
            var resBody = '';
            res.on('data', function (chunk) {
                resBody += chunk
            });
            res.on('end', function () {  
          
                try{
                   var jsonRes = JSON.parse(resBody);
                   console.log(jsonRes)
                  
                   resolve(jsonRes)
                }
                catch(err){

                }
            })
            
        }).on('error', (err) => {
            console.log(err)
            reject(err);
        });
    });
}

