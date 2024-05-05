const { app, BrowserWindow, screen } = require('electron/main')
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

// Define devices array
const devices = ['Device 1', 'Device 2', 'Device 3'];



function generateRandomCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


// Function to log timestamp and random code to CSV file
function logToCSV() {
    const timestamp = new Date().toISOString();
    const randomCode = generateRandomCode(6);
    const data = `${timestamp},${randomCode}\n`;
    fs.appendFile(path.join(__dirname, 'log.csv'), data, (err) => {
        if (err) throw err;
        console.log('Data logged to CSV file.');
    });
}
// Function to read and log contents of CSV file
function readAndLogCSV() {
    const fileStream = fs.createReadStream(path.join(__dirname, 'log.csv'));
    const rl = readline.createInterface({
        input: fileStream
    });

    rl.on('line', (line) => {
        console.log(line); // Log each line of the CSV file
    });
    rl.on('close', () => {
        console.log('File has been read completely.');
    });
}

// Check if CSV file exists
function checkCSVFile() {
    return fs.existsSync(path.join(__dirname, 'reg.csv'));
}

function checkServerConnectivity(){
    return new Promise((resolve, reject) => {
        https.get('https://www.google.com', (res) => {
            resolve(true);
        }).on('error', (err) => {
            resolve(false);
        });
    });
}

function bytesToGB(bytes) {
    return (bytes / Math.pow(1024, 3)).toFixed(2); // Divide by 1024^3 (1024*1024*1024)
}

function createWindow() {
    // Create the browser window
    if (!checkCSVFile()) {
        
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
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
        mainWindow.webContents.send('devices', devices);
    });
    // createRegistrationCSVFile('ITG','Reception')
}else{
    // Check network connectivity every 5 seconds
   // Check network connectivity every 5 seconds
//    setInterval(async () => {
//     const isOnline = await checkServerConnectivity();
//     if (isOnline) {
//         // If online, log to CSV
//         console.log('yes server connectivity.');
//         readAndLogCSV()
//     } else {
//         // If offline, notify the user or handle as needed
//         console.log('No server connectivity.');
//     }
// }, 5000);
const username = os.userInfo().username;
// Cusername of the pc
console.log('User Information:');
console.log(username);
var osInfo = getOSInfo()
console.log('OS Information:');
console.log(osInfo);
// Get primary display details
console.log('Primary Display:');
console.log(screen.getPrimaryDisplay());
getDiskInfo()
const platform = os.platform();

// Check if the platform is Windows or macOS
if (platform === 'win32') {
    console.log('The app is running on Windows.');
    getGraphicsCardInfoWindows()
    getBatteryInfoWindows()
} else if (platform === 'darwin') {
    console.log('The app is running on macOS.');
    getGraphicsCardInfoMacOS()
    getBatteryInfoMacOS()
} else {
    console.log('The app is running on a different operating system.');
}
    logToCSV();
} 
}

function getOSInfo(){
    // Get OS information
const osInfo = {
    platform: os.platform(),
    type: os.type(),
    release: os.release(),
    architecture: os.arch(),
    hostname: os.hostname(),
    totalMemory: bytesToGB(os.totalmem()),
    freeMemory: bytesToGB(os.freemem())
};
// Get CPU information
const cpuInfo = {
    model: os.cpus()[0].model,
    speed: os.cpus()[0].speed,
    cores: os.cpus().length
};

return {osInfo,cpuInfo}
}

function getDiskInfo(){
    // Get disk information
disk.check('/', (err, info) => {
    if (err) {
        console.error(err);
        return;
    }
    const diskInfo = {
        total: bytesToGB(info.total),
        free: bytesToGB(info.free),
        used: bytesToGB(info.total - info.free)
    };
    console.log('Disk Information:');
    console.log(diskInfo);
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



// Function to create a new CSV file
function createRegistrationCSVFile(Deprtment,Description) {
    
    const macAddress = getmac.default()
    const timestamp = new Date().toISOString();
    const data = `${timestamp},${Deprtment},${macAddress},${Description}\n`;
    var filePath = path.join(__dirname, 'reg.csv')
    fs.writeFileSync(filePath, data, (err) => {
        if (err) throw err;
        console.log('CSV file created successfully.');
    });
}

function getGraphicsCardInfoWindows() {
    exec('wmic path win32_videocontroller get name', (err, stdout, stderr) => {
        if (err) {
            console.error('Error fetching graphics card information:', err);
            return;
        }
        console.log('Graphics Card Information (Windows):');
        console.log(stdout.trim());
    });
}

// Function to fetch graphics card information on macOS
async function getGraphicsCardInfoMacOS() {
    try {
        const graphics = await si.graphics();
        console.log('Graphics Card Information (macOS):');
        console.log(graphics.controllers);
    } catch (error) {
        console.error('Error fetching graphics card information:', error);
    }
}

function getBatteryInfoWindows() {
    const query = 'SELECT * FROM Win32_Battery';
    wmi.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching battery information:', err);
            return;
        }
        console.log('Battery Information (Windows):');
        console.log(result);
    });
}

async function getBatteryInfoMacOS() {
    try {
        const battery = await si.battery();
        console.log('Battery Information (macOS):');
        console.log(battery);
    } catch (error) {
        console.error('Error fetching battery information:', error);
    }
}

