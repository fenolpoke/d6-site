<template>
  <v-layout>
    <v-flex class="text-center">     
      <blockquote class="blockquote">
        &#8220;Only the wisest may pass.&#8221;
        <footer>
          <small>
            <em>&mdash;Developer</em>
          </small>
        </footer>
      </blockquote>

      <v-form ref="form" v-model="valid" lazy-validation >
        <v-text-field
          v-model="username"
          :rules="[rules.required]"
          label="Username"
          required
        ></v-text-field>

        <v-text-field
            v-model="password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[rules.required]"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            required
            @click:append="showPassword = !showPassword"
          ></v-text-field>

        <v-btn :disabled="!valid" @click="login" >
          Login
        </v-btn>
      </v-form>      
    </v-flex>
  </v-layout>
</template>

<script>
  import axios from '~/plugins/axios'

  export default{
    data () {
      return {
        valid: false,
        showPassword: false,
        username: '',
        password: '',
        rules: {
          required: value => !!value || 'Required.',
        },
      }
    },
    methods:{
      login(){
        let res = this.$refs.form.validate()
        if(!res){
          alert('Check again!')
          return
        }
        let json = {
          'username': this.$data.username,
          'password': this.$data.password
        }
        axios.post('login', json)
          .then(res => {
            if(res.data.successMessage){
              this.$store.commit('authenticate')
              this.$router.replace({path:'/settings'})          
            }else{
              alert('Check again!')
            }      
          })
          .catch(err => {
            console.log('login err', err)
          })
      }
    },
  }
</script>