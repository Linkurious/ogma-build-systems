import { createSignal } from 'solid-js';

// Shared signal: id of the last node added to the graph. The initial graph
// already has nodes 0, 1, 2, so we start here and each click adds the next one.
export const [count, setCount] = createSignal(2);

export function addNode() {
  setCount(value => value + 1);
}
