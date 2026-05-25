import { useState } from 'react';
import type { RawGraph } from '@linkurious/ogma';
import { Ogma, NodeStyle, EdgeStyle, EventListener } from '@linkurious/ogma-react';

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
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <Ogma
        graph={graph}
        onReady={(ogma) => ogma.layouts.force({ locate: true })}
      >
        <NodeStyle attributes={{ color: '#61dafb', radius: 12 }} />
        <EdgeStyle attributes={{ color: '#555' }} />
        <EventListener
          event="click"
          handler={(evt) => {
            const node = evt.target?.isNode ? evt.target : null;
            setSelected(node ? String(node.getAttribute('text') ?? node.getId()) : null);
          }}
        />
      </Ogma>
      {selected && (
        <div style={{
          position: 'fixed', bottom: 16, left: 16,
          background: '#fff', padding: '8px 12px', borderRadius: 6,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontFamily: 'sans-serif',
        }}>
          Selected: <strong>{selected}</strong>
        </div>
      )}
    </>
  );
}
