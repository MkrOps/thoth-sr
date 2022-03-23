/* eslint-disable no-console */
/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios'
import Rete from 'rete'

import {
  NodeData,
  ThothNode,
  ThothWorkerInputs,
  ThothWorkerOutputs,
} from '../../../types'
import { EngineContext } from '../../engine'
import { triggerSocket, stringSocket } from '../../sockets'
import { ThothComponent } from '../../thoth-component'

const info = 'Facts Store is used to store facts for an agent and user'
export class FactsStore extends ThothComponent<Promise<void>> {
  constructor() {
    super('Facts Store')

    this.task = {
      outputs: {
        trigger: 'option',
      },
    }

    this.category = 'Agents'
    this.display = true
    this.info = info
  }

  builder(node: ThothNode) {
    const agentInput = new Rete.Input('agent', 'Agent', stringSocket)
    const speakerInput = new Rete.Input('speaker', 'Speaker', stringSocket)
    const factInp = new Rete.Input('fact', 'Fact', stringSocket)
    const channelInp = new Rete.Input('channel', 'Channel', stringSocket)
    const clientInp = new Rete.Input('client', 'Client', stringSocket)
    const dataInput = new Rete.Input('trigger', 'Trigger', triggerSocket, true)
    const dataOutput = new Rete.Output('trigger', 'Trigger', triggerSocket)

    return node
      .addInput(factInp)
      .addInput(agentInput)
      .addInput(channelInp)
      .addInput(clientInp)
      .addInput(speakerInput)
      .addInput(dataInput)
      .addOutput(dataOutput)
  }

  async worker(
    node: NodeData,
    inputs: ThothWorkerInputs,
    outputs: ThothWorkerOutputs,
    { silent, thoth }: { silent: boolean; thoth: EngineContext }
  ) {
    const speaker = inputs['speaker'][0] as string
    const agent = inputs['agent'][0] as string
    const facts = inputs['fact'][0] as string

    const channel = inputs['channel'][0] as string
    const client = inputs['client'][0] as string

    const response = await axios.post(
      `${process.env.REACT_APP_API_ROOT_URL}/facts`,
      {
        agent,
        speaker,
        facts,
        channel,
        client,
      }
    )
    if (!silent) node.display(response)
    console.log(response)
  }
}
