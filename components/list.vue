<template>
  <div>
    <v-card flat
        v-for="item in items"
        :key="item.id"     
        @click="$emit('open', item)"
    >
        <v-card-text> 
            {{ titleFields.map(f => item[f]).join(' - ') }}
            <div v-if="!readOnly" >
                <v-btn @click="$emit('edit', item)">Edit</v-btn> 
                <v-btn :disabled="submitting" @click="$emit('del', item)">Delete</v-btn>
            </div>
        </v-card-text>
    </v-card>
    <infinite-loading spinner="spiral" @infinite="infiniteLoad" >
        <div slot="no-results"></div>
        <div slot="no-more"></div>
    </infinite-loading>
  </div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  props: {
      apiUrl: String,
      params: Object,
      readOnly: Boolean,
      titleFields: Array,
      items: Array,
      submitting: Boolean,
  },
  data(){
    return {
        loading: false,
        page: 1,
    }
  },
  methods:{
    infiniteLoad($state){      
      if(this.$data.page < 1){
        $state.complete()
        return
      }
      if(this.$data.loading) return
      
      this.$data.loading = true

      setTimeout(() => {
        axios.get(this.apiUrl, {
                params: {
                    ...this.params,
                    page: this.$data.page
                }
        })
        .then(res => {
            let data = res.data.result
            let has_next = res.data.has_next
            if(data.length > 0){
                if(has_next)
                    this.$data.page++
                else
                    this.$data.page=-1

                this.items.push(...data)
            }else
                this.$data.page=-1

        })
        .catch(err => {
            console.log('infinite load err', err)
        })
        .finally(() => {
            if(this.$data.page < 1){
                $state.complete()              
            }else{
                $state.loaded()            
            }
            this.$data.loading = false
        })
      }, 500);
    },
  },    
}
</script>
