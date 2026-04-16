<template>
  <div style="position: relative; width: 100%; height: 100vh;">
    <OgmaGraph :data="graph" @selection="onSelection" />
    <div id="controls">
      <button @click="onAddNode">Add node</button>
      <div class="info">{{ selectionMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import OgmaGraph from './components/OgmaGraph.vue';
import type { RawNode, RawEdge } from '@linkurious/ogma';

const nodes = ref<RawNode[]>([{ id: 0 }, { id: 1 }, { id: 2 }]);
const edges = ref<RawEdge[]>([
  { id: '0-1', source: 0, target: 1 },
  { id: '1-2', source: 1, target: 2 },
]);
const selected = ref<number[] | null>(null);

const graph = computed(() => ({ nodes: nodes.value, edges: edges.value }));

const selectionMessage = computed(() => {
  if (!selected.value || selected.value.length === 0) return 'No node selected';
  if (selected.value.length === 1) return `Node ${selected.value[0]} selected`;
  return `Nodes ${selected.value.join(', ')} selected`;
});

const onAddNode = () => {
  const id = nodes.value.length;
  nodes.value.push({ id });
  edges.value.push({ id: `${id - 1}-${id}`, source: id - 1, target: id });
};

const onSelection = (sel: number[] | null) => {
  selected.value = sel;
};
</script>

<style>
body { margin: 0; }

#controls {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 6px;
  font-family: sans-serif;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
