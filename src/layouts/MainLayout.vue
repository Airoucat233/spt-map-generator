<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="q-electron-drag">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-electron-drag--exception"
        />

        <q-toolbar-title>
          插件映射生成器
        </q-toolbar-title>

        <section style="-webkit-app-region: no-drag">
          <q-btn id="minbt" flat icon="mdi-window-minimize" @click="minimize" ></q-btn>
          <q-btn id="maxbt" flat :icon="maxWindow===false?'crop_square':'mdi-window-restore'" @click="toggleMaximize"></q-btn>
          <q-btn id="closebt" flat icon="mdi-window-close" @click="closeApp"></q-btn>
        </section>
      </q-toolbar>

      <q-bar id="menu-bar" class="q-electron-drag--exception" style="padding:0">
        <div style="padding:4px 4px 4px 8px">
          文件
          <q-menu>
            <q-list dense >
              <q-item clickable v-close-popup @click="alert('111')">
                  <q-item-section>打开</q-item-section>
                </q-item>
                <q-item clickable v-close-popup>
                  <q-item-section>打开最近...</q-item-section>
                </q-item>
            </q-list>
          </q-menu>
        </div>
        <div style="padding:4px 4px 4px 4px;margin:0">编辑
          <q-menu>
            <q-list dense >
              <q-item clickable v-close-popup>
                  <q-item-section>Open...</q-item-section>
                </q-item>
                <q-item clickable v-close-popup>
                  <q-item-section>New</q-item-section>
                </q-item>
            </q-list>
          </q-menu>
        </div>
        <div>设置</div>

      </q-bar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'


const linksList = [
  {
    title: 'Home',
    caption: 'quasar.dev',
    icon: 'home',
    link: '#/main'
  },
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev'
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev'
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev'
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev'
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev'
  }
];

import { defineComponent, ref , onMounted,onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup () {
    const store = useStore()
    const leftDrawerOpen = ref(false)
    const maxWindow = ref(false)
    onMounted(()=>{
      window.onbeforeunload = ()=>{
        let config = JSON.stringify(store.state.app.config,null,2)
        window.myWindowAPI.fileAPI.writeJson('.\\config.json',config)
        window.myWindowAPI.savedConfig(config)
      }
      // window.gconfig = store.state.app.config
      // console.log('windowc->',window.gconfig)
    })
    onBeforeUnmount(()=>{
      
    })
    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      maxWindow,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      toggleMaximize(){
        if (process.env.MODE === 'electron') {
          //  = !maxWindow.value
          maxWindow.value = window.myWindowAPI.toggleMaximize()
          console.log('maxwindow->',maxWindow.value)
        }
      },
      minimize(){
        if (process.env.MODE === 'electron') {
          window.myWindowAPI.minimize()
        }
      },
      closeApp(){
        if (process.env.MODE === 'electron') {
          window.myWindowAPI.close()
        }
      }
    }
  }
})
</script>
<style lang="scss" scoped>

</style>