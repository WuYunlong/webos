import { createApp } from 'vue'
import App from './App.vue'

import './assets/scss/reset.scss'
import 'virtual:svg-icons-register'

import Directives from './directives'

import OsIcon from './components/OsIcon.vue'
import FileManager from './components/apps/FileManager.vue'
import VideoPlayer from './components/apps/VideoPlayer.vue'

const app = createApp(App)
app.use(Directives)
app.component('os-icon', OsIcon)
app.component('FileManager', FileManager)
app.component('VideoPlayer', VideoPlayer)
app.mount('#app')
