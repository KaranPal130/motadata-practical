<template>
  <div id="app">
    <a-layout>
      <a-layout-header class="header">
        <h1>Email Recipients Manager</h1>
      </a-layout-header>
      <a-layout-content class="main-content">
        <email-manager />
      </a-layout-content>
      <a-layout-footer class="footer">
        Made for Motadata Frontend Assignment
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import EmailManager from './components/EmailManager.vue';

export default defineComponent({
  name: 'App',
  components: {
    EmailManager
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  height: 100vh;
}

.header {
  background: #fff;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
}

.header h1 {
  color: #1890ff;
  margin: 0;
}

.main-content {
  padding: 24px;
  min-height: calc(100vh - 134px);
  background: #f0f2f5;
}

.footer {
  text-align: center;
  padding: 20px;
  background: #fff;
}
</style>