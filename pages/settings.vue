<template>
  <v-layout>
    <v-flex class="text-center">      
      <blockquote class="blockquote">
        &#8220;I hope you know what you're doing.&#8221;
        <footer>
          <small>
            <em>&mdash;Developer</em>
          </small>
        </footer>
      </blockquote>
    
      <v-tabs fixed-tabs v-model="tab" >
        <v-tab v-for="(item, value) in items" :key="value" >
          {{ value }}
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item v-for="(item, value) in items" :key="value" >
          <v-btn 
            v-if="value != TYPES.CATEGORIES || item.items.length < 4"
            :disabled="submitting"
            @click="create(value)"
          >
            {{ ACTIONS.CREATE }}
          </v-btn>

          <list 
            v-bind:apiUrl="item.apiUrl"
            v-bind:titleFields="item.titleFields"
            v-bind:items="item.items"
            v-bind:submitting="submitting"
            @edit="edit(value, ...arguments)"
            @del="del(value, ...arguments)"
          ></list>
        </v-tab-item>
      </v-tabs-items>
    </v-flex>
    
    <v-dialog 
      v-if="!!items[TYPES.NEWS].selected"           
      v-model="items[TYPES.NEWS].dialog"
    >
      <v-card class="ma-0 pa-1">
        <v-card-title>
          {{ action }} 
          {{ 
              !!items[TYPES.NEWS].selected.created_at ? 
                items[TYPES.NEWS].selected.created_at + 
                ' - ' + 
                items[TYPES.NEWS].selected.title : TYPES.NEWS 
          }}
        </v-card-title>
        
        <v-card-text>
          <v-select
            v-model="items[TYPES.NEWS].selected.category"
            @input="setCategoryId"
            :items="categories"
            item-text="name"
            item-value="id"
            label="Select Category"
            return-object
            single-line
          ></v-select>

          <v-text-field
            v-model="items[TYPES.NEWS].selected.title"
            label="Title"
            required
          ></v-text-field>
          
          <v-textarea
            v-model="items[TYPES.NEWS].selected.content"
            label="Content"
            required            
          ></v-textarea>
        </v-card-text>

        <v-card-actions>
          <v-btn
            :disabled="submitting || !newsValid(items[TYPES.NEWS].selected)"
              @click="submit(TYPES.NEWS, action, items[TYPES.NEWS].selected)"
            >
              {{ action }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <v-dialog 
      v-if="!!items[TYPES.CATEGORIES].selected"           
      v-model="items[TYPES.CATEGORIES].dialog"
    >
        <v-card class="ma-0 pa-1">
          <v-card-title>
            {{ action }} {{ !!items[TYPES.CATEGORIES].selected.name ? items[TYPES.CATEGORIES].selected.name : 'Category' }}
          </v-card-title>
          
          <v-card-text>
            <v-text-field
              v-model="items[TYPES.CATEGORIES].selected.name"
              label="Name"
              required
            ></v-text-field>
          </v-card-text>

          <v-card-actions>
            <v-btn
              :disabled="submitting || !categoryValid(items[TYPES.CATEGORIES].selected)"
                @click="submit(TYPES.CATEGORIES, action, items[TYPES.CATEGORIES].selected)"
              >
              {{ action }}
            </v-btn>
          </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
  import List from '~/components/list'
  import axios from '~/plugins/axios'
  
  export const TYPES = {
    NEWS: 'News',
    CATEGORIES: 'Categories'
  }

  export const ACTIONS = {
    CREATE: 'Create',
    EDIT: 'Edit',
    DELETE: 'Delete'
  }

  export default{
    middleware: "authenticated",
    async asyncData(){      
      let categoryData = await axios.get('categories')
      let categories = categoryData.data.result.map(res=>{
            return {
              id: res.id,
              name: res.name,
            }
          })  
      let tabs = {
        [TYPES.NEWS]: {
          apiUrl: 'news',
          titleFields: ['created_at', 'title'],
          items: [],
          selected: null,
          dialog: false
        },
        [TYPES.CATEGORIES]: {
          apiUrl: 'categories',
          titleFields: ['name'],
          items: [],
          selected: null,
          dialog: false
        }
      }
      return {
          TYPES,
          ACTIONS,
          action: '',
          submitting: false,
          tab: null,
          items: tabs,
          categories,
        }
    },
    methods: {
      create(type){
        this.$data.action = ACTIONS.CREATE
        
        this.$data.items[type].selected = {}
        this.$data.items[type].dialog = true
      },
      edit(type, item){
        axios.get(`${this.$data.items[type].apiUrl}/${item.id}`)
            .then(res => {            
              this.$data.action = ACTIONS.EDIT
              let item = res.data.result
              this.$data.items[type].selected = {
                ...item
              }
              if(type == TYPES.NEWS){
                this.$data.items[type].selected.category = 
                  this.$data.categories.filter(c => c.id == item.category_id)[0]
              }
              this.$data.items[type].dialog = true
            })
            .catch(err => {
              console.log('err edit', err)
            })

      },
      del(type, item){
        this.$data.submitting = true
        axios.delete(`${this.$data.items[type].apiUrl}/${item.id}`)
          .then(res => {
            if(res.data.successMessage){
              let items = this.$data.items[type].items
              items.splice(items.findIndex(i => i.id == item.id), 1)
            }
          })
          .catch(err => {
            console.log('err', err)
          })
          .finally(()=>{
            this.$data.submitting = false
          })
      },
      submit(type, action, item){   
        if(action == ACTIONS.CREATE){          
          this.$data.submitting = true
          axios.post(this.$data.items[type].apiUrl, item)
            .then(res => {
              this.$data.items[type].items.unshift(res.data.result)
            })
            .catch(err => {
              alert('error! ' +  err.msg)
            })
            .finally(()=>{
              this.$data.submitting = false
              this.$data.items[type].dialog = false
            })
        }else if(action == ACTIONS.EDIT){
          this.$data.submitting = true
          axios.put(`${this.$data.items[type].apiUrl}/${item.id}`, item)
            .then(res => {
              let newItem = res.data.result
              let oldItem = this.$data.items[type].items.filter(n => n.id == newItem.id)[0]
              for(const field in newItem){
                oldItem[field] = newItem[field]
              }
            })
            .catch(err => {
              console.log('err', err)
            })
            .finally(()=>{
              this.$data.submitting = false
              this.$data.items[type].dialog = false
            })
        }else{
            this.$data.items[type].dialog = false
        }
      },
      newsValid(news){
        return !!news.title && !!news.content && !!news.category 
      },
      categoryValid(category){
        return !!category.name 
      },
      setCategoryId(item){
        this.$data.items[TYPES.NEWS].selected.category_id = item.id
      }
    }
  }
</script>
