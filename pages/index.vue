<template>
  <v-layout column justify-center align-center >
    <v-flex xs12 sm8 md6 >    
      <v-tabs v-model="tab" fixed-tabs >
        <v-tab v-for="item in items" :key="item.id" >
          {{ item.title }}
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item v-for="item in items" :key="item.id" >
          <list 
            v-bind:apiUrl="item.apiUrl"
            v-bind:params="item.params"
            v-bind:items="item.items"
            readOnly          
            v-bind:titleFields="item.titleFields"
            @open="openNews"
          ></list>
        </v-tab-item>
      </v-tabs-items>    
    </v-flex>

    <v-dialog v-if="!!selectedNews" v-model="dialog" >
      <v-card class="ma-0 pa-1">
        <v-card-title>
          {{ selectedNews.title }}
        </v-card-title>

        <v-card-text>
          {{ selectedNews.content }}
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog=false" >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import List from '~/components/list'
import axios from '~/plugins/axios'

export default {  
  async asyncData(){
    let categoriesData = await axios.get('categories')
    let defaultTabParams = {
      titleFields: ['created_at', 'title'],
      apiUrl: 'news',
      params: {},
      title: 'All',
      id: -1,
      items: [],
    }    
    let tabs = [
      defaultTabParams,
      ...categoriesData.data.result.map(c => {
        return {
          ...defaultTabParams,
          params: {
            category_id: c.id
          },
          id: c.id,
          title: c.name, 
          items: []
        }
      })
    ]    
    return {
      tab: null,
      items: tabs,
      dialog: false,
      selectedNews: null,
    }
  },  
  methods:{
    async openNews(news){
      if(news.content == undefined){
        let res = await axios.get('news/'+ news.id)
        news.content = res.data.result.content
      }
      this.$data.selectedNews = news
      this.$data.dialog = true
    },
  },
}
</script>
