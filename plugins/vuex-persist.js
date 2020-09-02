// https://www.smashingmagazine.com/2020/04/getting-started-nuxt/
import VuexPersistence from 'vuex-persist'

export default ({
  store
}) => {
  window.onNuxtReady(() => {
    new VuexPersistence({
      storage: window.localStorage
    }).plugin(store);
  });
}