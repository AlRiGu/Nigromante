    import { Enemy } from '../../src/entities/Enemy.js';
import { ArmyUnit } from '../../src/entities/ArmyUnit.js';
import { Projectile } from '../../src/entities/Projectile.js';
import { CollisionSystem } from '../../src/core/CollisionSystem.js';

async function run() {
    console.log('Smoke test: iniciar');

    const collisionSystem = new CollisionSystem(null);

    // Test 1: Crear ArmyUnit a partir de stats (simula convertEnemyToAlly)
    const enemy = new Enemy(100, 100, 'warrior');
    if (!enemy) throw new Error('No se pudo crear Enemy');

    const stats = {
        health: enemy.maxHealth,
        maxHealth: enemy.maxHealth,
        damage: enemy.damage,
        speed: enemy.speed,
        color: enemy.color
    };

    const ally = new ArmyUnit(120, 120, enemy.type, stats, null, [], [], []);
    if (!ally) throw new Error('No se pudo crear ArmyUnit');
    console.log('OK: ArmyUnit creado a partir de stats');

    // Test 2: Chamán aliado dispara y colisiona con enemigo
    const shamanStats = { health: 25, maxHealth: 25, damage: 50, speed: 60, color: '#6b4423' };
    const shaman = new ArmyUnit(200, 200, 'shaman', shamanStats, null, [], [], []);
    shaman.target = enemy;
    shaman.allyProjectiles = [];

    // Forzar cooldown para permitir disparo
    shaman.timeSinceLastProjectile = shaman.projectileCooldown || 1.5;
    try {
        shaman.shootProjectile();
    } catch (e) {
        console.error('Error al ejecutar shootProjectile:', e);
        process.exit(1);
    }

    if (!Array.isArray(shaman.allyProjectiles) || shaman.allyProjectiles.length === 0) {
        console.error('Fallo: no se creó proyectil aliado');
        process.exit(1);
    }

    const projectile = shaman.allyProjectiles[0];
    // Colocar proyectil encima del enemigo para forzar colisión
    projectile.x = enemy.x + enemy.width / 2 - (projectile.width || 4) / 2;
    projectile.y = enemy.y + enemy.height / 2 - (projectile.height || 4) / 2;

    // Ejecutar resolución de colisiones
    collisionSystem.resolveAllyProjectileEnemyCollisions(shaman.allyProjectiles, [enemy]);

    if (projectile.active) {
        console.error('Fallo: proyectil sigue activo después de colisión');
        process.exit(1);
    }

    if (enemy.health >= enemy.maxHealth) {
        console.error('Fallo: enemigo no recibió daño');
        process.exit(1);
    }

    console.log('OK: proyectil aliado colisionó y aplicó daño al enemigo');

    console.log('Smoke test: OK');
    process.exit(0);
}

run();
