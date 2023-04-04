import Ogma, { Color, Node } from "@linkurious/ogma";

const ogma = new Ogma({ container: "graph-container" });

// layout
ogma.generate
  .randomTree({ nodes: 200 })
  .then((graph) => ogma.setGraph(graph))
  .then(() => ogma.layouts.force({ duration: 100 }))
  .then(() => ogma.view.locateGraph())

  // log node color
  .then(() => {
    const node: Node = ogma.getNode(0) as Node;
    const color: Color = node.getAttribute("color") as Color;
    console.log(`🎨 Node color is ${color}`);
  });

// styles
const colors = ["#FFBE0B", "#FB5607", "#FF006E", "#8338EC", "#3A86FF"];
ogma.styles.addRule({
  nodeAttributes: {
    color: () => colors[Math.floor(Math.random() * colors.length)],
    radius: 12.5,
  },
});
