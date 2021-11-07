import { Node, NodeEditor, Socket } from 'rete'

import { PubSubBase, ThothNode } from '../types'
import { EngineContext, ThothEngineComponent } from './engine'
import { Task, TaskOptions } from './plugins/taskPlugin/task'

// Note: We do this so Typescript knows what extra properties we're
// adding to the NodeEditor (in rete/editor.js). In an ideal world, we
// would be extending the class there, when we instantiate it.
export type PubSubContext = {
  publish: (event: string, data: unknown) => boolean
  subscribe: (event: string, callback: Function) => void
  events: Record<string, (tabId: string) => string>
  PubSub: PubSubBase
}

class ThothReteNodeEditor extends NodeEditor {
  pubSub: PubSubContext
  thoth: EngineContext
  tab: unknown
}

export interface ThothTask extends Task {
  outputs?: { [key: string]: string }
  init?: (task?: ThothTask, node?: ThothNode) => void
  onRun?: Function
}

export interface ModuleOptions {
  nodeType: 'input' | 'output' | 'triggerIn' | 'triggerOut' | 'module'
  socket?: Socket
}

export abstract class ThothComponent<
  WorkerReturnType
> extends ThothEngineComponent<WorkerReturnType> {
  // Original interface for task and _task: IComponentWithTask from the Rete Task Plugin
  task: TaskOptions
  _task: ThothTask
  // Original Class: https://github.com/latitudegames/rete/blob/master/src/component.ts
  editor: ThothReteNodeEditor | null = null
  data: unknown = {}
  category: string
  info: string
  display: boolean
  deprecated: boolean = false
  module: ModuleOptions
  workspaceType: 'module' | 'spell' | null | undefined

  constructor(name: string) {
    super(name)
  }

  abstract builder(node: ThothNode): Promise<ThothNode> | ThothNode

  async build(node: ThothNode) {
    await this.builder(node)

    return node
  }

  async createNode(data = {}) {
    const node = new Node(this.name) as ThothNode

    node.data = data
    await this.build(node)

    return node
  }
}
