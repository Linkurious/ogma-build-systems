import Ogma, { type RawGraph } from '@linkurious/ogma';
import { onMount, onCleanup, createEffect, createSignal, on } from 'solid-js';
import { render } from 'solid-js/web';
import { count } from './state';
import Tooltip from './Tooltip';

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

export default function OgmaGraph() {
  let container!: HTMLDivElement;

  onMount(() => {
    const ogma = new Ogma({ container, graph });

    ogma.styles.addNodeRule({ color: '#335d92', radius: 12 });
    ogma.styles.addEdgeRule({ color: '#555' });

    ogma.layouts.force({ locate: true });

    // Signals shared with the mounted tooltip component: updating them
    // re-renders the Solid component that lives inside the layer.
    const [id, setId] = createSignal<string | number | null>(null);
    const [degree, setDegree] = createSignal(0);
    const [x, setX] = createSignal(0);
    const [y, setY] = createSignal(0);
    const [visible, setVisible] = createSignal(false);

    // Add a custom Ogma layer and render the Solid tooltip into it.
    const layer = ogma.layers.addLayer(document.createElement('div'));
    const disposeTooltip = render(
      () => (
        <Tooltip
          id={id()}
          degree={degree()}
          x={x()}
          y={y()}
          visible={visible()}
        />
      ),
      layer.element
    );

    ogma.events
      .on('mouseover', ({ target }) => {
        if (!target || !target.isNode) return;
        const { x, y } = ogma.view.graphToScreenCoordinates(
          target.getPosition()
        );
        setId(target.getId());
        setDegree(target.getDegree());
        setX(x);
        setY(y);
        setVisible(true);
      })
      .on('mouseout', ({ target }) => {
        if (target && target.isNode) setVisible(false);
      });

    // React to the shared counter signal, skipping the initial value: each
    // click adds a node and re-runs the layout.
    createEffect(
      on(
        count,
        nextId => {
          ogma
            .addGraph({
              nodes: [{ id: nextId }],
              edges: [{ source: nextId - 1, target: nextId }],
            })
            .then(() => ogma.layouts.force({ locate: true }));
        },
        { defer: true }
      )
    );

    onCleanup(() => {
      disposeTooltip();
      ogma.destroy();
    });
  });

  return (
    <div ref={container} style={{ width: '100vw', height: '100vh' }}></div>
  );
}
