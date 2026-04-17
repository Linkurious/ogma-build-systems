import type { RawGraph } from '@linkurious/ogma';
import { Ogma, NodeStyle, EdgeStyle } from '@linkurious/ogma-react';

const graph: RawGraph = {
  nodes: [
    { id: 0, attributes: { text: 'Node A' } },
    { id: 1, attributes: { text: 'Node B' } },
    { id: 2, attributes: { text: 'Node C' } },
  ],
  edges: [
    { id: '0-1', source: 0, target: 1 },
    { id: '1-2', source: 1, target: 2 },
  ],
};

export default function App() {
  return (
    <Ogma
      graph={graph}
      onReady={(ogma) => ogma.layouts.force({ locate: true })}
    >
      <NodeStyle attributes={{ color: '#61dafb', radius: 12 }} />
      <EdgeStyle attributes={{ color: '#555' }} />
    </Ogma>
  );
}
