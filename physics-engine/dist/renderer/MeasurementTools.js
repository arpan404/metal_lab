// physics-engine/renderer/MeasurementTools.ts
import * as THREE from 'three';
/**
 * Visual measurement tools (rulers, protractors, grids)
 */
export class MeasurementTools {
    constructor(scene) {
        this.tools = new Map();
        this.scene = scene;
    }
    /**
     * Add ruler
     */
    addRuler(id, start, end, divisions = 10, color = 0xffff00) {
        const group = new THREE.Group();
        // Main line
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const lineMaterial = new THREE.LineBasicMaterial({ color });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.add(line);
        // Division marks
        const length = start.distanceTo(end);
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        for (let i = 0; i <= divisions; i++) {
            const t = i / divisions;
            const point = new THREE.Vector3().lerpVectors(start, end, t);
            // Perpendicular mark
            const perpendicular = new THREE.Vector3(-direction.y, direction.x, 0).multiplyScalar(0.1);
            const markStart = point.clone().add(perpendicular);
            const markEnd = point.clone().sub(perpendicular);
            const markGeometry = new THREE.BufferGeometry().setFromPoints([markStart, markEnd]);
            const mark = new THREE.Line(markGeometry, lineMaterial);
            group.add(mark);
        }
        this.scene.add(group);
        this.tools.set(id, group);
    }
    /**
     * Add protractor
     */
    addProtractor(id, center, radius = 5, startAngle = 0, endAngle = Math.PI, color = 0x00ffff) {
        const group = new THREE.Group();
        // Arc
        const curve = new THREE.EllipseCurve(center.x, center.y, radius, radius, startAngle, endAngle, false, 0);
        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, p.y, center.z)));
        const material = new THREE.LineBasicMaterial({ color });
        const arc = new THREE.Line(geometry, material);
        group.add(arc);
        // Angle marks
        const divisions = 18; // Every 10 degrees
        for (let i = 0; i <= divisions; i++) {
            const angle = startAngle + (endAngle - startAngle) * (i / divisions);
            const x = center.x + radius * Math.cos(angle);
            const y = center.y + radius * Math.sin(angle);
            const markStart = new THREE.Vector3(x, y, center.z);
            const markEnd = new THREE.Vector3(center.x + (radius * 1.1) * Math.cos(angle), center.y + (radius * 1.1) * Math.sin(angle), center.z);
            const markGeometry = new THREE.BufferGeometry().setFromPoints([markStart, markEnd]);
            const mark = new THREE.Line(markGeometry, material);
            group.add(mark);
        }
        this.scene.add(group);
        this.tools.set(id, group);
    }
    /**
     * Add grid
     */
    addGrid(id, size = 20, divisions = 20, color1 = 0x888888, color2 = 0x444444) {
        const grid = new THREE.GridHelper(size, divisions, color1, color2);
        this.scene.add(grid);
        this.tools.set(id, grid);
    }
    /**
     * Add coordinate axes
     */
    addAxes(id, size = 10) {
        const axes = new THREE.AxesHelper(size);
        this.scene.add(axes);
        this.tools.set(id, axes);
    }
    /**
     * Add vector arrow
     */
    addVectorArrow(id, origin, direction, length, color = 0xff0000, label) {
        const arrow = new THREE.ArrowHelper(direction.clone().normalize(), origin, length, color, length * 0.2, length * 0.1);
        this.scene.add(arrow);
        this.tools.set(id, arrow);
        // Add label if provided
        if (label) {
            // Note: Text rendering would require additional setup
            // This is a placeholder for where text would be added
        }
    }
    /**
     * Update vector arrow
     */
    updateVectorArrow(id, origin, direction, length) {
        const arrow = this.tools.get(id);
        if (arrow) {
            arrow.position.copy(origin);
            arrow.setDirection(direction.clone().normalize());
            arrow.setLength(length, length * 0.2, length * 0.1);
        }
    }
    /**
     * Add bounding box
     */
    addBoundingBox(id, object, color = 0xffff00) {
        const box = new THREE.Box3().setFromObject(object);
        const helper = new THREE.Box3Helper(box, color);
        this.scene.add(helper);
        this.tools.set(id, helper);
    }
    /**
     * Remove tool
     */
    remove(id) {
        const tool = this.tools.get(id);
        if (tool) {
            this.scene.remove(tool);
            this.tools.delete(id);
        }
    }
    /**
     * Show/hide tool
     */
    setVisible(id, visible) {
        const tool = this.tools.get(id);
        if (tool) {
            tool.visible = visible;
        }
    }
    /**
     * Clear all tools
     */
    clear() {
        this.tools.forEach((tool) => {
            this.scene.remove(tool);
        });
        this.tools.clear();
    }
}
