export class SimulationState<T extends Record<string, unknown>> {
  private currentState: T | null = null;
  private previousState: T | null = null;

  update(newState: T): void {
    this.previousState = this.currentState;
    this.currentState = { ...newState };
  }

  getCurrent(): T | null { return this.currentState; }
  getPrevious(): T | null { return this.previousState; }

  getDelta(): Partial<T> {
    if (!this.currentState || !this.previousState) return {} as Partial<T>;
    const delta: Partial<T> = {};
    for (const key of Object.keys(this.currentState) as Array<keyof T>) {
      if (this.currentState[key] !== this.previousState[key]) {
        delta[key] = this.currentState[key];
      }
    }
    return delta;
  }

  reset(): void { this.currentState = this.previousState = null; }
}
