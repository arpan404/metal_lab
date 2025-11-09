export class StateManager {
    constructor() {
        this.snapshots = new Map();
        this.frameHistory = [];
        this.parameterHistory = [];
        this.maxFrameHistory = 1000; // Keep last 1000 frames
    }
    reset() {
        this.frameHistory = [];
        this.parameterHistory = [];
    }
    recordFrame(state) {
        this.frameHistory.push(state);
        // Limit history size
        if (this.frameHistory.length > this.maxFrameHistory) {
            this.frameHistory.shift();
        }
    }
    recordParameterChange(key, value) {
        this.parameterHistory.push({
            key,
            value,
            timestamp: Date.now()
        });
    }
    saveSnapshot(name, state) {
        const id = `snapshot-${Date.now()}`;
        this.snapshots.set(id, {
            id,
            name,
            state,
            timestamp: Date.now()
        });
        return id;
    }
    loadSnapshot(id) {
        const snapshot = this.snapshots.get(id);
        if (!snapshot) {
            throw new Error(`Snapshot not found: ${id}`);
        }
        return snapshot;
    }
    getAllSnapshots() {
        return Array.from(this.snapshots.values());
    }
    deleteSnapshot(id) {
        this.snapshots.delete(id);
    }
    getFrameHistory() {
        return [...this.frameHistory];
    }
    getParameterHistory() {
        return [...this.parameterHistory];
    }
    /**
     * Export full state as JSON
     */
    export() {
        return JSON.stringify({
            snapshots: Array.from(this.snapshots.entries()),
            parameterHistory: this.parameterHistory,
            // Don't export frame history (too large)
        });
    }
    /**
     * Import state from JSON
     */
    import(json) {
        const data = JSON.parse(json);
        this.snapshots = new Map(data.snapshots);
        this.parameterHistory = data.parameterHistory;
    }
}
