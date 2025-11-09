export class SnapshotManager {
    constructor() {
        this.snapshots = new Map();
        this.maxSnapshots = 50;
    }
    create(name, state) {
        const id = `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const snapshot = {
            id,
            name,
            state: JSON.parse(JSON.stringify(state)), // Deep copy
            timestamp: Date.now()
        };
        this.snapshots.set(id, snapshot);
        // Cleanup old snapshots if limit exceeded
        if (this.snapshots.size > this.maxSnapshots) {
            const oldest = Array.from(this.snapshots.values())
                .sort((a, b) => a.timestamp - b.timestamp)[0];
            this.snapshots.delete(oldest.id);
        }
        return id;
    }
    load(id) {
        return this.snapshots.get(id) || null;
    }
    delete(id) {
        return this.snapshots.delete(id);
    }
    getAll() {
        return Array.from(this.snapshots.values())
            .sort((a, b) => b.timestamp - a.timestamp);
    }
    findByName(name) {
        return Array.from(this.snapshots.values())
            .filter(s => s.name.toLowerCase().includes(name.toLowerCase()))
            .sort((a, b) => b.timestamp - a.timestamp);
    }
    clear() {
        this.snapshots.clear();
    }
    exportAll() {
        const data = Array.from(this.snapshots.values());
        return JSON.stringify(data, null, 2);
    }
    importAll(json) {
        try {
            const data = JSON.parse(json);
            let imported = 0;
            data.forEach(snapshot => {
                this.snapshots.set(snapshot.id, snapshot);
                imported++;
            });
            return imported;
        }
        catch (e) {
            console.error('Failed to import snapshots:', e);
            return 0;
        }
    }
}
