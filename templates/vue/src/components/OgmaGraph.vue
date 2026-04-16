<template>
  <div
    ref="containerRef"
    style="position: absolute; left: 0; top: 0; right: 0; bottom: 0;"
  ></div>
</template>

<script setup lang="ts">
import Ogma from '@linkurious/ogma';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { RawGraph, RawNode, RawEdge } from '@linkurious/ogma';

const props = defineProps<{ data: RawGraph }>();

const emit = defineEmits<{
  selection: [nodeIds: number[] | null];
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const ogma = ref<Ogma | null>(null);

const loadAndLayout = async (nodes: RawNode[], edges: RawEdge[]) => {
  if (!ogma.value) return;
  await ogma.value.addGraph({ nodes, edges });
  await ogma.value.layouts.force({ locate: true });
};

const clearSelection = () => emit('selection', null);
const setSelection = () => {
  if (!ogma.value) return;
  emit('selection', ogma.value.getSelectedNodes().getId() as number[]);
};

onMounted(async () => {
  ogma.value = new Ogma({ container: containerRef.value! });
  ogma.value.events
    .on('nodesSelected', setSelection)
    .on('nodesUnselected', clearSelection);
  await loadAndLayout(props.data.nodes, props.data.edges);
});

watch(
  () => props.data,
  (newData) => {
    const lastNode = newData.nodes[newData.nodes.length - 1];
    const lastEdge = newData.edges[newData.edges.length - 1];
    loadAndLayout([lastNode], [lastEdge]);
  }
);

onUnmounted(() => {
  if (ogma.value) {
    ogma.value.events.off([setSelection, clearSelection]);
    ogma.value.destroy();
  }
});
</script>
