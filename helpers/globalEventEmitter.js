const events = require('events');

class EventProxy {
  constructor() {
    this.eventEmitter = new events.EventEmitter()
  }

  emit(event, data) {
    this.eventEmitter.emit(event, data);
  }

  on(event, handler) {
    this.eventEmitter.on(event, handler);
  }

}

class eventEmitterBuilder {
  constructor() {
    if (!eventEmitterBuilder.instance) eventEmitterBuilder.instance = new EventProxy();
  }

  getInstance() {
    return eventEmitterBuilder.instance;
  }
}


module.exports = eventEmitterBuilder;