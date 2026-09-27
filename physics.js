class PhysicsEngine {
    constructor() {
        this.bodies = [];
        this.initialEnergy = 0;
    }

    addBody(body) {
        this.bodies.push(body);
    }

    calculateForces() {
        // Resetear aceleraciones
        for (let b of this.bodies) {
            b.ax = 0; b.ay = 0; b.az = 0;
        }

        // F = G * m1 * m2 / r^2
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                let b1 = this.bodies[i];
                let b2 = this.bodies[j];
                
                let dx = b2.x - b1.x;
                let dy = b2.y - b1.y;
                let dz = b2.z - b1.z;
                let distSq = dx*dx + dy*dy + dz*dz;
                let dist = Math.sqrt(distSq);
                
                if(dist < (b1.radius + b2.radius)) continue; // Colisión (simplificada)

                let force = (CONSTANTS.G * b1.mass * b2.mass) / distSq;
                let ax = (force * dx / dist);
                let ay = (force * dy / dist);
                let az = (force * dz / dist);

                b1.ax += ax / b1.mass;
                b1.ay += ay / b1.mass;
                b1.az += az / b1.mass;
                
                b2.ax -= ax / b2.mass;
                b2.ay -= ay / b2.mass;
                b2.az -= az / b2.mass;
            }
        }
    }

    step(dt) {
        // Integrador Velocity Verlet
        // 1. x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt^2
        for (let b of this.bodies) {
            b.x += b.vx * dt + 0.5 * b.ax * dt * dt;
            b.y += b.vy * dt + 0.5 * b.ay * dt * dt;
            b.z += b.vz * dt + 0.5 * b.az * dt * dt;
            
            // Guardar velocidad a medio paso
            b.vx += 0.5 * b.ax * dt;
            b.vy += 0.5 * b.ay * dt;
            b.vz += 0.5 * b.az * dt;
        }

        // 2. Calcular nuevas aceleraciones a(t+dt)
        this.calculateForces();

        // 3. v(t+dt) = v_half + 0.5*a(t+dt)*dt
        for (let b of this.bodies) {
            b.vx += 0.5 * b.ax * dt;
            b.vy += 0.5 * b.ay * dt;
            b.vz += 0.5 * b.az * dt;
        }
    }

    getTotalEnergy() {
        let kinetic = 0;
        let potential = 0;
        for (let i = 0; i < this.bodies.length; i++) {
            let b1 = this.bodies[i];
            let v2 = b1.vx*b1.vx + b1.vy*b1.vy + b1.vz*b1.vz;
            kinetic += 0.5 * b1.mass * v2;
            for (let j = i + 1; j < this.bodies.length; j++) {
                let b2 = this.bodies[j];
                let dist = Math.sqrt(Math.pow(b2.x-b1.x, 2) + Math.pow(b2.y-b1.y, 2) + Math.pow(b2.z-b1.z, 2));
                potential -= (CONSTANTS.G * b1.mass * b2.mass) / dist;
            }
        }
        return kinetic + potential;
    }
}
