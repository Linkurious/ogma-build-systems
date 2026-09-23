import { count, addNode } from './state';

export default function Counter() {
  return (
    <button
      onClick={addNode}
      style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        'z-index': 1,
        padding: '8px 16px',
        'border-radius': '6px',
        border: 'none',
        background: '#335d92',
        color: '#fff',
        cursor: 'pointer',
        'font-family': 'sans-serif',
      }}
    >
      Add node ({count() + 1} nodes)
    </button>
  );
}
