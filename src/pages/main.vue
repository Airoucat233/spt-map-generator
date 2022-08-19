<template>
  <!-- <div style="margin:10px 0">
    <q-btn @click="test">打开111</q-btn>
  </div> -->

  <div id="drop-area" 
    @drop="handleDrop" 
    @dragenter="dragenter" 
    @dragover="dragover" 
    @dragleave="dragleave" 
    ref="drop-area"
    :style="{background:activebg}"
    >
          <!-- <q-btn>
        <q-icon name="test" @dblclick="test" style="font-size:1.5em"/>
        <span>测试</span>
      </q-btn> -->
    <div class="text-tip" v-if="JSON.stringify(fileList) == '{}'">
      <q-btn @click="openExcelFile">
        <q-icon name="add" style="font-size:1.5em"/>
        <span>拖动文件到这</span>
      </q-btn>
    </div>
    <div class="fileList-row" v-if="JSON.stringify(fileList) != '{}'">
      
      <q-dialog v-model="addTemplateDialog" persistent >
          <q-card class="bg-teal text-white template-content">
              <q-card-section class="row items-center q-pb-none" style="height: 60px;">
                <div class="text-h6">配置模板</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
              </q-card-section>

              <q-card-section class="bg-white text-teal" style="display:flex;justify-content:space-evenly">
                <q-radio v-model="templateType" val="sale" label="销售" />
                <q-radio v-model="templateType" val="purchase" label="购进" />
                <q-radio v-model="templateType" val="stock" label="库存" />
              </q-card-section>
              <q-card-section class="bg-white text-teal scroll" style="max-height: 60vh;min-width: 50vh;">
                <div class="row template-row" style="justify-content:space-evenly" v-for="field in configTemplate[templateType]" :key="field.label">
                  <!-- <span style="align-self:center;width:20%">{{field.label}}</span> -->
                  <q-input v-model="field.default" :label="field.label" style="margin:0 15px;"/>
                  <q-checkbox v-model="field.quotation" label="带引号" />
                </div>
              </q-card-section>
              <q-card-actions align="right" class="bg-white text-teal">
                <q-btn flat label="取消" v-close-popup />
                <q-btn flat label="保存" v-close-popup @click="saveTemplate(templateEditor)"/>
                <q-btn flat label="另存为" v-if="templateEditor.isEditing" @click="saveTemplate(templateEditor,true)"/>
              </q-card-actions>
          </q-card>
      </q-dialog>
      <div style="display: flex;justify-content: space-between;margin:5px 0">
          <q-select class="template-select" ref="template-select"
                    color="teal" standout="bg-teal-10 text-white"  v-model="mapTemplateObj" :options="mapTemplatesOptions" 
                    label="选择模板" option-label="filename" option-value="fullPath"
                    dense @dblclick="openMapFile">
          <template v-slot:prepend>
            <q-btn round dense flat icon="folder_open" title="从文件夹中打开" @click="openMapFile" @click.stop/>
          </template>
          <template v-slot:append>
            <q-btn round dense flat icon="close" @click="mapTemplateObj=null" @click.stop v-if='mapTemplateObj!=null'/>
            <q-btn round dense flat icon="add" @click="addTemplate" @click.stop />
          </template>
          <template v-slot:option="{itemProps,opt}">
            <q-item :title = "opt.fullPath"
            v-bind="itemProps"
            >
              <q-item-section>
                <q-item-label v-html="opt.filename" ></q-item-label>
              </q-item-section>
              <q-item-section side>
                <div>
                  <q-btn size="sm" round flat color="black" icon="edit" @click="editOpt(opt)" @click.stop></q-btn>
                  <q-btn size="sm" round flat color="black" icon="close" @click="delOpt(opt)" @click.stop></q-btn>
                </div>

              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <!-- <q-dialog v-model="delOptDialog">
          <q-card class="bg-teal text-white" style="width: 300px">
            <q-card-section class="row items-center">
              <q-avatar icon="warning" color="teal" text-color="white" />
              <span class="q-ml-sm">此操作将会删除本地模板文件</span>
            </q-card-section>

            <q-card-actions align="right" class="bg-white text-teal">
              <q-btn flat label="取消" color="primary" v-close-popup />
              <q-btn flat label="确定" color="primary" v-close-popup @click="" />
            </q-card-actions>
          </q-card>
        </q-dialog> -->
        
        <div>
          <q-toggle
          v-model="isFormatMap"
          color="green"
          label="格式化输出"
          left-label
        />
          <q-btn color="secondary" icon-right="close" label="清除" @click="clearMap"/>
          <q-btn color="secondary" icon-right="send" label="生成" @click="createMap()" style="margin-left: 10px;"/>
          <q-btn color="secondary" icon-right="send" label="生成全部" @click="createMapAll" style="margin-left: 10px;"/>        
        </div>
      </div>

      <q-list bordered v-for="file in Object.keys(fileList)" :key="file" style="border: 0; margin-bottom:2px" >
          <q-expansion-item
                v-model="fileList[file].active"
                group="somegroup"
                class="shadow-1 overflow-hidden"
                icon="description"
                header-class="bg-secondary text-white"
                style="border-radius: 10px"
                :label="file"
                :caption="fileList[file].columns.length+' 个字段'"
              > 
                <sps-map-pairer
                  :filename="fileList[file].filename"
                  :columns="fileList[file].columns"
                  :height="mapHeight"
                  v-model:map="fileList[file].generateMap"
                  :mapTemplate="mapTemplate"
                  @templateLoadError="mapTemplateObj=null"
                ></sps-map-pairer>
          </q-expansion-item>
      </q-list>
    </div>
      <q-fab
        v-if = "JSON.stringify(fileList) != '{}'"
        v-model="fabActive"
        label="收起"
        color="purple"
        icon="keyboard_arrow_right"
        direction="right"
        :hide-label="hideLabels"
        style="position: fixed;left:30px;bottom:30px"
        >
        <q-fab-action :hide-label="hideLabels" color="red" @click="clearAll" icon="refresh" label="清空" />
      </q-fab>
  </div>
