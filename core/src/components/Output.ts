import Rete from 'rete'

import {
  NodeData,
  ThothNode,
  ThothWorkerInputs,
  ThothWorkerOutputs,
} from '../../types'
import { SwitchControl } from '../dataControls/SwitchControl'
import { EngineContext } from '../engine'
import { triggerSocket, anySocket } from '../sockets'
import { ThothComponent } from '../thoth-component'
const info = `The Playtest Print component will print whatever value is attached to its input and print that valyue back to the playtest window.`

export class Output extends ThothComponent<void> {
  constructor() {
    // Name of the component
    super('Output')

    this.task = {
      runOneInput: true,
      outputs: {
        trigger: 'option',
      },
    }

    this.module = {
      nodeType: 'output',
      socket: anySocket,
    }

    this.category = 'I/O'
    this.display = true
    this.info = info
  }

  // the builder is used to "assemble" the node component.
  // when we have enki hooked up and have grabbed all few shots, we would use the builder
  // to generate the appropriate inputs and ouputs for the fewshot at build time
  builder(node: ThothNode) {
    // create inputs here. First argument is the name, second is the type (matched to other components sockets), and third is the socket the i/o will use
    const triggerInput = new Rete.Input(
      'trigger',
      'Trigger',
      triggerSocket,
      true
    )
    const triggerOutput = new Rete.Output('trigger', 'Trigger', triggerSocket)
    const textInput = new Rete.Input('text', 'Print', anySocket, true)

    const switchControl = new SwitchControl({
      dataKey: 'sendToPlaytest',
      name: 'Send to Playtest',
      label: 'Playtest',
      defaultValue: node.data.sendToPlaytest || false,
    })

    node.inspector.add(switchControl)

    return node
      .addInput(textInput)
      .addInput(triggerInput)
      .addOutput(triggerOutput)
  }

  // the worker contains the main business logic of the node.  It will pass those results
  // to the outputs to be consumed by any connected components
  worker(
    node: NodeData,
    inputs: ThothWorkerInputs,
    outputs: ThothWorkerOutputs,
    { silent }: { silent: boolean }
  ) {
    const text = inputs.text.filter(Boolean)[0]

    //just need a new check here for playtest send boolean
    const { sendToPlaytest } = this.editor?.thoth as EngineContext
    if (!inputs || !inputs.text) return {}

    if (node.data.sendToPlaytest && sendToPlaytest) {
      sendToPlaytest(text)
    }
    if (!silent) node.display(text as string)

    return {
      text,
    }
  }
}
