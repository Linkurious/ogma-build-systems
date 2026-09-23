import { createSignal, onMount, onCleanup } from 'solid-js';
import Ogma, { Node as OgmaNode, type RawGraph } from '@linkurious/ogma';

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
  let container!: HTMLDivElement;
  const [selected, setSelected] = createSignal<OgmaNode | null>(null);

  onMount(() => {
    const ogma = new Ogma({ container, graph });

    ogma.styles.addNodeRule({ color: '#335d92', radius: 12 });
    ogma.styles.addEdgeRule({ color: '#555' });

    ogma.events.on('click', ({ target }) => {
      setSelected(target && target.isNode ? target : null);
    });

    ogma.layouts.force({ locate: true });

    onCleanup(() => ogma.destroy());
  });

  return (
    <>
      <div
        ref={container}
        style={{ width: '100vw', height: '100vh' }}
      ></div>
      {selected() && (
        <div
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '16px',
            background: '#fff',
            padding: '8px 12px',
            'border-radius': '6px',
            'box-shadow': '0 2px 8px rgba(0,0,0,0.15)',
            'font-family': 'sans-serif',
          }}
        >
          Selected:{' '}
          <strong>
            {String(selected()!.getAttribute('text') ?? selected()!.getId())}
          </strong>
        </div>
      )}
    </>
  );
}
