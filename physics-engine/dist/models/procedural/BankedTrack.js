// physics-engine/models/procedural/BankedTrack.ts
import * as THREE from 'three';
export class BankedTrack {
    constructor(config) {
        this.group = new THREE.Group();
        this.config = {
            innerWallHeight: 2,
            outerWallHeight: 3,
            surfaceColor: 0x444444,
            wallColor: 0x888888,
            showGridLines: true,
            ...config,
        };
        this.buildTrack();
    }
    buildTrack() {
        const { radius, width, bankAngle, segments, surfaceColor, showGridLines } = this.config;
        const bankRad = (bankAngle * Math.PI) / 180;
        // Create the banked surface
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const uvs = [];
        const normals = [];
        // Generate vertices for banked surface
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const cos = Math.cos(theta);
            const sin = Math.sin(theta);
            // Inner edge (lower)
            const innerRadius = radius - width / 2;
            const innerX = innerRadius * cos;
            const innerZ = innerRadius * sin;
            const innerY = -width / 2 * Math.sin(bankRad);
            // Outer edge (higher due to banking)
            const outerRadius = radius + width / 2;
            const outerX = outerRadius * cos;
            const outerZ = outerRadius * sin;
            const outerY = width / 2 * Math.sin(bankRad);
            // Add vertices
            vertices.push(innerX, innerY, innerZ);
            vertices.push(outerX, outerY, outerZ);
            // Add UVs
            uvs.push(i / segments, 0);
            uvs.push(i / segments, 1);
            // Calculate normals (perpendicular to banked surface)
            const normalX = -Math.sin(bankRad) * cos;
            const normalY = Math.cos(bankRad);
            const normalZ = -Math.sin(bankRad) * sin;
            normals.push(normalX, normalY, normalZ);
            normals.push(normalX, normalY, normalZ);
        }
        // Generate indices for triangles
        for (let i = 0; i < segments; i++) {
            const base = i * 2;
            indices.push(base, base + 1, base + 2);
            indices.push(base + 1, base + 3, base + 2);
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setIndex(indices);
        // Create track material
        const material = new THREE.MeshStandardMaterial({
            color: surfaceColor,
            roughness: 0.8,
            metalness: 0.2,
            side: THREE.DoubleSide,
        });
        this.trackMesh = new THREE.Mesh(geometry, material);
        this.group.add(this.trackMesh);
        // Add grid lines if enabled
        if (showGridLines) {
            this.addGridLines();
        }
        // Build walls
        this.buildWalls();
        // Add start/finish line
        this.addStartFinishLine();
    }
    buildWalls() {
        const { radius, width, segments, innerWallHeight, outerWallHeight, wallColor, bankAngle } = this.config;
        const bankRad = (bankAngle * Math.PI) / 180;
        // Inner wall
        const innerGeometry = this.createWallGeometry(radius - width / 2, innerWallHeight, segments, -width / 2 * Math.sin(bankRad));
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: wallColor,
            roughness: 0.7,
            metalness: 0.1,
        });
        this.innerWall = new THREE.Mesh(innerGeometry, wallMaterial);
        this.group.add(this.innerWall);
        // Outer wall
        const outerGeometry = this.createWallGeometry(radius + width / 2, outerWallHeight, segments, width / 2 * Math.sin(bankRad));
        this.outerWall = new THREE.Mesh(outerGeometry, wallMaterial);
        this.group.add(this.outerWall);
    }
    createWallGeometry(wallRadius, height, segments, baseY) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const uvs = [];
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = wallRadius * Math.cos(theta);
            const z = wallRadius * Math.sin(theta);
            vertices.push(x, baseY, z);
            vertices.push(x, baseY + height, z);
            uvs.push(i / segments, 0);
            uvs.push(i / segments, 1);
        }
        for (let i = 0; i < segments; i++) {
            const base = i * 2;
            indices.push(base, base + 1, base + 2);
            indices.push(base + 1, base + 3, base + 2);
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        return geometry;
    }
    addGridLines() {
        const { radius, width, segments } = this.config;
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true });
        // Radial lines
        for (let i = 0; i < 8; i++) {
            const theta = (i / 8) * Math.PI * 2;
            const points = [];
            points.push(new THREE.Vector3((radius - width / 2) * Math.cos(theta), 0, (radius - width / 2) * Math.sin(theta)));
            points.push(new THREE.Vector3((radius + width / 2) * Math.cos(theta), 0, (radius + width / 2) * Math.sin(theta)));
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            this.group.add(line);
        }
        // Circular lines
        for (let ring = 0; ring < 3; ring++) {
            const ringRadius = radius - width / 2 + (ring / 2) * width;
            const points = [];
            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                points.push(new THREE.Vector3(ringRadius * Math.cos(theta), 0, ringRadius * Math.sin(theta)));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            this.group.add(line);
        }
    }
    addStartFinishLine() {
        const { radius, width, bankAngle } = this.config;
        const bankRad = (bankAngle * Math.PI) / 180;
        // Create checkerboard pattern for start/finish line
        const lineWidth = 1;
        const checkerSize = 0.5;
        const numCheckers = Math.floor(width / checkerSize);
        for (let i = 0; i < numCheckers; i++) {
            const isBlack = i % 2 === 0;
            const color = isBlack ? 0x000000 : 0xffffff;
            const innerRadius = radius - width / 2 + i * checkerSize;
            const outerRadius = radius - width / 2 + (i + 1) * checkerSize;
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const startAngle = -lineWidth / (2 * radius);
            const endAngle = lineWidth / (2 * radius);
            for (let angle = startAngle; angle <= endAngle; angle += (endAngle - startAngle) / 10) {
                const innerY = -(radius - innerRadius) * Math.sin(bankRad);
                const outerY = -(radius - outerRadius) * Math.sin(bankRad);
                vertices.push(innerRadius * Math.cos(angle), innerY, innerRadius * Math.sin(angle), outerRadius * Math.cos(angle), outerY, outerRadius * Math.sin(angle));
            }
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            this.group.add(mesh);
        }
    }
    getObject3D() {
        return this.group;
    }
    update(deltaTime) {
        // Animation updates if needed
    }
    dispose() {
        this.trackMesh?.geometry.dispose();
        (this.trackMesh?.material).dispose();
        this.innerWall?.geometry.dispose();
        (this.innerWall?.material).dispose();
        this.outerWall?.geometry.dispose();
        (this.outerWall?.material).dispose();
    }
    getTrackRadius() {
        return this.config.radius;
    }
    getTrackWidth() {
        return this.config.width;
    }
    getBankAngle() {
        return this.config.bankAngle;
    }
    // Calculate position and orientation at a given angle
    getPositionAtAngle(angle, lateralOffset = 0) {
        const { radius, width, bankAngle } = this.config;
        const bankRad = (bankAngle * Math.PI) / 180;
        const effectiveRadius = radius + lateralOffset;
        const x = effectiveRadius * Math.cos(angle);
        const z = effectiveRadius * Math.sin(angle);
        const y = lateralOffset * Math.sin(bankRad);
        return new THREE.Vector3(x, y, z);
    }
    getNormalAtAngle(angle) {
        const { bankAngle } = this.config;
        const bankRad = (bankAngle * Math.PI) / 180;
        const normalX = -Math.sin(bankRad) * Math.cos(angle);
        const normalY = Math.cos(bankRad);
        const normalZ = -Math.sin(bankRad) * Math.sin(angle);
        return new THREE.Vector3(normalX, normalY, normalZ).normalize();
    }
}
