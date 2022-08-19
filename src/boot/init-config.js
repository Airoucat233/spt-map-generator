
export default ({ app, router, store, Vue }) => {
    let config = window.myWindowAPI.fileAPI.readJson('.\\config.json')
    console.log('config111->',store.state.app.config)
    if(!config){
        window.myWindowAPI.fileAPI.writeJson('.\\config.json',JSON.stringify(store.state.app.config,null,2))
    }
    else{
        store.commit('app/initConfig',config)
    }

}