</template>
<script>
import { defineComponent,ref,reactive,onMounted,watch,computed,getCurrentInstance} from 'vue';
import { useStore } from 'vuex'
import XLSX from 'xlsx'
import spsMapPairer from 'components/SpsMapPair.vue'
export default defineComponent({
   components: {
    spsMapPairer
  },
  setup() {
    const store = useStore()
    const sps = {'sale':'销售','purchase':'购进','stock':'库存'}
    let defaultTemplate = {
        sale:[
        {id:0,label:'商业名称',selected:false,quotation:true,default:null},
        {id:1,label:'下游自定义ID',selected:false,quotation:true,default:null},
        {id:2,label:'下游名称',selected:false,quotation:true,default:null},
        {id:3,label:'日期',selected:false,quotation:true,default:null},
        {id:4,label:'商品编码ID',selected:false,quotation:true,default:null},
        {id:5,label:'品名',selected:false,quotation:true,default:null},
        {id:6,label:'品规',selected:false,quotation:true,default:null},
        {id:7,label:'单位',selected:false,quotation:true,default:null},
        {id:8,label:'数量',selected:false,quotation:true,default:null},
        {id:9,label:'批号',selected:false,quotation:true,default:null},
        {id:10,label:'单价',selected:false,quotation:true,default:null},
        {id:11,label:'总价',selected:false,quotation:true,default:null},
        {id:12,label:'生产商',selected:false,quotation:true,default:null},
        {id:13,label:'商业英克ID',selected:false,quotation:true,default:null},
        {id:14,label:'商业自定义CODE',selected:false,quotation:true,default:null},
        {id:15,label:'集团号',selected:false,quotation:true,default:null},
        {id:16,label:'赠品标志',selected:false,quotation:true,default:null},
        {id:17,label:'开票员',selected:false,quotation:true,default:null},
        {id:18,label:'备用字段1',selected:false,quotation:true,default:null},
        {id:19,label:'备用字段2',selected:false,quotation:true,default:null},
    ],
    purchase:[
        {id:0,label:'商业名称',selected:false,quotation:true,default:null},
        {id:1,label:'自定义上游ID',selected:false,quotation:true,default:null},
        {id:2,label:'上游单位名称',selected:false,quotation:true,default:null},
        {id:3,label:'日期',selected:false,quotation:true,default:null},
        {id:4,label:'商品编码ID',selected:false,quotation:true,default:null},
        {id:5,label:'品名',selected:false,quotation:true,default:null},
        {id:6,label:'品规',selected:false,quotation:true,default:null},
        {id:7,label:'单位',selected:false,quotation:true,default:null},
        {id:8,label:'数量',selected:false,quotation:true,default:null},
        {id:9,label:'批号',selected:false,quotation:true,default:null},
        {id:10,label:'单价',selected:false,quotation:true,default:null},
        {id:11,label:'总价',selected:false,quotation:true,default:null},
        {id:12,label:'生产商',selected:false,quotation:true,default:null},
        {id:13,label:'商业英克ID',selected:false,quotation:true,default:null},
        {id:14,label:'商业自定义CODE',selected:false,quotation:true,default:null},
        {id:15,label:'集团号',selected:false,quotation:true,default:null},
        {id:16,label:'赠品标志',selected:false,quotation:true,default:null},
        {id:17,label:'备用字段1',selected:false,quotation:true,default:null},
        {id:18,label:'备用字段2',selected:false,quotation:true,default:null},
    ],
    stock:[
        {id:0,label:'商业名称',selected:false,quotation:true,default:null},
        {id:1,label:'日期',selected:false,quotation:true,default:null},
        {id:2,label:'商品编码ID',selected:false,quotation:true,default:null},
        {id:3,label:'品名',selected:false,quotation:true,default:null},
        {id:4,label:'品规',selected:false,quotation:true,default:null},
        {id:5,label:'单位',selected:false,quotation:true,default:null},
        {id:6,label:'数量',selected:false,quotation:true,default:null},
        {id:7,label:'批号',selected:false,quotation:true,default:null},
        {id:8,label:'单价',selected:false,quotation:true,default:null},
        {id:9,label:'总价',selected:false,quotation:true,default:null},
        {id:10,label:'生产商',selected:false,quotation:true,default:null},
        {id:11,label:'商业英克ID',selected:false,quotation:true,default:null},
        {id:12,label:'商业自定义CODE',selected:false,quotation:true,default:null},
        {id:13,label:'集团号',selected:false,quotation:true,default:null},
        {id:14,label:'赠品标志',selected:false,quotation:true,default:null},
        {id:15,label:'备用字段1',selected:false,quotation:true,default:null},
        {id:16,label:'备用字段2',selected:false,quotation:true,default:null},
    ]
    }
    const {proxy} = getCurrentInstance()
    const mapTemplatesOptions = ref([])
    const mapTemplateObj = ref(null)
    const mapTemplate = computed(()=>{
      let opt = mapTemplateObj.value
      let t = opt?window.myWindowAPI.fileAPI.readJson(mapTemplateObj.value.fullPath):defaultTemplate
      return t
    })
    const configTemplate = ref({})
    const activebg = ref('#ffffff')
    const hideLabels = ref(true)
    const fabActive = ref(false)
    // const fileColumns = ref({})
    const fileList = ref({})
    const mapHeight = ref(0)
    const isFormatMap = ref(true)
    const addTemplateDialog = ref(false)
    // const delOptDialog = ref(false)
    const templateType = ref('sale')
    const templateEditor = reactive({isEditing:false,opt:{},fullPath:''})
    const reloadTemplateFiles = ()=>{
      mapTemplatesOptions.value = window.myWindowAPI.fileAPI.readFiles(store.state.app.config.rememberTemplatePath,{recursion:false,suffix:['.map']})
    }
    // const generateMap = ref({})
    watch(fabActive,()=>{
      hideLabels.value=!fabActive.value
    })
    watch(fileList.value,()=>window.onresize())
    watch(mapTemplateObj,(newVal)=>{
      store.commit('app/setRememberTemplate',newVal.fullPath)
    })
    onMounted(()=>{
      //debugger
      window.onresize = ()=>{
        if(Object.keys(fileList.value).length!=0){
            proxy.$nextTick(()=>{
            let rows = new Array(...proxy.$refs["drop-area"].getElementsByClassName('q-item'))
            let sumHeight = 0
            rows.forEach((row)=>{sumHeight += row.offsetHeight})
            mapHeight.value = proxy.$refs['drop-area'].offsetHeight-50-sumHeight
          })
        }
      }
      configTemplate.value = defaultTemplate
      reloadTemplateFiles()
      for(let m of mapTemplatesOptions.value){
        if(m.fullPath==store.state.app.config.rememberTemplate){
          mapTemplateObj.value=m
          break
        }
      }
    })

    return {
      activebg,
      hideLabels,
      fabActive,
      fileList,
      mapHeight,
      isFormatMap,
      addTemplateDialog,
      templateType,
      configTemplate,
      templateEditor,
      mapTemplate,
      mapTemplateObj,
      mapTemplatesOptions,

      async loadExcels(files){
        for(let file of files){  
          let reader = new FileReader();
          let columns = []
          reader.onload = function(e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, {type:'binary'});
            var sheet = workbook.Sheets[workbook.SheetNames[0]]
            const range = XLSX.utils.decode_range(sheet['!ref'])
            //var range = {s:{c:0,r:0},e:{c:sheet['!ref'].split(':')[1][0].charCodeAt()-65,r:0}}
            for(var R = range.s.r; R <= range.s.r; ++R){
              for(var C = range.s.c; C <= range.e.c; ++C) {
                var cell_address = {c:C, r:R}
                var next_row_cell_address = {c:C,r:R+1}
                /* if an A1-style address is needed, encode the address */
                var cell_ref = XLSX.utils.encode_cell(cell_address)
                var next_row_cell_ref = XLSX.utils.encode_cell(next_row_cell_address)
                // console.log('cell->',cell_ref,next_row_cell_ref)
                // console.log('cell->',cell_ref,sheet[cell_ref])
                if (sheet[cell_ref]){
                  columns.push({
                    id:columns.length,
                    label:sheet[cell_ref].v,
                    value:sheet[cell_ref].v,
                    selected:false,
                    referValue:sheet[next_row_cell_ref]?sheet[next_row_cell_ref].v:'空'
                  })
                }
              }
            }
            columns.push({id:columns.length,label:'None',value:null,selected:false})
            fileList.value[file.name]={
              filename:file.name,
              columns:columns,
              generateMap:{type:'sale',map:{sale:{},purchase:{},stock:{}}},
              active:false
            }
          };
          reader.readAsBinaryString(file)
        }
      },
      async handleDrop(e){
        activebg.value = '#ffffff'
        e.preventDefault();
        e.stopPropagation();
        let items = new Array(...e.dataTransfer.items)
        let files = []
        let entryList = []
        for(let item of items){
          let entry = item.webkitGetAsEntry()
          if (entry.isFile){
            entryList.push(entry)
          }
        }
        for(let entry of entryList){
          let file = await new Promise((resolve,reject)=>entry.file(resolve,reject))
          files.push(file)
        }
        if (JSON.stringify(fileList.value)!='{}'){
          proxy.$q.dialog({
            title:'提示',
            message:'是否覆盖已加载的文件?',
            ok: {
                  label:'覆盖'
              },
            cancel: {
                  label:'追加'
              },
          }).onOk(()=>{
            this.clearAll()
            this.loadExcels(files)
          }).onCancel(()=>{
            this.loadExcels(files)
          })
        }
        else{
          this.loadExcels(files)
        }

      },

      openMapFile(){
        window.myWindowAPI.openFileDialog({
            filters:[
              {name:'文本文件',extensions:['map']}
            ],
            defaultPath:store.state.app.config.rememberTemplatePath
          }).then(files=>{
          console.log('files->',files)
          console.log('rememberTemplatePath->',store.state.app.config.rememberTemplatePath)
          if(files.files.length>0){
            // console.log('？？？->',files.path!=store.state.app.config.rememberTemplatePath)
            if(files.path!=store.state.app.config.rememberTemplatePath){
              store.commit('app/setRememberTemplatePath',files.path)
              console.log('已修改配置->',store.state.app.config)
              mapTemplatesOptions.value.push(...window.myWindowAPI.fileAPI.readFiles(store.state.app.config.rememberTemplatePath,{recursion:false,suffix:['.map']}))
              mapTemplateObj.value = files.files[0]
            }
            else{
              mapTemplateObj.value = files.files[0]
            }
            console.log('store,->',store.state.app.config.rememberTemplatePath)
            console.log('mapt->',mapTemplatesOptions.value)
          }
        }).catch(err=>{
          console.log('err->',err)
        })

      },
      openExcelFile(){
        window.myWindowAPI.openFileDialog({
            filters:[
              {name:'Excel文件',extensions:['xls','xlsx']}
            ],
            defaultPath:'.'
          }).then(files=>{
          console.log('files->',files)   
          if(files){
          }
        }).catch(err=>{
          console.log('err->',err)
        })
      },
      dragenter(e){
        activebg.value = '#f5f5f5'
        console.log('enter->',e)
      },
      dragover(e){
        e.preventDefault();
        e.stopPropagation();
      },
      dragleave(e){
        activebg.value = '#ffffff'
        console.log('over->',e)
      },
      clearAll(){
        fileList.value = {}
      },
      test(){
        // proxy.$q.notify({type:'warning',message:'222222222222222222'})
        // window.myWindowAPI.popMap({1:3})
        // console.log('是否冻结->',Object.isFrozen(defaultTemplate))
        // console.log('defauttp->',defaultTemplate)
      },
      addTemplate(){
        configTemplate.value = defaultTemplate
        addTemplateDialog.value = true
        templateType.value='sale'
      },
      editOpt(opt){
        templateEditor.isEditing = true
        templateEditor.opt = opt
        templateEditor.fullPath = opt.fullPath
        templateType.value='sale'
        configTemplate.value = window.myWindowAPI.fileAPI.readJson(opt.fullPath)
        addTemplateDialog.value = true
      },
      delOpt({fullPath}){
        proxy.$q.dialog({
          title:'删除模板',
          message:'是否删除本地文件?',
          ok: {
                label:'确认'
            },
            cancel: {
                label:'取消'
            },
        }).onOk(()=>{
          let result = window.myWindowAPI.fileAPI.deleteFile(fullPath)
          let state = result?{type:'positive',message:'删除成功'}:{type:'negative',message:'删除失败!'}
          proxy.$q.notify(state)
          reloadTemplateFiles()
          console.log('result->',mapTemplatesOptions.value)
        })

      },
      createMap(spsmA=null){
        let spsm,generateMap
        let isFormat=isFormatMap.value
        // for(let key of Object.keys(fileList.value)){
        //   if(fileList.value[key].active==true){
        //     spsm = fileList.value[key].generateMap.type
        //     generateMap = fileList.value[key].generateMap.map
        //     break
        //   }
        // }
        if (spsmA){
            spsm = spsmA
            generateMap = Object.values(fileList.value).find(f=>f.generateMap.type===spsm).generateMap.map
        }
        else{
            for(let file of Object.values(fileList.value)){
                if(file.active==true){
                    spsm = file.generateMap.type
                    generateMap = file.generateMap.map
                    break
                }
            }
        }

        if(generateMap==undefined||JSON.stringify(generateMap[spsm])=='{}'){
          return
        }
        let tempMapStr = ''
        for (let k of Object.keys(generateMap[spsm])){
          tempMapStr += generateMap[spsm][k].quotation&&generateMap[spsm][k].value!=null?
            '"'+k+'":'+'"'+generateMap[spsm][k].value+'",':
            '"'+k+'":'+generateMap[spsm][k].value+','
        }
        // let map = JSON.stringify(generateMap[spsm])
        let mapList = tempMapStr.substring(0,tempMapStr.length-1).split(',')
        let mapStr = ''
        if(isFormat){
            mapStr = mapList.join(',\n\t')
            mapStr = '{\n\t'+mapStr+'\n}'
        }
        else{
            const splitPoint = ['4','11']
            for(let i in mapList){
                if(splitPoint.indexOf(i)==-1){
                    mapStr += mapList[i]+','
                }
                else{
                    mapStr += mapList[i]+',\n '
                }
            }
            mapStr = '{'+mapStr.substring(0,mapStr.length-1)+'}'
        }
        let map = mapStr.replaceAll('null','None').replaceAll('"None"','None').replaceAll('"',"'")
        let textclass = isFormat?'map-text-format':''
        if (!spsmA){
            proxy.$q.dialog({
                title: sps[spsm],
                message: '<div class="'+textclass+'">'+map+'</div>',
                html: true,
                ok: {
                    push: true,
                    label:'复制'
                },
                cancel: {
                    push: true,
                    color: 'negative',
                    label:'取消'
                },
            //persistent: true
            }).onOk(() => {
                window.myWindowAPI.clipboard.writeText(map)
            }).onCancel(() => {
                // console.log('>>>> Cancel')
            }).onDismiss(() => {
                // console.log('I am triggered on both OK and Cancel')
            })
        }

        return map
      },
      createMapAll(){
        let isFormat=isFormatMap.value
        let result = ''
        for (let spsm of Object.keys(sps)){
            result += spsm+'_p = '+proxy.createMap(spsm,true)+'\n\n'
        }
        console.log('re->',result)
        let textclass = isFormat?'map-text-format':'map-text-not-format'
        proxy.$q.dialog({
            title: '全部',
            message: '<div class="'+textclass+'">'+result+'</div>',
            html: true,
            ok: {
                push: true,
                label:'复制'
            },
            cancel: {
                push: true,
                color: 'negative',
                label:'取消'
            },
            //persistent: true
        }).onOk(() => {
            window.myWindowAPI.clipboard.writeText(result)
        }).onCancel(() => {
            // console.log('>>>> Cancel')
        }).onDismiss(() => {
            // console.log('I am triggered on both OK and Cancel')
        })
      },
      clearMap(){
        for(let key of Object.keys(fileList.value)){
          if(fileList.value[key].active==true){
            console.log('cur->',fileList.value[key].generateMap.map[fileList.value[key].generateMap.type])
            let map = fileList.value[key].generateMap.map[fileList.value[key].generateMap.type]
            Object.keys(map).forEach(k=>{
              map[k].value = map[k].default
            })
            proxy.$q.notify({type:'positive',message:'清除成功',position: 'top',timeout: 500,})
            break
          }
        }
      },
      saveTemplate(templateEditor,isSaveAs = false){
        if(templateEditor.isEditing && !isSaveAs){
          window.myWindowAPI.fileAPI.writeJson(templateEditor.fullPath,JSON.stringify(configTemplate.value,null,2))
          templateEditor.isEditing = false
          templateEditor.fullPath = ''
          mapTemplateObj.value = null
          mapTemplateObj.value = templateEditor.opt
          proxy.$refs['template-select'].hidePopup() 
          proxy.$q.notify({type:'positive',message:'保存成功'})
        }
        else{
          console.log('保存模板路径1->',store.state.app.config.rememberTemplatePath)
          window.myWindowAPI.saveTemplateDialog(JSON.stringify(configTemplate.value,null,2),store.state.app.config.rememberTemplatePath).then((savedFile)=>{
            if(isSaveAs){
              addTemplateDialog.value = false
              proxy.$refs['template-select'].hidePopup()
            }
            proxy.$q.notify({type:'positive',message:'保存成功'})
            store.commit('app/setRememberTemplatePath',savedFile.dirname)
            console.log('保存模板路径2->',store.state.app.config.rememberTemplatePath)
            reloadTemplateFiles()
          }).catch(err=>{
            console.log('err->',err)
          })
        }
      }
    }
  },
})
</script>
<style lang="scss">
  #drop-area{
    height: calc(100vh - 92px);
    margin: 0 10px 0 10px;
  }
  .q-page-container{
    height: 100vh;
    overflow: hidden;
  }
  .file-row .q-btn__content{
    justify-content: space-between;
    padding: 0 30px;
  }
   .fileList-row,.filedesc-row{
     flex-direction: column;
     text-align: left;
   }
  .fileList-row{
    
    overflow: hidden;
  }
  .text-tip{
    font-family: "Arial","Microsoft YaHei","黑体","宋体",sans-serif;
    font-size: 1.5em;
    text-align: center;
    padding-top: 28%;
  }
  .map-text-format{
    white-space: pre-wrap;
    padding-left: 20%;
  }
  .map-text-not-format{
    white-space: pre-wrap;
  }

</style>
<style scoped>
  >>>.q-item__label--caption,>>>.q-item__section--side{
    color: white;
  }
  >>>.template-select .q-field__control-container{
    min-width: 140px;

}
  >>>.template-row .q-field__label{
    color:teal
  }

  .template-content .q-pb-none{
    padding-bottom: 16px;
  }

</style>