import { Show } from 'solid-js';

interface TooltipProps {
  id: string | number | null;
  degree: number;
  x: number;
  y: number;
  visible: boolean;
}

// A plain Solid component: it doesn't know about Ogma, it just renders
// whatever props it is given. Ogma mounts it inside a custom layer.
export default function Tooltip(props: TooltipProps) {
  return (
    <Show when={props.visible && props.id !== null}>
      <div
        style={{
          position: 'absolute',
          left: `${props.x}px`,
          top: `${props.y}px`,
          transform: 'translate(-50%, calc(-100% - 12px))',
          padding: '6px 10px',
          'border-radius': '6px',
          background: '#1b1b1f',
          color: '#fff',
          'font-size': '12px',
          'font-family': 'sans-serif',
          'white-space': 'nowrap',
          'pointer-events': 'none',
        }}
      >
        <strong>Node {props.id}</strong>
        <div style={{ opacity: 0.7 }}>
          {props.degree} neighbour{props.degree === 1 ? '' : 's'}
        </div>
      </div>
    </Show>
  );
}
