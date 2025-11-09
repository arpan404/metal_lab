export class SimulationState {
    constructor() {
        this.currentState = null;
        this.previousState = null;
    }
    update(newState) {
        this.previousState = this.currentState;
        this.currentState = { ...newState };
    }
    getCurrent() { return this.currentState; }
    getPrevious() { return this.previousState; }
    getDelta() {
        if (!this.currentState || !this.previousState)
            return {};
        const delta = {};
        for (const key of Object.keys(this.currentState)) {
            if (this.currentState[key] !== this.previousState[key]) {
                delta[key] = this.currentState[key];
            }
        }
        return delta;
    }
    reset() { this.currentState = this.previousState = null; }
}
