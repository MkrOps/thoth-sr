import { randomInt } from './connectors/utils'
import { database } from '../database'
import Entity from './Entity'

const maxMSDiff = 5000
let interval = 3000

function initEntityLoop(update: Function, lateUpdate: Function) {
  const date = new Date()

  async function entityLoop(update: Function, lateUpdate: Function) {
    const agents = await database.instance.getLastUpdatedInstances()
    const now = new Date()
    const updated = []

    for (let i = 0; i < agents.length; i++) {
      const id = agents[i].id
      const lastUpdate = new Date(agents[i].lastUpdated ?? 0)
      if (now.valueOf() - lastUpdate.valueOf() > maxMSDiff) {
        update(id)

        updated.push(id)
        database.instance.setInstanceUpdated(id)
      }
    }
    for (let i = 0; i < updated.length; i++) {
      lateUpdate(updated[i])
    }
  }
  setInterval(() => {
    entityLoop(
      (id: number) => {
        update(id)
      },
      (id: number) => {
        lateUpdate(id)
      }
    )
  }, interval)
}

export class World {
  static instance: World
  id = -1
  objects: { [id: number]: any } = {}
  oldEntities: any
  newEntities: any

  constructor() {
    this.id = 0
    console.log('creating world')
    World.instance = this
    this.onCreate()
  }

  async updateEntities() {
    this.newEntities = await database.instance.getAgentInstances()
    const newEntities = this.newEntities
    delete newEntities['updated_at']
    const oldEntities = this.oldEntities ?? []
    if (oldEntities['updated_at']) delete oldEntities['updated_at']
    if (JSON.stringify(newEntities) === JSON.stringify(oldEntities)) return // They are the same

    // If an entry exists in oldAgents but not in newAgents, it has been deleted
    for (const i in oldEntities) {
      // filter for entries where oldAgents where id === newAgents[i].id
      if (
        newEntities.filter((x: any) => x.id === oldEntities[i].id)[0] === undefined
      ) {
        await this.removeEntity(oldEntities[i].id)
        console.log('removed ', oldEntities[i].id)
      }
    }

    // If an entry exists in newAgents but not in oldAgents, it has been added
    for (const i in newEntities) {
      // filter for entries where oldAgents where id === newAgents[i].id
      if (
        oldEntities.filter((x: any) => x.id === newEntities[i].id)[0] === undefined
      ) {
        if (newEntities[i].enabled) {
          await this.addEntity(new Entity(newEntities[i]))
        }
      }
    }

    for (const i in newEntities) {
      if (newEntities[i].dirty) {
        await this.removeEntity(newEntities[i].id)
        await this.addEntity(new Entity(newEntities[i]))
        await database.instance.setInstanceDirtyFlag(newEntities[i].id, false)
      }
    }

    this.oldEntities = this.newEntities
  }

  async onCreate() {
    initEntityLoop(
      async (id: number) => {
        await this.updateEntities()
        this.updateInstance(id)
      },
      async (id: number) => {
        this.lateUpdateInstance(id)
      }
    )
  }

  async updateInstance(id: number) {
    for (const i in this.objects) {
      if (this.objects[i].id === id) {
        await (this.objects[i]).onUpdate()
        return
      }
    }
  }
  async lateUpdateInstance(id: number) {
    for (const i in this.objects) {
      if (this.objects[i].id === id) {
        await (this.objects[i])?.onLateUpdate()
        return
      }
    }
  }

  async onDestroy() {

  }

  async addEntity(obj: Entity) {
    console.log('adding object', obj.id)
    if (this.objects[obj.id] === undefined) {
      this.objects[obj.id] = obj
    } else {
      //throw new Error('Object already exists')
    }
  }

  async removeEntity(id: number) {
    if (this.objectExists(id)) {
      await (this.objects[id] as Entity)?.onDestroy()
      this.objects[id] = null
      delete this.objects[id]
      console.log('Removed ', id)
    }
  }

  getEntity(id: number) {
    return this.objects[id]
  }

  objectExists(id: number) {
    return this.objects[id] !== undefined && this.objects[id] === null
  }

  generateId(): number {
    let id = randomInt(0, 10000)
    while (this.objectExists(id)) {
      id = randomInt(0, 10000)
    }
    return id
  }
}
