const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// Function to create a shortcut to the app's executable file
function createShortcut() {
    // Replace 'YourAppName' with the name of your app
    const appName = 'my-electron-app';
    const appExecutablePath = path.join(__dirname, 'my-electron-app.exe'); // Replace with the path to your app's executable

    // Path to the Startup folder for the current user
    const startupFolderPath = path.join('C:\ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
    const shortcutPath = path.join(startupFolderPath, `${appName}.lnk`);

    // Create the shortcut file
    const target = path.resolve(appExecutablePath);
    const workingDir = path.dirname(appExecutablePath);
    const icon = path.resolve(__dirname, 'icon.ico'); // Optional: Path to the app's icon

    // Windows-specific shell command to create a shortcut
    const command = `powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('${shortcutPath}');$s.TargetPath='${target}';$s.WorkingDirectory='${workingDir}';$s.IconLocation='${icon}';$s.Save()"`;

    // Execute the shell command to create the shortcut
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error creating shortcut: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error creating shortcut: ${stderr}`);
            return;
        }
        console.log('Shortcut created successfully.');
    });
}

// Create the shortcut when the script is executed
createShortcut();
