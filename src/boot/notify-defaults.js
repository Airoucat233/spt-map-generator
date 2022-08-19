import { Notify } from 'quasar'

Notify.setDefaults({
  position: 'top-right',
  timeout: 1500,
  color:'secondary',
  actions: [{ icon: 'close', color: 'white' }]
})