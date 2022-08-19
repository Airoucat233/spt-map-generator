// export function someMutation (state) {
//     return{
//         initConfig:(state,v)=>{
//             state.app.config = v
//         },
//         setRememberTemplatePath: (state,v)=>{
//             state.app.config.rememberTemplatePath = v
//         }
//     }
// }
export default {
    initConfig:(state,v)=>{
        state.config = v
    },
    setRememberTemplatePath: (state,v)=>{
        state.config.rememberTemplatePath = v
    },
    setRememberTemplate: (state,v)=>{
        state.config.rememberTemplate = v
    }
}
