<template>
    <div class="sps-map-pairer" :style="{height:height + 'px'}">

    <!-- <q-dialog v-model="addTemplate">
        <q-card>
            <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">生成{{sps[spsModel]}}Map</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum repellendus sit voluptate voluptas eveniet porro. Rerum blanditiis perferendis totam, ea at omnis vel numquam exercitationem aut, natus minima, porro labore.
            </q-card-section>
        </q-card>
    </q-dialog>
    <div style="display: flex;justify-content: space-between;margin:5px 0">
        <q-select class="template-select"
                  color="teal" standout="bg-teal-2 text-white"  v-model="mapTemplate" :options="mapTemplatesOptions" 
                  label="选择模板"
                  dense>
         <template v-slot:append>
          <q-btn round dense flat icon="add" @click="addTemplate = true" @click.stop />
          
        </template>
      </q-select>
      
      <div>
        <q-toggle
        v-model="fomatMap"
        color="green"
        label="格式化输出"
        left-label
      />
        <q-btn color="secondary" icon-right="close" label="清除" @click="clearMap(spsModel)"/>
        <q-btn color="secondary" icon-right="send" label="生成" @click="createMap(spsModel)" style="margin-left: 10px;"/>
      </div>
  </div> -->
  <q-btn-toggle
        v-model="generateMap.type"
        spread
        no-caps
        toggle-color="purple"
        color="white"
        text-color="black"
        :options="sps"
      />

    <div class="map-pairer-content">
      <div id="stand-pan" >
        <div v-for="s in template[generateMap.type]" :key=s.id style="text-align: center;margin-top: 5px;display:flex">
          <q-btn push tabindex="-1"
            @click="select(s)"
            :color="s.selected?'blue':'white'"
            :text-color="s.selected?'white':'black'"
            style="width: 150px;height:30px;margin-right:10px"
            >
            {{s.label}}
          </q-btn>
         <q-input filled v-model="generateMap.map[generateMap.type][s.label].value" dense/>
        <div v-if="generateMap.map[generateMap.type][s.label].quotation" style="margin-left:10px">
            <q-badge rounded color="green" title="带有引号"/>
        </div>
        <div v-else style="margin-left:10px">
            <q-badge rounded color="purple" title="不带引号"/>
        </div>
        </div>
      </div>
      <div id="select-pan" style="margin: auto 0;">
        <div v-for="s in cols" :key=s.id style="margin-top: 5px;">
          <q-btn push tabindex="-1"
            @click="select(s,true)"
            :color="s.selected?'blue':'white'"
            :text-color="s.selected?'white':'black'"
            style="width: 150px;height:30px;text-transform:none;"
            >
            {{s.label}}
          </q-btn>
          <span style="margin-left:15px;font-style:italic">{{s.referValue}}</span>
        </div>
      </div>

    </div>
    </div>
</template>

