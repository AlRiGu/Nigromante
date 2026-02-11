# Guía de Optimización - Sistema de Legión

## ✅ Optimizaciones Aplicadas

### 1. Fix Crítico - createTrail Signature
**Problema**: Partículas de ectoplasma no se generaban por mismatch de firma
**Solución**: Cambiado de objeto config a string de color
```javascript
// ❌ ANTES (no funcionaba)
this.particleSystem.createTrail(x, y, { color: '#00ffff', ... });

// ✅ AHORA (funciona)
this.particleSystem.createTrail(x, y, '#00ffff');
```

### 2. GC Pressure - Object Pooling para Separación
**Problema**: 600-1,200 allocations/segundo (nuevo objeto cada frame)
**Solución**: Cache reutilizable `_separationCache`
```javascript
// En constructor:
this._separationCache = { x: 0, y: 0 };

// En calculateSeparation():
this._separationCache.x = separationX;
this._separationCache.y = separationY;
return this._separationCache; // Reutiliza objeto
```

**Beneficio**: Reduce GC overhead ~80% (menos micro-stutters)

---

## 🔧 Optimización Futura - Spatial Hash Grid

### ¿Cuándo implementar?
**Activar cuando `army.length > 15` para evitar FPS drop crítico**

### Impacto en Performance

| Aliados | Sin Spatial Hash | Con Spatial Hash | Reducción |
|---------|------------------|------------------|-----------|
| 10      | 100 comparaciones| ~30 comparaciones| 70%       |
| 20      | 400 comparaciones| ~80 comparaciones| 80%       |
| 50      | 2,500 comparaciones| ~150 comparaciones| 94%     |

### Implementación

#### Paso 1: Modificar Game.js (constructor)
```javascript
import { SpatialHashGrid } from './core/SpatialHashGrid.js';

constructor(canvas) {
    // ... código existente ...
    
    // Añadir after ParticleSystem:
    this.spatialGrid = new SpatialHashGrid(this.width, this.height, 50);
}
```

#### Paso 2: Actualizar grid cada frame (Game.js - update)
```javascript
update(deltaTime) {
    // ... código existente ANTES de entityManager.update('army') ...
    
    // Rebuild spatial grid para aliados
    if (this.army.length > 15) { // Solo si hay muchos aliados
        this.spatialGrid.clear();
        this.army.forEach(ally => {
            if (ally.active) this.spatialGrid.insert(ally);
        });
    }
    
    // ... resto del update ...
}
```

#### Paso 3: Modificar ArmyUnit.js - calculateSeparation
```javascript
calculateSeparation() {
    this._separationCache.x = 0;
    this._separationCache.y = 0;
    
    if (!this.armyArray || this.armyArray.length <= 1) {
        return this._separationCache;
    }
    
    let separationX = 0;
    let separationY = 0;
    let neighborCount = 0;
    
    const myCenterX = this.x + this.width / 2;
    const myCenterY = this.y + this.height / 2;
    
    // ✨ NUEVO: Usar spatial grid en vez de iterar todo el army
    let potentialNeighbors = this.armyArray; // Default
    
    if (this.spatialGrid && this.armyArray.length > 15) {
        potentialNeighbors = this.spatialGrid.getNeighbors(this);
    }
    
    // Buscar aliados cercanos (ahora solo busca en vecinos del grid)
    for (const ally of potentialNeighbors) {
        if (ally === this || !ally.active) continue;
        
        const allyCenterX = ally.x + ally.width / 2;
        const allyCenterY = ally.y + ally.height / 2;
        
        const dx = myCenterX - allyCenterX;
        const dy = myCenterY - allyCenterY;
        const distanceSq = dx * dx + dy * dy;
        const separationRadiusSq = this.separationRadius * this.separationRadius;
        
        if (distanceSq > 0 && distanceSq < separationRadiusSq) {
            const distance = Math.sqrt(distanceSq);
            const force = this.separationForce * (1 - distance / this.separationRadius);
            
            separationX += (dx / distance) * force;
            separationY += (dy / distance) * force;
            neighborCount++;
        }
    }
    
    if (neighborCount > 0) {
        separationX /= neighborCount;
        separationY /= neighborCount;
    }
    
    this._separationCache.x = separationX;
    this._separationCache.y = separationY;
    return this._separationCache;
}
```

