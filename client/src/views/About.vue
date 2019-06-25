<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<script>
import io from 'socket.io-client'
var socket;

export default {
  created() {
    console.log("CREATED");
    socket = io.connect('http://127.0.0.1:3000/',{secure: true, transports: [ 'websocket' ]})
  },
  beforeMount() {
    console.log("beforeMount");  
    socket.on('re_connection', function (data) {
      console.log(data);
      
    })
    socket.on('my_connection', function (data) {
      console.log(data);
      
    })
  },
  mounted() {
    console.log("MOUNTED");
  }
}
</script>
