class Sphere{
    constructor(){
        var SPHERE_DIV = 13;

        var i, ai, si, ci;
        var j, aj, sj, cj;
        var p1, p2;

        this.smoothVertices = [];
        this.smoothIndices = [];

        // Generate coordinates
        for (j = 0; j <= SPHERE_DIV; j++) {
            aj = j * Math.PI / SPHERE_DIV;
            sj = Math.sin(aj);
            cj = Math.cos(aj);
            for (i = 0; i <= SPHERE_DIV; i++) {
            ai = i * 2 * Math.PI / SPHERE_DIV;
            si = Math.sin(ai);
            ci = Math.cos(ai);

            this.smoothVertices.push(si * sj);  // X
            this.smoothVertices.push(cj);       // Y
            this.smoothVertices.push(ci * sj);  // Z
            }
        }

        // Generate indices
        for (j = 0; j < SPHERE_DIV; j++) {
            for (i = 0; i < SPHERE_DIV; i++) {
            p1 = j * (SPHERE_DIV+1) + i;
            p2 = p1 + (SPHERE_DIV+1);

            this.smoothIndices.push(p1);
            this.smoothIndices.push(p2);
            this.smoothIndices.push(p1 + 1);

            this.smoothIndices.push(p1 + 1);
            this.smoothIndices.push(p2);
            this.smoothIndices.push(p2 + 1);
            }
        }

        this.smoothNormals = this.smoothVertices;

        // Default transform values: Unit Cylinder
        this.translate = [0.0, 0.0, 0.0];
        this.rotate    = [0.0, 0.0, 0.0];
        this.scale     = [1.0, 1.0, 1.0];
    }

    setScale(x, y, z) {
        this.scale[0] = x;
        this.scale[1] = y;
        this.scale[2] = z;
    }

    setRotate(x, y, z) {
        this.rotate[0] = x;
        this.rotate[1] = y;
        this.rotate[2] = z;
    }

    setTranslate(x, y, z) {
        this.translate[0] = x;
        this.translate[1] = y;
        this.translate[2] = z;
    }
}