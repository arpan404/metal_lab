import type { Snapshot, ExperimentState } from '../types/Experiments';
export declare class SnapshotManager {
    private snapshots;
    private maxSnapshots;
    create(name: string, state: ExperimentState): string;
    load(id: string): Snapshot | null;
    delete(id: string): boolean;
    getAll(): Snapshot[];
    findByName(name: string): Snapshot[];
    clear(): void;
    exportAll(): string;
    importAll(json: string): number;
}
//# sourceMappingURL=SnapshotManager.d.ts.map