<template>
  <a-row justify="center" align="middle" style="min-height: 100vh; background: #f0f2f5;">
    <a-col :span="12">
      <a-card title="Lista de Tarefas" bordered hoverable>
        <template #extra>
          <a-button type="primary" shape="round" icon="plus">Nova Tarefa</a-button>
        </template>
        <a-list
          bordered
          :data-source="todos"
          item-layout="horizontal"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta
                :title="item.content"
                description="Descrição da tarefa"
              />
              <template #actions>
                <a-button type="link">Editar</a-button>
                <a-button type="link" danger>Remover</a-button>
              </template>
            </a-list-item>
          </template>
        </a-list>
        <a-divider />
        <div style="text-align:right;">
          <a-statistic title="Total de Tarefas" :value="meta.totalCount" />
        </div>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const todos = ref([
  { id: 1, content: 'Comprar pão' },
  { id: 2, content: 'Estudar Vue.js' },
  { id: 3, content: 'Ler documentação do Ant Design' },
  { id: 4, content: 'Fazer exercícios' },
  { id: 5, content: 'Revisar código' }
]);

const meta = ref({
  totalCount: 1200
});
</script>
