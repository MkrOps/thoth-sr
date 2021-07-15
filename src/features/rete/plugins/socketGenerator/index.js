import Rete from "rete";
import * as sockets from "../../sockets";

function install(editor) {
  editor.on("componentregister", (component) => {
    const builder = component.builder;

    // we are going to override the default builder with our own, and will invoke the original builder inside it.
    component.builder = (node) => {
      // Handle outputs in the nodes data to repopulate when loading from JSON
      if (node.data.outputs && node.data.outputs.length !== 0) {
        node.data.outputs.forEach((key) => {
          const output = new Rete.Output(
            key.name.toLowerCase(),
            key.name,
            sockets[key.socketType]
          );
          node.addOutput(output);
        });
      }

      if (node.data.outputs && node.data.outputs.length > 0) {
        component.task.outputs = node.data.outputs.reduce(
          (acc, out) => {
            acc[out.name] = out.taskType || "output";
            return acc;
          },
          { ...component.task.outputs }
        );
      }

      if (node.data.inputs && node.data.inputs.length !== 0) {
        node.data.inputs.forEach((key) => {
          if (key.name.toLowerCase() === "data") return;
          const input = new Rete.Input(
            key.name.toLowerCase(),
            key.name,
            sockets[key.socketType]
          );
          node.addInput(input);
        });
      }

      builder.call(component, node);
    };
  });
}

const defaultExport = {
  name: "socketGenerator",
  install,
};

export default defaultExport;
