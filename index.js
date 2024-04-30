const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('path');
const url = require('url');
const fs = require('fs');
const { exec } = require('child_process');
const https = require('https');
const getmac = require('getmac');
const rl = require ("readline-promise")
const readline = rl.default;


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

function createWindow() {
    // Create the browser window
    if (!checkCSVFile()) {
        
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Load the index.html file
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    // createRegistrationCSVFile('ITG','Reception')
}else{
    // Check network connectivity every 5 seconds
   // Check network connectivity every 5 seconds
   setInterval(async () => {
    const isOnline = await checkServerConnectivity();
    if (isOnline) {
        // If online, log to CSV
        console.log('yes server connectivity.');
        readAndLogCSV()
    } else {
        // If offline, notify the user or handle as needed
        console.log('No server connectivity.');
    }
}, 5000);


   
    logToCSV();
} 
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