<script>
import { defineComponent,ref,reactive,onMounted,onBeforeMount,watch,getCurrentInstance} from 'vue';
export default defineComponent({
    name:'spsMapPairer',
    // model: {            
    //     prop: 'isFormat',            
    //     event: 'isFormatChanged'        
    // },
    props:{
        filename:{
            type: String,
            default:()=>'',
        },
        columns: {
            type : Array,
            default : ()=>[],
            required : true
        },
        height:{
            type: Number,
            default : ()=>0,
        },
        // isFormat:{
        //     type:Boolean,
        //     default:()=>true
        // },
        map:{
            type:Object,
        },
        mapTemplate:{
            type:Object
        }
    },
    setup(props,context){
        const sps = [
          {label: '销售', value: 'sale'},
          {label: '购进', value: 'purchase'},
          {label: '库存', value: 'stock'}
        ]
        const {proxy} = getCurrentInstance()
        const cols = reactive(props.columns)
        //const template = reactive(props.mapTemplate)
        // const spsModel = ref('sale')
        // const fomatMap = computed({
        //     get:()=>props.isFormat,
        //     set:val=>{
        //         context.emit('update:isFormat',val)
        //     }
        // })
        const generateMap = reactive(props.map)
        // const generateMap = reactive({
        //     sale:{},
        //     purchase:{},
        //     stock:{}
        // })
        // watch(generateMap,()=>{
        //     context.emit('update:map',generateMap)
        // })
        const template = ref(JSON.parse(JSON.stringify(props.mapTemplate)))

        const stands = reactive({
            currentKey:{sale:{},purchase:{},stock:{}},
            currentOpt:{},
            //items:template
        })
        // watch(()=>stands,(newVal,oldVal)=>{
        //     console.log('old->',oldVal)
        //     console.log('变了->',newVal)
        // })
        const loadTemplate = (options={})=>{
            sps.forEach(s=>{
                try{
                    let position = 0
                    let found = false
                    template.value[s.value].forEach(item=>{
                        // if(item.id>position){
                        //     found = true
                        // }
                        generateMap.map[s.value][item.label]={value:item.default,quotation:item.quotation,default:item.default}
                        if(generateMap.map[s.value][item.label].value==null && !found){
                            position=item.id
                            found = true
                        }
                    })
                    // console.log('position->',s.value,position)
                    // if(!found){
                    //     let item = template[s.value][0]
                    //     stands.currentKey[s.value] = {id:item.id,label:item.label}
                    // }
                    let cur = stands.currentKey[s.value].id
                    if(cur){
                        template.value[s.value][cur].selected = false
                    }
                    template.value[s.value][position].selected = true
                    stands.currentKey[s.value] = {id:position,label:template.value[s.value][position].label}
                }catch(err){
                    console.log('err->',err)
                    proxy.$q.notify({type:'warning',message:s.label+'模板读取错误'})
                    context.emit('templateLoadError')
                }
                
            })

        }
        
        watch(()=>props.mapTemplate,(newVal)=>{
            template.value=JSON.parse(JSON.stringify(newVal))
            // console.log('重新加载->',template)
            loadTemplate()
        })
        

        onBeforeMount(()=>{
            if(JSON.stringify(generateMap.map.sale)=='{}'){
                loadTemplate()
            }    
        })
        onMounted(()=>{
            for(let t of sps){
                if(props.filename.includes(t.label) || props.filename.includes(t.value)){
                    generateMap.type = t.value
                    break
                }
            }
        })

        return{
            sps,
            stands,
            cols,
            generateMap,
            template,
            select(s,isTrigger=false){
                // console.log('template->',template.value)
                // let m = spsModel.value
                let m = generateMap.type
                let map = generateMap.map
                let currentKey = stands.currentKey[m]
                // if(JSON.stringify(currentKey)=='{}'){
                //     for (let item of template[m]){
                //         if(item.selected){
                //             stands.currentKey[m] = {id:item.id,label:item.label}
                //             currentKey = stands.currentKey[m]
                //             break
                //         }
                //     }
                // }
                s.selected = !s.selected
                if(isTrigger){
                    if(JSON.stringify(stands.currentOpt)!='{}'){
                        cols[stands.currentOpt.id].selected = false
                    }
                    stands.currentOpt = {id:s.id,label:s.label,value:s.value}
                    cols[stands.currentOpt.id].selected = true
                    
                    if(JSON.stringify(currentKey)=='{}'){
                        proxy.$q.notify('请先选择要设置的Key')
                        return
                    }
                    if(JSON.stringify(map[m])=='{}'){
                        for(let item of template.value[m]){
                            map[m][item.label] = {value:item.default,quotation:item.quotation}
                        }
                    }
                    map[m][currentKey.label].value = s.label
                    let cur = currentKey.id//这个id当数组索引用
                    template.value[m][cur].selected = false
                    if (cur<template.value[m].length-1){
                        cur++
                        template.value[m][cur].selected = true
                        stands.currentKey[m] = {id:cur,label:template.value[m][cur].label}
                    }
                    else{
                        stands.currentKey[m]={}
                    }
                    // console.log('map->',JSON.stringify(map[m]))
                }
                else{
                    if(JSON.stringify(currentKey)!='{}'&& currentKey.id!=s.id){
                        template.value[m][currentKey.id].selected = false
                    }
                    stands.currentKey[m] = {id:s.id,label:s.label}
                }

            },
        }
        
    }

})
</script>

<style  scoped>
>>>.q-field--dense .q-field__control{
    height: 36px;
}

/* .sps-map-pairer{
    overflow: auto;
} */
.sps-map-pairer{
    display: flex;
    flex-direction: column;
}
.map-pairer-content{
    display:flex;
    overflow:auto;
    margin-top:10px;
    justify-content: space-evenly;
}
</style>

<style>

</style>