import Vue from 'vue'
import Vuex from 'vuex'
import createLoadingPlugin from '../plugins/createLoadingPlugin';
Vue.use(Vuex)
const store = new Vuex.Store({
    state:{},
    modules: {},
    plugins: [createLoadingPlugin()],

})
export default store
