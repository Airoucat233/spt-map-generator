import { app, BrowserWindow, nativeTheme,ipcMain } from 'electron'
import path from 'path'
import os from 'os'
import { initialize, enable } from '@electron/remote/main'


initialize()

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
  }
}
catch (_) { }

let mainWindow

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 800,
    height: 600,
    minWidth:800,
    minHeight:600,
    frame:false,
    useContentSize: true,
    webPreferences: {
      //nodeIntegration: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD)
    }
  })

  enable(mainWindow.webContents)
  mainWindow.loadURL(process.env.APP_URL)
  mainWindow.setAspectRatio(800/600)
  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  }
  else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }
  // console.log('->',store.state)
  mainWindow.on('close',()=>mainWindow.webContents.send('notify'))
  // mainWindow.on('close',()=>{
  //   mainWindow.webContents.send('notify',JSON.stringify(store.state))
  // })
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
// ipcMain.on('popmap',(e,map)=>{
//   console.log('111->',map)
//   let newwin = new BrowserWindow({
//     width: 600, 
//     height: 400,
//     //frame:false,
//     parent: mainWindow, //win是主窗口
//   })
//   newwin.loadURL('/created-map'); //new.html是新开窗口的渲染进程
//   newwin.on('closed',()=>{newwin = null})
// })
ipcMain.on('test',(e,msg)=>console.log('test->',msg))
ipcMain.on('saved-config',(e,msg)=>console.log('已保存配置->',msg))
// ipcMain.on('reply',(e,msg)=>console.log('已保存配置->',msg))

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
