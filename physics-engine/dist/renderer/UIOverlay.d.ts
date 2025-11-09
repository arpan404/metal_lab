/**
 * UI overlay for displaying information on top of 3D scene
 */
export declare class UIOverlay {
    private container;
    private elements;
    constructor(parentElement: HTMLElement);
    /**
     * Add text element
     */
    addText(id: string, text: string, position: {
        x: number;
        y: number;
    }, style?: Partial<CSSStyleDeclaration>): void;
    /**
     * Update text content
     */
    updateText(id: string, text: string): void;
    /**
     * Add gauge/meter
     */
    addGauge(id: string, label: string, value: number, max: number, position: {
        x: number;
        y: number;
    }): void;
    /**
     * Update gauge value
     */
    updateGauge(id: string, value: number, max: number): void;
    /**
     * Add button
     */
    addButton(id: string, text: string, position: {
        x: number;
        y: number;
    }, onClick: () => void): void;
    /**
     * Add notification
     */
    showNotification(message: string, duration?: number): void;
    /**
     * Remove element
     */
    remove(id: string): void;
    /**
     * Clear all elements
     */
    clear(): void;
    /**
     * Show/hide element
     */
    setVisible(id: string, visible: boolean): void;
    /**
     * Dispose overlay
     */
    dispose(): void;
}
//# sourceMappingURL=UIOverlay.d.ts.map