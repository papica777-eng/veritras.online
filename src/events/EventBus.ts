/**
 * EventBus — Qantum Module
 * @module EventBus
 * @path src/events/EventBus.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { EventEmitter } from 'events';

export class EventBus {
  private static instance: EventBus;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) EventBus.instance = new EventBus();
    return EventBus.instance;
  }

  // Complexity: O(1)
  public emit(event: string, data?: any) {
    this.emitter.emit(event, data);
  }

  // Complexity: O(1)
  public on(event: string, callback: (data: any) => void) {
    this.emitter.on(event, callback);
  }

  // Complexity: O(1)
  public off(event: string, callback: (data: any) => void) {
    this.emitter.off(event, callback);
  }
}
