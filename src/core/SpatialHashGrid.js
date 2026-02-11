/**
 * SpatialHashGrid - Optimización O(N) para detección de vecinos
 * Reduce búsqueda de separación de O(N²) a O(N)
 * 
 * USAR CUANDO: army.length > 15 aliados para evitar FPS drop
 * 
 * PERFORMANCE:
 *   - 20 aliados: O(N²)=400 comparaciones → O(N)=~40 comparaciones (90% reducción)
 *   - 50 aliados: O(N²)=2,500 comparaciones → O(N)=~100 comparaciones (96% reducción)
 */
export class SpatialHashGrid {
    constructor(width, height, cellSize = 50) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        
        // Calcular dimensiones del grid
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        
        // Grid de celdas (array 2D)
        this.grid = [];
        this.clear();
    }
    
    /**
     * Limpia el grid (llamar al inicio de cada frame)
     */
    clear() {
        this.grid = Array(this.rows).fill(null).map(() => 
            Array(this.cols).fill(null).map(() => [])
        );
    }
    
    /**
     * Inserta una entidad en el grid
     * @param {Entity} entity - Entidad con propiedades x, y, width, height
     */
    insert(entity) {
        const centerX = entity.x + entity.width / 2;
        const centerY = entity.y + entity.height / 2;
        
        const col = Math.floor(centerX / this.cellSize);
        const row = Math.floor(centerY / this.cellSize);
        
        // Validar bounds
        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            this.grid[row][col].push(entity);
        }
    }
    
    /**
     * Obtiene vecinos cercanos a una entidad (9 celdas: actual + 8 adyacentes)
     * @param {Entity} entity - Entidad central
     * @returns {Array<Entity>} Lista de vecinos potenciales
     */
    getNeighbors(entity) {
        const centerX = entity.x + entity.width / 2;
        const centerY = entity.y + entity.height / 2;
        
        const col = Math.floor(centerX / this.cellSize);
        const row = Math.floor(centerY / this.cellSize);
        
        const neighbors = [];
        
        // Iterar sobre las 9 celdas (3x3 grid centrado en la entidad)
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                // Validar bounds
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                    neighbors.push(...this.grid[r][c]);
                }
            }
        }
        
        return neighbors;
    }
}