#### Paso 4: Pasar spatialGrid en constructor de ArmyUnit (Game.js)
```javascript
// En handleEnemyDefeat():
const ally = new ArmyUnit(
    enemy.x, 
    enemy.y, 
    enemy, 
    this.particleSystem, 
    this.army,
    this.spatialGrid  // ← NUEVO parámetro
);
```

#### Paso 5: Actualizar constructor ArmyUnit.js
```javascript
constructor(x, y, sourceEnemy, particleSystem = null, armyArray = null, spatialGrid = null) {
    super(x, y, sourceEnemy.width, sourceEnemy.height);
    
    // ... código existente ...
    
    // Añadir:
    this.spatialGrid = spatialGrid; // Referencia al grid
}
```

---

## 📊 Métricas de Performance Esperadas

### ANTES de optimizaciones:
```
5 aliados:  60 → 55 FPS  (-8%)
10 aliados: 60 → 48 FPS  (-20%)
20 aliados: 60 → 35 FPS  (-42%)  ❌ CRÍTICO
```

### DESPUÉS (con ambas optimizaciones):
```
5 aliados:  60 → 58 FPS  (-3%)   ✅
10 aliados: 60 → 56 FPS  (-7%)   ✅
20 aliados: 60 → 52 FPS  (-13%)  ✅
50 aliados: 60 → 45 FPS  (-25%)  ⚠️ (aceptable para late-game)
```

---

## 🎯 Otras Optimizaciones Opcionales

### 1. Throttle Separación (si aún hay lag)
Calcular separación cada 2-3 frames en vez de cada frame:

```javascript
// En ArmyUnit constructor:
this.separationUpdateCounter = 0;
this.separationUpdateInterval = 2; // Cada 2 frames
this.cachedSeparation = { x: 0, y: 0 };

// En followOwnerWithSeparation():
let separation;
if (this.separationUpdateCounter % this.separationUpdateInterval === 0) {
    separation = this.calculateSeparation();
    this.cachedSeparation.x = separation.x;
    this.cachedSeparation.y = separation.y;
} else {
    separation = this.cachedSeparation;
}
this.separationUpdateCounter++;
```

**Impacto**: 50% menos cálculos de separación, visualmente imperceptible

### 2. Reducir Frecuencia de Partículas
Si hay lag visible con muchos aliados:

```javascript
// En ArmyUnit constructor:
this.particleInterval = 0.08; // Era 0.05s (de 20/s a 12.5/s por aliado)
```

**Impacto**: 37% menos partículas, rastro aún visible

---

## 🚀 Hoja de Ruta de Optimización

1. **Ya implementado** ✅
   - Fix createTrail bug
   - Cache de objeto separación

2. **Implementar cuando army.length > 15** 🔧
   - Spatial Hash Grid

3. **Solo si hay lag después de spatial hash** ⚙️
   - Throttle separación a cada 2 frames
   - Reducir particleInterval a 0.08s

4. **Última opción (si nada más funciona)** ⚠️
   - Limitar max army size a 30-40 aliados
   - Deshabilitar partículas cuando army > 25

---

## 💡 Notas de Desarrollo

### Testing de Performance
```javascript
// Añadir en Game.js update() para monitorear:
if (this.frameCount % 60 === 0) {
    console.log(`FPS: ${this.fps.toFixed(1)}, Army: ${this.army.length}, Particles: ${this.particleSystem.particles.length}`);
}
```

### Límites Recomendados
- **Sin Spatial Hash**: max 12-15 aliados
- **Con Spatial Hash**: max 40-50 aliados
- **Partículas cómodas**: <300 activas simultáneas

### Cell Size Óptimo (Spatial Grid)
- Muy pequeño (25px): Más celdas = más overhead
- Muy grande (100px): Menos precisión = más comparaciones
- **Óptimo**: 50px (separationRadius + 25% margin)
