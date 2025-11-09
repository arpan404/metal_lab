export class HistoryTracker {
    constructor() {
        this.parameterHistory = [];
        this.stateHistory = [];
        this.maxHistorySize = 1000;
    }
    recordParameterChange(parameter, oldValue, newValue) {
        this.parameterHistory.push({
            parameter,
            oldValue,
            newValue,
            timestamp: Date.now()
        });
        this.trimHistory();
    }
    recordStateChange(field, oldValue, newValue) {
        this.stateHistory.push({
            field,
            oldValue,
            newValue,
            timestamp: Date.now()
        });
        this.trimHistory();
    }
    getParameterHistory(parameter) {
        if (parameter) {
            return this.parameterHistory.filter(h => h.parameter === parameter);
        }
        return [...this.parameterHistory];
    }
    getStateHistory(field) {
        if (field) {
            return this.stateHistory.filter(h => h.field === field);
        }
        return [...this.stateHistory];
    }
    getParameterChangeCount(parameter) {
        return this.parameterHistory.filter(h => h.parameter === parameter).length;
    }
    getRecentChanges(count = 10) {
        return {
            parameters: this.parameterHistory.slice(-count),
            states: this.stateHistory.slice(-count)
        };
    }
    clear() {
        this.parameterHistory = [];
        this.stateHistory = [];
    }
    trimHistory() {
        if (this.parameterHistory.length > this.maxHistorySize) {
            this.parameterHistory = this.parameterHistory.slice(-this.maxHistorySize);
        }
        if (this.stateHistory.length > this.maxHistorySize) {
            this.stateHistory = this.stateHistory.slice(-this.maxHistorySize);
        }
    }
    export() {
        return JSON.stringify({
            parameters: this.parameterHistory,
            states: this.stateHistory
        }, null, 2);
    }
    import(json) {
        try {
            const data = JSON.parse(json);
            this.parameterHistory = data.parameters || [];
            this.stateHistory = data.states || [];
        }
        catch (e) {
            console.error('Failed to import history:', e);
        }
    }
}
