import EventEmitter from 'events'

declare global {
  // eslint-disable-next-line no-var
  var __chatBus: EventEmitter | undefined
}

const bus = global.__chatBus || new EventEmitter()
if (!global.__chatBus) global.__chatBus = bus

export default bus
