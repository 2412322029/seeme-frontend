<template>
  <div class="toolbox-container">
    <n-tabs type="card" size="large" default-value="string">
      <n-tab-pane name="string" tab="文本MD5">
        <div class="md5-container">
          <div class="input-section">
            <n-form :model="stringForm" label-placement="top">
              <n-form-item label="文本输入">
                <n-input v-model:value="stringForm.inputText" type="textarea" :rows="6"
                  placeholder="请输入要计算MD5哈希的文本内容..." />
              </n-form-item>
              <n-form-item>
                <n-space>
                  <n-button type="primary" @click="hashString" :disabled="!stringForm.inputText">
                    计算MD5哈希
                  </n-button>
                  <n-button @click="clearString">清空</n-button>
                  <n-button @click="copyStringResult" :disabled="!stringResult">
                    复制结果
                  </n-button>
                </n-space>
              </n-form-item>
            </n-form>
          </div>

          <div class="result-section" v-if="stringResult">
            <n-divider>计算结果</n-divider>
            <n-card size="small" title="MD5哈希值">
              <code class="hash-result">{{ stringResult }}</code>
              <div class="hash-info">
                <n-text type="info" style="font-size: 12px;">
                  32位小写MD5哈希值
                </n-text>
              </div>
            </n-card>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="file" tab="文件MD5">
        <div class="md5-container">
          <div class="input-section">
            <n-form :model="fileForm" label-placement="top">
              <n-form-item label="文件上传">
                <n-upload
                  v-model:file-list="fileForm.fileList"
                  :max="1"
                  :auto-upload="false"
                  @change="handleFileChange"
                >
                  <n-button>
                    <template #icon>
                      <n-icon>
                        <upload />
                      </n-icon>
                    </template>
                    选择文件
                  </n-button>
                </n-upload>
              </n-form-item>
              <n-form-item>
                <n-space>
                  <n-button type="primary" @click="hashFile" :disabled="!fileForm.fileList.length">
                    计算文件MD5
                  </n-button>
                  <n-button @click="clearFile">清空</n-button>
                  <n-button @click="copyFileResult" :disabled="!fileResult">
                    复制结果
                  </n-button>
                </n-space>
              </n-form-item>
            </n-form>
          </div>

          <div class="result-section" v-if="fileResult">
            <n-divider>计算结果</n-divider>
            <n-card size="small" title="文件MD5哈希值">
              <div class="hash-result">{{ fileResult }}</div>
              <div class="hash-info">
                <n-text type="info" style="font-size: 12px;">
                  文件: {{ fileForm.fileList[0].name }}<br>
                  32位小写MD5哈希值
                </n-text>
              </div>
            </n-card>
          </div>
          
          <div class="result-section" v-if="isCalculating">
            <n-divider>计算中</n-divider>
            <n-card size="small">
              <n-space>
                <n-spin size="large" />
                <n-text>正在计算文件MD5哈希值...</n-text>
              </n-space>
            </n-card>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="hex" tab="十六进制MD5">
        <div class="md5-container">
          <div class="input-section">
            <n-form :model="hexForm" label-placement="top">
              <n-form-item label="十六进制字符串输入">
                <n-input v-model:value="hexForm.inputHex" type="textarea" :rows="6"
                  placeholder="请输入要计算MD5哈希的十六进制字符串..." />
              </n-form-item>
              <n-form-item>
                <n-space>
                  <n-button type="primary" @click="hashHex" :disabled="!hexForm.inputHex">
                    计算MD5哈希
                  </n-button>
                  <n-button @click="clearHex">清空</n-button>
                  <n-button @click="copyHexResult" :disabled="!hexResult">
                    复制结果
                  </n-button>
                </n-space>
              </n-form-item>
            </n-form>
          </div>

          <div class="result-section" v-if="hexResult">
            <n-divider>计算结果</n-divider>
            <n-card size="small" title="MD5哈希值">
              <div class="hash-result">{{ hexResult }}</div>
              <div class="hash-info">
                <code type="info" style="font-size: 12px;">
                  32位小写MD5哈希值
                </code>
              </div>
            </n-card>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { Upload } from '@vicons/fa';
import { NButton, NCard, NDivider, NForm, NFormItem, NIcon, NInput, NSpace, NSpin, NTabPane, NTabs, NText, NUpload } from 'naive-ui';
import { reactive, ref } from 'vue';
import MD5Hash from '../../core/md5.js';

// 创建MD5Hash实例
const md5 = new MD5Hash();


// 响应式数据 - 字符串哈希
const stringForm = reactive({
  inputText: ''
});

const stringResult = ref('');

// 响应式数据 - 文件哈希
const fileForm = reactive({
  fileList: []
});

const fileResult = ref('');
const isCalculating = ref(false);

// 响应式数据 - 十六进制哈希
const hexForm = reactive({
  inputHex: ''
});

const hexResult = ref('');

// 文件变化处理
function handleFileChange(fileList) {
  // 文件列表变化时的处理
  if (fileList.length > 0) {
    fileResult.value = '';
  }
}

// 计算字符串MD5
function hashString() {
  try {
    stringResult.value = md5.hash(stringForm.inputText);
  } catch (error) {
    console.error('计算字符串MD5失败:', error);
  }
}

// 计算文件MD5
async function hashFile() {
  if (fileForm.fileList.length > 0) {
    try {
      isCalculating.value = true;
      const file = fileForm.fileList[0].file;
      fileResult.value = await md5.hashFile(file);
    } catch (error) {
      console.error('计算文件MD5失败:', error);
    } finally {
      isCalculating.value = false;
    }
  }
}

// 计算十六进制字符串MD5
function hashHex() {
  try {
    hexResult.value = md5.hashHex(hexForm.inputHex);
  } catch (error) {
    console.error('计算十六进制MD5失败:', error);
  }
}

// 清空字符串哈希
function clearString() {
  stringForm.inputText = '';
  stringResult.value = '';
}

// 清空文件哈希
function clearFile() {
  fileForm.fileList = [];
  fileResult.value = '';
}

// 清空十六进制哈希
function clearHex() {
  hexForm.inputHex = '';
  hexResult.value = '';
}

// 复制字符串哈希结果
function copyStringResult() {
  if (stringResult.value) {
    navigator.clipboard.writeText(stringResult.value).then(() => {
      console.log('字符串MD5结果已复制到剪贴板');
    });
  }
}

// 复制文件哈希结果
function copyFileResult() {
  if (fileResult.value) {
    navigator.clipboard.writeText(fileResult.value).then(() => {
      console.log('文件MD5结果已复制到剪贴板');
    });
  }
}

// 复制十六进制哈希结果
function copyHexResult() {
  if (hexResult.value) {
    navigator.clipboard.writeText(hexResult.value).then(() => {
      console.log('十六进制MD5结果已复制到剪贴板');
    });
  }
}
</script>

<style scoped>
.toolbox-container {
  padding: 10px;
}

.md5-container {
  padding: 10px 0;
}

.input-section {
  margin-bottom: 15px;
}

.result-section {
  margin-top: 15px;
}

.hash-result {
  font-family: 'Courier New', Courier, monospace;
  font-size: 16px;
  word-break: break-all;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.hash-info {
  text-align: right;
}
</style>