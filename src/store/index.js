import Vue from "vue";
import Vuex from "vuex";
import showModel from "./modules/showModel";
Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    showModel
  }
});
