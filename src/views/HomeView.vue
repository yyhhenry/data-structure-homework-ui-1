<script setup lang="ts">
import {
  ElContainer,
  ElHeader,
  ElMain,
  ElTabPane,
  ElTabs,
  ElCard,
  ElRow,
  ElScrollbar,
} from 'element-plus';
import TitleView from './TitleView.vue';
import { ref } from 'vue';
import ArrayList from './sub/ArrayList.vue';
import LinkedList from './sub/LinkedList.vue';
const tabName = ref<'ArrayList' | 'LinkedList'>('ArrayList');
</script>
<template>
  <TitleView :title="'数据结构练习一'"></TitleView>
  <ElContainer class="full-height-root">
    <ElHeader class="header-main">
      <h1 style="font-weight: bold">数据结构练习一</h1>
    </ElHeader>
    <ElMain class="no-padding">
      <ElScrollbar style="padding-left: 15px; padding-right: 15px">
        <ElRow :justify="'center'">
          <ElCard :body-style="{ paddingTop: '5px', paddingBottom: '2px' }">
            <ElTabs v-model="tabName" style="font-family: Consolas">
              <ElTabPane :label="'ArrayList'" :name="'ArrayList'"> </ElTabPane>
              <ElTabPane :label="'LinkedList'" :name="'LinkedList'"></ElTabPane>
            </ElTabs>
          </ElCard>
        </ElRow>
        <ElCard v-if="tabName == 'ArrayList'">
          <ArrayList></ArrayList>
        </ElCard>
        <ElCard v-else-if="tabName == 'LinkedList'">
          <LinkedList></LinkedList>
        </ElCard>
      </ElScrollbar>
    </ElMain>
  </ElContainer>
</template>
<style scoped>
.full-height-root {
  height: 100vh;
}
.full-height {
  height: 100%;
}
.header-main {
  display: flex;
  justify-items: center;
  padding: 1rem;
  background: rgb(100, 120, 250);
  color: white;
  margin-left: 15px;
  margin-right: 15px;
  margin-top: -10px;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 6px;
  box-shadow: 0px 0px 10px gray;
}
.no-padding {
  padding: 0px;
  margin: 0px;
}
</style>
