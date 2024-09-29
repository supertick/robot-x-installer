const { app, BrowserWindow, ipcMain } = require('electron')
const { exec } = require('child_process')
const path = require('path')

let mainWindow

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // Make sure you use nodeIntegration properly in production
    }
  })

  mainWindow.loadFile('index.html')
})

// Path to npm in node_modules (if bundled)
const npmPath = path.join(__dirname, 'node_modules', 'npm', 'bin', 'npm-cli.js')

// Listen for the 'install-package' event from the renderer process
ipcMain.on('install-package', (event, packageName) => {
  console.log(`Installing package: ${packageName}`)

  // Run npm install programmatically
  const installCommand = `node ${npmPath} install ${packageName}`

  const npmProcess = exec(installCommand, { cwd: __dirname })

  npmProcess.stdout.on('data', (data) => {
    event.sender.send('install-output', data)
  })

  npmProcess.stderr.on('data', (data) => {
    event.sender.send('install-error', data)
  })

  npmProcess.on('close', (code) => {
    event.sender.send('install-output', `Installation process exited with code ${code}`)
  })
})
