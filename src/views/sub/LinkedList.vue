<script setup lang="ts">
import {
  ElButton,
  ElRow,
  ElInputNumber,
  ElCol,
  ElMessage,
  ElTabs,
  ElTabPane,
  ElDivider,
} from 'element-plus';
import { Promotion } from '@element-plus/icons-vue';
import HighLightJS from '@highlightjs/vue-plugin';
import { reactive, ref } from 'vue';
import { loadEmscripten } from './wasm/loadEmscripten';
const HighLight = HighLightJS.component;
const code = `/**
 * @file LinkedList.cpp
 * @author 202100800153严一涵 (yyhhenry@foxmail.com)
 * @brief LinkedList implementation of 约瑟夫生者死者游戏
 * @version 0.1
 * @date 2023-02-27
 *
 * @copyright Copyright (c) 2023
 *
 */
#include <algorithm>
#include <emscripten.h>
#include <functional>
#include <iostream>
#include <memory>
#include <sstream>
#include <stdexcept>
#include <string>
using std::literals::string_literals::operator""s;
template <typename Element>
class LinkedList {
private:
    struct LinkNode {
        Element data;
        std::shared_ptr<LinkNode> next;
    };
    std::shared_ptr<LinkNode> head;
    std::shared_ptr<LinkNode> tail;
    size_t listSize;

public:
    LinkedList() : head(nullptr), tail(nullptr), listSize(0) {}
    class Ref {
    private:
        std::shared_ptr<LinkNode> current;
        std::shared_ptr<LinkNode> previous;

    public:
        Ref operator++(int) {
            Ref tmp = *this;
            previous = current;
            current = current->next;
            return tmp;
        }
        Ref() : current(nullptr), previous(nullptr) {}
        Ref(std::shared_ptr<LinkNode> current,
            std::shared_ptr<LinkNode> previous) : current(current), previous(previous) {}
        Ref(const Ref &other) : current(other.current), previous(other.previous) {}
        Element &operator*() { return current->data; }
        bool finished() const { return current == nullptr; }
        friend class LinkedList;
    };
    Ref next(const Ref &ref) {
        if (ref.current->next == nullptr) {
            return begin();
        }
        return Ref(ref.current->next, ref.current);
    }
    Ref begin() { return Ref(head, nullptr); }
    size_t size() const { return listSize; }
    void push(const Element &element) {
        listSize++;
        auto node = std::shared_ptr<LinkNode>(new LinkNode{element, nullptr});
        if (head == nullptr) {
            head = node;
            tail = head;
        } else {
            tail->next = node;
            tail = node;
        }
    }
    Ref removeAt(const Ref &ref) {
        listSize--;
        ref.previous->next = ref.current->next;
        return next(Ref(ref.previous, nullptr));
    }
};
struct InputData {
    // The number of tourists
    int n;
    // The interval between two operations
    int m;
    // The number of tourists after the operations
    int k;
    // Function to print the failers
    std::function<void(int)> printFailer;
    // Function to print the winners
    std::function<void(int)> printWinner;
};
void solve(const InputData &inputData) {
    LinkedList<int> tourists;

    auto initTourists = [&]() {
        for (int i = 0; i < inputData.n; i++) {
            auto number = i + 1;
            tourists.push(number);
        }
    };
    initTourists();
    auto ref = tourists.begin();

    auto dropNextTourist = [&]() {
        for (int i = 1; i < inputData.m; i++) {
            ref = tourists.next(ref);
        }
        auto tourist = *ref;
        ref = tourists.removeAt(ref);
        inputData.printFailer(tourist);
    };

    while (tourists.size() > inputData.k) {
        dropNextTourist();
    }
    for (auto i = tourists.begin(); !i.finished(); i++) {
        inputData.printWinner(*i);
    }
}
extern "C" {
EM_JS(void, printFailer, (int x), {
    Module.printFailer(x);
});
EM_JS(void, printWinner, (int x), {
    Module.printWinner(x);
});
EMSCRIPTEN_KEEPALIVE
const char *solveMain(int n, int m, int k) {
    InputData inputData{n, m, k};
    std::stringstream ss;
    inputData.printFailer = printFailer;
    inputData.printWinner = printWinner;
    solve(inputData);
    auto resultStr = ss.str();
    char *resultCharPtr = new char[resultStr.size()];
    strcpy(resultCharPtr, resultStr.c_str());
    return resultCharPtr;
}
}
/*
emcc LinkedList.cpp -o LinkedList.js -O3 -sEXPORTED_RUNTIME_METHODS=cwrap -sMODULARIZE
*/
`;
const inputData = reactive({
  n: 30,
  m: 9,
  k: 15,
});
const output = reactive({
  message: '',
  failers: [] as number[],
  winners: [] as number[],
});
const onClick = async () => {
  if (Math.min(inputData.n, inputData.m, inputData.k) < 0 || inputData.m == 0) {
    ElMessage({ message: '不满足题目约束条件', type: 'error' });
  }
  output.message = '';
  output.failers = [];
  output.winners = [];
  const LinkedList = await loadEmscripten<{
    solveMain: (n: number, m: number, k: number) => string;
  }>(await import('./wasm/LinkedList.js'), {
    locateFile: (pathname: string) =>
      new URL(`wasm/${pathname}`, location.href).href,
    printFailer: (x: number) => {
      output.failers.push(x);
    },
    printWinner: (x: number) => {
      output.winners.push(x);
    },
  });
  const solveMain = LinkedList('solveMain', 'string', [
    'number',
    'number',
    'number',
  ]);
  solveMain(inputData.n, inputData.m, inputData.k);
  tabName.value = 'Output';
  output.message = [
    `The tourists numbered ${JSON.stringify(
      output.failers
    )} have been thrown out.`,
    `The tourists numbered ${JSON.stringify(
      output.winners
    )} survived at last.\n`,
  ].join('\n');
};
const tabName = ref<'Output' | 'Code'>('Code');
</script>
<template>
  <ElRow style="margin: 5px">
    <ElButton :type="'danger'" @click="onClick()" :icon="Promotion">
      Run Code (LinkedList)
    </ElButton>
  </ElRow>
  <ElRow style="margin: 5px">
    <span style="margin: 5px">
      <span style="padding: 5px">人数</span>
      <ElInputNumber v-model="inputData.n"> </ElInputNumber>
    </span>
    <span style="margin: 5px">
      <span style="padding: 5px">报数上限</span>
      <ElInputNumber v-model="inputData.m"> </ElInputNumber>
    </span>
    <span style="margin: 5px">
      <span style="padding: 5px">剩余人数</span>
      <ElInputNumber v-model="inputData.k"> </ElInputNumber>
    </span>
  </ElRow>
  <ElTabs v-model="tabName" style="font-family: Consolas">
    <ElTabPane :label="'Code'" :name="'Code'">
      <HighLight :code="code" :language="'cpp'"></HighLight>
    </ElTabPane>
    <ElTabPane :label="'Output'" :name="'Output'">
      <HighLight :code="output.message" :language="'txt'"></HighLight>
      <ElRow v-if="output.message != ''">
        <ElDivider></ElDivider>
        <ElCol>被扔下去的人:</ElCol>
        <span v-for="id of output.failers">
          <ElButton>{{ id }}</ElButton>
        </span>
        <ElDivider></ElDivider>
        <ElCol>最后留下的人:</ElCol>
        <span v-for="id of output.winners">
          <ElButton>{{ id }}</ElButton>
        </span>
      </ElRow>
    </ElTabPane>
  </ElTabs>
</template>
