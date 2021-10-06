import { getComponents, components } from './src/components/components'
import { initEditor } from './src/editor'
import { initSharedEngine } from './src/engine'
import { Task } from './src/plugins/taskPlugin/task'
import { ThothComponent } from './src/thoth-component'

export { getComponents } from './src/components/components'
export { initEditor } from './src/editor'
export type { EngineContext } from './src/engine'
export { Task } from './src/plugins/taskPlugin/task'

export default {
  components,
  getComponents,
  initSharedEngine,
  initEditor,
  Task,
  ThothComponent,
}
