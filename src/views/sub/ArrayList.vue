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
 * @file ArrayList.cpp
 * @author 202100800153严一涵 (yyhhenry@foxmail.com)
 * @brief ArrayList implementation of 约瑟夫生者死者游戏
 * @version 0.1
 * @date 2023-02-26
 *
 * @copyright Copyright (c) 2023
 *
 */
#include <algorithm>
#include <cstring>
#include <emscripten.h>
#include <functional>
#include <iostream>
#include <memory>
#include <sstream>
#include <stdexcept>
#include <string>
using std::literals::string_literals::operator""s;
template <typename Element>
class ArrayList {
private:
    static const size_t MIN_SIZE;
    std::shared_ptr<Element[]> elements;
    size_t bufferSize;
    size_t listSize;
    void realloc(size_t newSize) {
        auto newElements = std::shared_ptr<Element[]>(new Element[newSize]());
        for (size_t i = 0; i < bufferSize && i < newSize; i++) {
            newElements[i] = elements[i];
        }
        elements = newElements;
        bufferSize = newSize;
    }
    void beforeInsert() {
        if (listSize + 1 > bufferSize) {
            realloc(std::max(MIN_SIZE, bufferSize * 2));
        }
    }
    void afterDelete() {
        if (listSize * 4 < bufferSize) {
            realloc(std::max(MIN_SIZE, bufferSize / 2));
        }
    }
    void moveTo(size_t src, size_t dst) {
        auto direction = src < dst ? 1 : -1;
        auto srcElem = elements[src];
        for (size_t i = src; i != dst; i += direction) {
            elements[i] = elements[i + direction];
        }
        elements[dst] = srcElem;
    }

public:
    ArrayList() : elements(new Element[MIN_SIZE]()), bufferSize(0), listSize(0) {}
    ArrayList(ArrayList &&other) : elements(other.elements), bufferSize(other.bufferSize), listSize(other.listSize) {}
    size_t size() const { return listSize; }
    void push(const Element &element) {
        beforeInsert();
        elements[listSize++] = element;
    }
    void insertBefore(const Element &element, const size_t index) {
        if (index < 0 || index > listSize) {
            throw std::out_of_range("ArrayList::insertBefore() Index out of range");
        }
        push(element);
        moveTo(listSize - 1, index);
    }
    Element pop() {
        if (listSize == 0) {
            throw std::out_of_range("ArrayList::pop() size should not be zero");
        }
        auto result = elements[listSize - 1];
        listSize--;
        afterDelete();
        return result;
    }
    Element removeAt(const size_t index) {
        if (index < 0 || index >= listSize) {
            throw std::out_of_range("ArrayList::removeAt() index out of bounds");
        }
        moveTo(index, listSize - 1);
        return pop();
    }
    Element at(const size_t index) {
        if (index < 0 || index >= listSize) {
            throw std::out_of_range("ArrayList::at() index out of bounds");
        }
        return elements[index];
    }
};
template <typename Element>
const size_t ArrayList<Element>::MIN_SIZE = 2;
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
    ArrayList<int> tourists;
    int index = 0;

    auto initTourists = [&]() {
        for (int i = 0; i < inputData.n; i++) {
            auto number = i + 1;
            tourists.push(number);
        }
    };
    auto dropNextTourist = [&]() {
        index = (index + inputData.m - 1) % tourists.size();
        auto tourist = tourists.removeAt(index);
        inputData.printFailer(tourist);
    };

    initTourists();
    while (tourists.size() > inputData.k) {
        dropNextTourist();
    }
    for (auto i = 0; i < tourists.size(); i++) {
        inputData.printWinner(tourists.at(i));
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
emcc ArrayList.cpp -o ArrayList.js -O3 -sEXPORTED_RUNTIME_METHODS=cwrap -sMODULARIZE
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
  const ArrayList = await loadEmscripten<{
    solveMain: (n: number, m: number, k: number) => string;
  }>(await import('./wasm/ArrayList.js'), {
    locateFile: (pathname: string) =>
      new URL(`wasm/${pathname}`, location.href).href,
    printFailer: (x: number) => {
      output.failers.push(x);
    },
    printWinner: (x: number) => {
      output.winners.push(x);
    },
  });
  const solveMain = ArrayList('solveMain', 'string', [
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
      Run Code (ArrayList)
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
