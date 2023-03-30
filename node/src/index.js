const Ogma = require('@linkurious/ogma');
const fs = require('fs');

const ogma = new Ogma();

ogma
  .addGraph({
    nodes: [
      { id: 'n0', attributes: { x: 0, y: 5 } },
      {
        id: 'n1',
        attributes: {
          x: 50,
          y: 0,
          text: { content: 'node 1', color: 'rgba(128, 128, 128, 0.9)' }
        }
      }
    ],
    edges: [
      {
        id: 'e1',
        source: 'n0',
        target: 'n1',
        attributes: {
          shape: 'arrow',
          text: { content: 'knows', color: 'rgba(128, 128, 128, 0.9)' }
        }
      }
    ]
  })
  .then(() => ogma.view.setSize({ height: 400, width: 400 }))
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Exporting: ogma view ', ogma.view.get());
  })
  .then(() => ogma.export.png({ download: false }))
  .then(base64Str => {
    const base64 = base64Str.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('graph.png', base64, 'base64');
    // eslint-disable-next-line no-console
    console.log(' - graph.png saved');
  });
