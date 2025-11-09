/**
 * UI overlay for displaying information on top of 3D scene
 */
export class UIOverlay {
    constructor(parentElement) {
        this.elements = new Map();
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '1000';
        parentElement.appendChild(this.container);
    }
    /**
     * Add text element
     */
    addText(id, text, position, style) {
        const element = document.createElement('div');
        element.textContent = text;
        element.style.position = 'absolute';
        element.style.left = `${position.x}px`;
        element.style.top = `${position.y}px`;
        element.style.color = style?.color ?? '#ffffff';
        element.style.fontSize = style?.fontSize ?? '16px';
        element.style.fontFamily = style?.fontFamily ?? 'monospace';
        element.style.padding = '5px 10px';
        element.style.backgroundColor = style?.backgroundColor ?? 'rgba(0, 0, 0, 0.7)';
        element.style.borderRadius = '5px';
        element.style.pointerEvents = 'none';
        if (style) {
            Object.assign(element.style, style);
        }
        this.container.appendChild(element);
        this.elements.set(id, element);
    }
    /**
     * Update text content
     */
    updateText(id, text) {
        const element = this.elements.get(id);
        if (element) {
            element.textContent = text;
        }
    }
    /**
     * Add gauge/meter
     */
    addGauge(id, label, value, max, position) {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = `${position.x}px`;
        container.style.top = `${position.y}px`;
        container.style.width = '200px';
        container.style.padding = '10px';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        container.style.borderRadius = '5px';
        container.style.pointerEvents = 'none';
        const labelElement = document.createElement('div');
        labelElement.textContent = label;
        labelElement.style.color = '#ffffff';
        labelElement.style.fontSize = '14px';
        labelElement.style.marginBottom = '5px';
        const barContainer = document.createElement('div');
        barContainer.style.width = '100%';
        barContainer.style.height = '20px';
        barContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        barContainer.style.borderRadius = '10px';
        barContainer.style.overflow = 'hidden';
        const bar = document.createElement('div');
        bar.style.width = `${(value / max) * 100}%`;
        bar.style.height = '100%';
        bar.style.backgroundColor = '#00ff00';
        bar.style.transition = 'width 0.3s';
        const valueLabel = document.createElement('div');
        valueLabel.textContent = `${value.toFixed(1)} / ${max.toFixed(1)}`;
        valueLabel.style.color = '#ffffff';
        valueLabel.style.fontSize = '12px';
        valueLabel.style.marginTop = '5px';
        valueLabel.style.textAlign = 'center';
        barContainer.appendChild(bar);
        container.appendChild(labelElement);
        container.appendChild(barContainer);
        container.appendChild(valueLabel);
        this.container.appendChild(container);
        this.elements.set(id, container);
        this.elements.set(`${id}-bar`, bar);
        this.elements.set(`${id}-value`, valueLabel);
    }
    /**
     * Update gauge value
     */
    updateGauge(id, value, max) {
        const bar = this.elements.get(`${id}-bar`);
        const valueLabel = this.elements.get(`${id}-value`);
        if (bar) {
            bar.style.width = `${(value / max) * 100}%`;
        }
        if (valueLabel) {
            valueLabel.textContent = `${value.toFixed(1)} / ${max.toFixed(1)}`;
        }
    }
    /**
     * Add button
     */
    addButton(id, text, position, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.position = 'absolute';
        button.style.left = `${position.x}px`;
        button.style.top = `${position.y}px`;
        button.style.padding = '10px 20px';
        button.style.backgroundColor = '#007bff';
        button.style.color = '#ffffff';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.pointerEvents = 'auto';
        button.addEventListener('click', onClick);
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#0056b3';
        });
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#007bff';
        });
        this.container.appendChild(button);
        this.elements.set(id, button);
    }
    /**
     * Add notification
     */
    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'absolute';
        notification.style.top = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.padding = '15px 30px';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        notification.style.color = '#ffffff';
        notification.style.borderRadius = '5px';
        notification.style.fontSize = '16px';
        notification.style.zIndex = '10000';
        notification.style.pointerEvents = 'none';
        notification.style.animation = 'fadeIn 0.3s';
        this.container.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s';
            setTimeout(() => {
                this.container.removeChild(notification);
            }, 300);
        }, duration);
    }
    /**
     * Remove element
     */
    remove(id) {
        const element = this.elements.get(id);
        if (element && element.parentElement) {
            element.parentElement.removeChild(element);
            this.elements.delete(id);
        }
    }
    /**
     * Clear all elements
     */
    clear() {
        this.elements.forEach((element) => {
            if (element.parentElement) {
                element.parentElement.removeChild(element);
            }
        });
        this.elements.clear();
    }
    /**
     * Show/hide element
     */
    setVisible(id, visible) {
        const element = this.elements.get(id);
        if (element) {
            element.style.display = visible ? 'block' : 'none';
        }
    }
    /**
     * Dispose overlay
     */
    dispose() {
        this.clear();
        if (this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }
}
