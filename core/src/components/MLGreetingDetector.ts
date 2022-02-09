/* eslint-disable no-console */
/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Rete from 'rete'

import {
  NodeData,
  ThothNode,
  ThothWorkerInputs,
  ThothWorkerOutputs,
} from '../../types'
import { InputControl } from '../dataControls/InputControl'
import { EngineContext } from '../engine'
import { getValue } from '../hfUtils'
import { triggerSocket, stringSocket, anySocket } from '../sockets'
import { ThothComponent } from '../thoth-component'

const info =
  'ML Greeting Detector can detect whether or not a phrase is a greeting, using Hugging Face'

type InputReturn = {
  output: unknown
}

export class MLGreetingDetector extends ThothComponent<Promise<InputReturn>> {
  constructor() {
    super('ML Greeting Detector')

    this.task = {
      outputs: { true: 'option', false: 'option', output: 'output' },
    }

    this.category = 'AI/ML'
    this.display = true
    this.info = info
  }

  builder(node: ThothNode) {
    const inp = new Rete.Input('string', 'String', stringSocket)
    const dataInput = new Rete.Input('trigger', 'Trigger', triggerSocket, true)
    const isTrue = new Rete.Output('true', 'True', triggerSocket)
    const isFalse = new Rete.Output('false', 'False', triggerSocket)
    const out = new Rete.Output('output', 'output', anySocket)

    const minDiff = new InputControl({
      dataKey: 'minDiff',
      name: 'Min Difference',
      icon: 'moon',
    })

    node.inspector.add(minDiff)

    return node
      .addInput(inp)
      .addInput(dataInput)
      .addOutput(isTrue)
      .addOutput(isFalse)
      .addOutput(out)
  }

  async worker(
    node: NodeData,
    inputs: ThothWorkerInputs,
    outputs: ThothWorkerOutputs,
    { silent, thoth }: { silent: boolean; thoth: EngineContext }
  ) {
    const action = inputs['string'][0]
    const minDiffData = node?.data?.minDiff as string
    const minDiff = minDiffData ? parseFloat(minDiffData) : 0.4
    const parameters = {
      candidate_labels: ['Greeting', 'Not Greeting'],
    }

    const result = await thoth.huggingface(
      'facebook/bart-large-mnli',
      JSON.stringify({
        inputs: action as string,
        parameters: parameters,
        options: undefined,
      })
    )
    const greeting = getValue(result.labels, result.scores, 'Greeting')
    const notGreeting = getValue(result.labels, result.scores, 'Not Greeting')
    const diff =
      notGreeting > greeting ? notGreeting - greeting : greeting - notGreeting
    const is = diff > minDiff && greeting > notGreeting

    this._task.closed = is ? ['false'] : ['true']
    return {
      output: action as string,
    }
  }
}
