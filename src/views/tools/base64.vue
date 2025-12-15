<template>
  <div class="toolbox-container">
    <n-tabs type="card" size="large" default-value="encode">
      <n-tab-pane name="encode" tab="Base64编码">
        <div class="encoder-container">
          <div class="input-section">
            <n-form :model="encodeForm" label-placement="top">
              <n-form-item label="文本输入">
                <n-input v-model:value="encodeForm.inputText" type="textarea" :rows="6"
                  placeholder="请输入要编码的文本内容..." />
              </n-form-item>
              <n-form-item label="文件上传">
                <n-upload
                  v-model:file-list="encodeForm.fileList"
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
                <n-text v-if="encodeForm.fileList.length > 0" type="info" style="margin-left: 12px;">
                  {{ encodeForm.fileList[0].name }}
                </n-text>
              </n-form-item>
              <n-form-item label="字符编码">
                <n-select v-model:value="encodeForm.encoding" :options="supportedEncodings"
                  placeholder="选择字符编码" />
              </n-form-item>
              <n-form-item>
                <n-checkbox v-model:checked="encodeForm.urlSafe">URL安全编码</n-checkbox>
              </n-form-item>
              <n-form-item>
                <n-space>
                  <n-button type="primary" @click="encodeData" :disabled="!canEncode">
                    编码
                  </n-button>
                  <n-button @click="clearEncode">清空</n-button>
                  <n-button @click="copyEncodeResult" :disabled="!encodeResult">
                    复制结果
                  </n-button>
                </n-space>
              </n-form-item>
            </n-form>
          </div>

          <div class="result-section" v-if="encodeResult">
            <n-divider>编码结果</n-divider>
            <n-card size="small" title="Base64编码结果" class="result-card">
              <n-input v-model:value="encodeResult" type="textarea" :rows="6" readonly />
            </n-card>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="decode" tab="Base64解码">
        <div class="decoder-container">
          <div class="input-section">
            <n-form :model="decodeForm" label-placement="top">
              <n-form-item label="Base64输入">
                <n-input v-model:value="decodeForm.inputBase64" type="textarea" :rows="6"
                  placeholder="请输入要解码的Base64字符串..." />
              </n-form-item>
              <n-form-item label="字符编码">
                <n-select v-model:value="decodeForm.encoding" :options="supportedEncodings"
                  placeholder="选择字符编码" />
              </n-form-item>
              <n-form-item>
                <n-checkbox v-model:checked="decodeForm.urlSafe">URL安全解码</n-checkbox>
              </n-form-item>
              <n-form-item>
                <n-space>
                  <n-button type="primary" @click="decodeData" :disabled="!decodeForm.inputBase64">
                    解码
                  </n-button>
                  <n-button @click="clearDecode">清空</n-button>
                  <n-button @click="copyDecodeResult" :disabled="!decodeResult">
                    复制结果
                  </n-button>
                </n-space>
              </n-form-item>
            </n-form>
          </div>

          <div class="result-section" v-if="decodeResult">
            <n-divider>解码结果</n-divider>
            <n-card size="small" title="Base64解码结果" class="result-card">
              <n-input v-model:value="decodeResult" type="textarea" :rows="6" readonly />
            </n-card>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { Upload } from '@vicons/fa';
import { NButton, NCard, NCheckbox, NDivider, NForm, NFormItem, NIcon, NInput, NSelect, NSpace, NTabPane, NTabs, NText, NUpload } from 'naive-ui';
import { computed, reactive, ref } from 'vue';
import Base64EncoderDecoder from '../../core/base64';

// 创建Base64编码器实例
const base64 = new Base64EncoderDecoder();

// 支持的字符编码列表
const supportedEncodings = [
  { label: 'UTF-8', value: 'utf-8' },
  { label: 'GBK', value: 'gbk' },
  { label: 'GB2312', value: 'gb2312' },
  { label: 'Big5', value: 'big5' },
  { label: 'ASCII', value: 'ascii' },
  { label: 'ISO-8859-1', value: 'iso-8859-1' }
];

// 响应式数据 - 编码
const encodeForm = reactive({
  inputText: '',
  fileList: [],
  urlSafe: false,
  encoding: 'utf-8'
});

const encodeResult = ref('');

// 响应式数据 - 解码
const decodeForm = reactive({
  inputBase64: '',
  urlSafe: false,
  encoding: 'utf-8'
});

const decodeResult = ref('');

// 计算属性
const canEncode = computed(() => {
  return encodeForm.inputText || encodeForm.fileList.length > 0;
});

// 文件变化处理
async function handleFileChange(fileList) {
  if (fileList.length > 0) {
    const file = fileList[0].file;
    try {
      encodeResult.value = await base64.encodeFile(file);
    } catch (error) {
      console.error('文件编码失败:', error);
    }
  }
}

// 编码数据
async function encodeData() {
  try {
    if (encodeForm.inputText) {
      encodeResult.value = await base64.encode(encodeForm.inputText, encodeForm.urlSafe, encodeForm.encoding);
    } else if (encodeForm.fileList.length > 0) {
      const file = encodeForm.fileList[0].file;
      encodeResult.value = await base64.encodeFile(file);
    }
  } catch (error) {
    console.error('编码失败:', error);
  }
}

// 解码数据
function decodeData() {
  try {
    decodeResult.value = base64.decode(decodeForm.inputBase64, decodeForm.urlSafe, decodeForm.encoding);
  } catch (error) {
    console.error('解码失败:', error);
  }
}

// 清空编码数据
function clearEncode() {
  encodeForm.inputText = '';
  encodeForm.fileList = [];
  encodeForm.urlSafe = false;
  encodeForm.encoding = 'utf-8';
  encodeResult.value = '';
}

// 清空解码数据
function clearDecode() {
  decodeForm.inputBase64 = '';
  decodeForm.urlSafe = false;
  decodeForm.encoding = 'utf-8';
  decodeResult.value = '';
}

// 复制编码结果
function copyEncodeResult() {
  if (encodeResult.value) {
    navigator.clipboard.writeText(encodeResult.value).then(() => {
      console.log('编码结果已复制到剪贴板');
    });
  }
}

// 复制解码结果
function copyDecodeResult() {
  if (decodeResult.value) {
    navigator.clipboard.writeText(decodeResult.value).then(() => {
      console.log('解码结果已复制到剪贴板');
    });
  }
}
</script>

<style scoped>
.toolbox-container {
  padding: 10px;
}

.encoder-container,
.decoder-container {
  padding: 10px 0;
}

.input-section {
  margin-bottom: 15px;
}

.result-section {
  margin-top: 15px;
}

.result-card {
  margin-bottom: 12px;
}
</style>