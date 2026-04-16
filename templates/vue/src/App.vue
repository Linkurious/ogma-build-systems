<template>
  <OgmaVue
    :graph="graph"
    :layoutOnMounted="true"
    style="width: 100vw; height: 100vh;"
  >
    <NodeRule :attributes="{ color: '#42b883', radius: 12 }" />
    <EdgeRule :attributes="{ color: '#555' }" />
  </OgmaVue>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Ogma as OgmaVue, NodeRule, EdgeRule } from '@linkurious/ogma-vue';
import type { RawGraph } from '@linkurious/ogma';

const graph = ref<RawGraph>({
  nodes: [
    { id: 0, attributes: { text: 'Node A' } },
    { id: 1, attributes: { text: 'Node B' } },
    { id: 2, attributes: { text: 'Node C' } },
  ],
  edges: [
    { id: '0-1', source: 0, target: 1 },
    { id: '1-2', source: 1, target: 2 },
  ],
});
</script>

<style>
body { margin: 0; overflow: hidden; }
</style>
