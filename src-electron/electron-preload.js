import { contextBridge,ipcRenderer,clipboard} from 'electron'
import { BrowserWindow,dialog} from '@electron/remote'
const fs = require('fs');
const path = require('path')

// ipcRenderer.on('notify',(e,args)=>{
//   ipcRenderer.send('reply',{argsargs:args})
// })
ipcRenderer.on('notify',(e)=>{
  
})

contextBridge.exposeInMainWorld('myWindowAPI', {
  minimize () {
    BrowserWindow.getFocusedWindow().minimize()
  },

  toggleMaximize () {
    const win = BrowserWindow.getFocusedWindow()

    if (win.isMaximized()) {
      win.unmaximize()
      return false
    } else {
      win.maximize()
      return true
    }
  },

  close () {
    BrowserWindow.getFocusedWindow().close()
  },
  test: (msg) => {
    ipcRenderer.send('test',msg)
  },
  savedConfig: (config) => {
    ipcRenderer.send('saved-config',config)
  },
  // popMap: (map)=>ipcRenderer.send('popmap',map),
  clipboard:clipboard,
  openFileDialog:(options={})=>{
    return new Promise((resolve,reject)=>{
      dialog.showOpenDialog({
        title:'打开文件',
        defaultPath:options.defaultPath?path.resolve(options.defaultPath):path.resolve('.'),
        buttonLabel:'打开',
        filters:options.filters?options.filters:null
      }).then(res=>{
        console.log('res->',res)
        //if(JSON.stringify(res)=='{}')
        let files = res.filePaths.map(m=>({filename:path.basename(m),fullPath:m}))
        resolve({path:path.dirname(files[0].fullPath),files:files})
      }).catch(err=>{
        console.log('open failed->',err)
        reject(false)
      })
    })
    
  },
  saveTemplateDialog:(template,defaultPath)=>{ 
    return new Promise((resolve,reject)=>{
      dialog.showSaveDialog({
        title:'保存模板',
        defaultPath:defaultPath?path.join(defaultPath,'template'+new Date().getTime())
            :path.join(__dirname,'template'+new Date().getTime()),
        buttonLabel:'保存',
        filters:[
          {name:'文本文件',extensions:['map']}
        ]
      }).then(res=>{
        fs.writeFileSync(res.filePath,template)
        let fullPath = path.resolve(res.filePath)
        let dirname = path.dirname(fullPath)
        let basename = path.basename(fullPath)
        resolve(({fullPath:fullPath,dirname:dirname,filename:basename}))
      }).catch(err=>{
        console.log('save failed->',err)
        console.log('template->',template)
        reject(false)
      })
    })
    
  },
  fileAPI:{
    readJson:(filepath)=>{
      try{
        console.log('readpath->',path.resolve(filepath))
        fs.accessSync(filepath,fs.constants.F_OK)
        return JSON.parse(fs.readFileSync(filepath, 'utf-8'))
      }catch(err){
        console.log('文件读取错误->',filepath)
        return false
      }
    },
    writeJson:(filepath,content)=>{
      try{
        // fs.accessSync(filepath,fs.constants.W_OK)
        console.log('111111->',2222)
        if(typeof(content)!='string'){
          content=JSON.stringify(content,null,2)
        }
        console.log('writepath->',path.resolve(filepath))
        fs.writeFileSync(filepath,content)
        return true
      }catch(err){
        console.log('文件写入错误->',filepath)
        return false
      }
    },
    deleteFile:(filepath)=>{
      try {
        fs.unlinkSync(filepath)
        return true
      } catch (err) {
        console.log('in deleteFile err->',err)
        return false
      }

    },
    readFiles:function fun(dir,options={recursion:true}){
      let fileList=[]
      dir = path.resolve(dir)
      // console.log('path->',path.resolve(dir))
      const files = fs.readdirSync(dir)
      // console.log('files->',files)
      files.forEach((file)=>{
        var fullPath = path.join(dir, file)
        // console.log('->',fullPath)
        const stat = fs.statSync(fullPath)
        if(stat.isDirectory()){
          if(options.recursion){
            fileList.concat(fun(fullPath,options))
          }
        }
        else{
          if(options.suffix && JSON.stringify(options.suffix)!='[]'){
            if(options.suffix.indexOf(path.extname(file))!=-1){
              fileList.push({filename:file,fullPath:fullPath})
            }
          }
          else{
            fileList.push({filename:file,fullPath:fullPath})
          }
        }
      })
      return fileList
    }
  }

})