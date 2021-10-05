import { getComponents } from './components/components'
import { initEditor } from './editor'
import { Task } from './plugins/taskPlugin/task'

export { getComponents } from './components/components'
export { initEditor } from './editor'
export type { EngineContext } from './engine'
export { Task } from './plugins/taskPlugin/task'

export default {
  getComponents,
  initEditor,
  Task,
}
