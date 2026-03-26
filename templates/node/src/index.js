const Ogma = require("@linkurious/ogma");
const fs = require("fs");
const Canvas = require("canvas");
Canvas.registerFont("./assets/iosevka-semibold.ttf", { family: "Iosevka" });

const ogma = new Ogma();
const background = "#3D5467";

ogma.styles.addRule({
  nodeAttributes: {
    text: {
      color: "white",
      backgroundColor: "black",
      font: "Iosevka",
    },
  },
  edgeAttributes: {
    text: {
      color: "white",
      backgroundColor: "black",
      font: "Iosevka",
    },
  },
});

ogma
  .addGraph({
    nodes: [
      { id: "n0", attributes: { x: 0, y: 5 } },
      {
        id: "n1",
        attributes: {
          x: 50,
          y: 0,
          text: "node 1",
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "n0",
        target: "n1",
        attributes: {
          shape: "arrow",
          text: "knows",
        },
      },
    ],
  })
  .then(() => ogma.view.setSize({ height: 640, width: 640 }))
  .then(() => ogma.view.locateGraph())
  .then(() => {
    const view = ogma.view.get();
    console.log(
      `Exporting: ${view.width}x${view.height}px, center: ${view.x}, ${
        view.y
      }, zoom: ${view.zoom.toFixed(2)}`
    );
  })
  .then(() => ogma.export.png({ download: false, background }))
  .then((base64Str) => {
    const base64 = base64Str.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync("graph.png", base64, "base64");
    // eslint-disable-next-line no-console
    console.log(" - graph.png saved");
  })
  .then(() => ogma.export.svg({ download: false, background, clip: true }))
  .then((svg) => {
    fs.writeFileSync("graph.svg", svg);
    // eslint-disable-next-line no-console
    console.log(" - graph.svg saved");
  });
