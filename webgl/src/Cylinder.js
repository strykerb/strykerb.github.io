class Cylinder {
    
    // Params: n = number of sides, color = color of cylinder when rendered
    constructor(n, color, gun) {

        if (gun){this.gun = true;}
        if (!gun){this.gun = false}
        
        // |_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-|
        // |                                                |
        // |   PART 1: Initialize some values               |
        // |_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-|

        // Set angle between each normal vector to aid calculations
        let angle = Math.PI*2/n;

        // Array to store cylinder vertices for flat shading
        // First vertex is center of the front face
        this.flatVertices = [0.0, 0.0, 1.0];
        
        // Array to store cylinder vertices for smooth shading
        // First vertex is center of the front face
        this.smoothVertices = [0.0, 0.0, 1.0];
        
        // Normal of first vertex is unit vector on z axis
        this.flatNormals = [0.0, 0.0, 1.0];

        // Array to store Vertex Normals. Start the first vertex normal as a unit vector.
        
        this.smoothNormals = Array(6*n+6).fill(0.0);
        // console.log(this.smoothNormals[0].elements[2]);

        // Array to store polygon indices
        this.flatIndices = [];

        this.smoothIndices = [];

        
        // |_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-|
        // |                                                |
        // |   PART 2: Generate Front Cap                   |
        // |_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-|
        
        // Set counter
        let i = 1;
        
        while (i<n){
            // Set vertex x, y, z based on vertex count and number of total sides
            let x = Math.cos(i*angle);
            let y = Math.sin(i*angle);
            let z = 1.0;
            this.flatVertices.push(x, y, z);
            this.smoothVertices.push(x, y, z);
            
            // Set the normal of each front cap vertex to the unit vector on z axis
            this.flatNormals.push(0.0, 0.0, 1.0);

            // Add this polygon normal to all adjacent vertex normals
            this.smoothNormals[0] += 0.0;
            this.smoothNormals[1] += 0.0;
            this.smoothNormals[2] += z;

            this.smoothNormals[3*i] += 0.0;
            this.smoothNormals[3*i+1] += 0.0;
            this.smoothNormals[3*i+2] += z;

            this.smoothNormals[3*(i+1)] += 0.0;
            this.smoothNormals[3*(i+1)+1] += 0.0;
            this.smoothNormals[3*(i+1)+2] += z;
            
            // this.smoothNormals[0].add(new Vector3([0.0, 0.0, 1.0]));
            // this.smoothNormals[i].add(new Vector3([0.0, 0.0, 1.0]));
            // this.smoothNormals[i+1].add(new Vector3([0.0, 0.0, 1.0]));

            // Generate the front cap polygons
            this.flatIndices.push(0, i, i+1);
            this.smoothIndices.push(0, i, i+1);
            
            // SIDE
            // this.flatIndices.push(i, i+n, i+n+1);

            // Increment counter and continue
            i++;
        }
        // Handle front wrap around case (connecting last face to the first)
        this.flatVertices.push(1.0, 0.0, 1.0);
        this.flatNormals.push(0.0, 0.0, 1.0);
        this.flatIndices.push(0, n, 1);
        
        
        this.smoothVertices.push(1.0, 0.0, 1.0);
        this.smoothIndices.push(0, n, 1);

        this.smoothNormals[0] += 0.0;
        this.smoothNormals[1] += 0.0;
        this.smoothNormals[2] += 1.0;

        this.smoothNormals[3] += 0.0;
        this.smoothNormals[4] += 0.0;
        this.smoothNormals[5] += 1.0;

        this.smoothNormals[3*n] += 0.0;
        this.smoothNormals[3*n+1] += 0.0;
        this.smoothNormals[3*n+2] += 1.0;


        // |_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-|
        // |                                                |
        // |   PART 3: Generate Cylinder Sides              |
        // |_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-|
        
        // Reset counter to 1
        i = 0;

        let lastNorm;

        // GENERATE ALL SIDES
        while (i < n){
            // Calculate the four corner vertices of this face
            let a = new Vector3([Math.cos(i*angle), Math.sin(i*angle), 1.0]);
            let b = new Vector3([Math.cos(i*angle), Math.sin(i*angle), 0.0]);
            let c = new Vector3([Math.cos((i+1)*angle), Math.sin((i+1)*angle), 1.0]);
            let d = new Vector3([Math.cos((i+1)*angle), Math.sin((i+1)*angle), 0.0]);

            // Store each vertex
            this.flatVertices.push(a.elements[0], a.elements[1], a.elements[2]);
            this.flatVertices.push(b.elements[0], b.elements[1], b.elements[2]);
            this.flatVertices.push(c.elements[0], c.elements[1], c.elements[2]);
            this.flatVertices.push(d.elements[0], d.elements[1], d.elements[2]);
            
            // Calculate polygon normal with cross product
            let norm = Vector3.cross(b.sub(a), d.sub(a)).normalize();
            
            // Store all vertex normals, which are all equal to the polygon normal
            let idx;
            for(idx = 0; idx < 4; idx++){
                this.flatNormals.push(norm.elements[0], norm.elements[1], norm.elements[2]);
            }

            // Store the polygon indices
            this.flatIndices.push((n+1)+(4*i), (n+1)+(4*i)+1, (n+1)+(4*i)+3);
            this.flatIndices.push((n+1)+(4*i), (n+1)+(4*i)+3, (n+1)+(4*i)+2);
            
            // Need to handle special case outside the loop
            if (i == n-1){
                lastNorm = norm;
                break;
            }
            this.smoothIndices.push(i+1, n+i+1, n+i+2);
            this.smoothIndices.push(i+1, n+i+2, i+2);

            this.smoothNormals[(i+1)*3] += norm.elements[0];
            this.smoothNormals[(i+1)*3+1] += norm.elements[1];
            this.smoothNormals[(i+1)*3+2] += norm.elements[2];

            this.smoothNormals[(n+i+1)*3] += norm.elements[0];
            this.smoothNormals[(n+i+1)*3+1] += norm.elements[1];
            this.smoothNormals[(n+i+1)*3+2] += norm.elements[2];

            this.smoothNormals[(n+i+2)*3] += norm.elements[0];
            this.smoothNormals[(n+i+2)*3+1] += norm.elements[1];
            this.smoothNormals[(n+i+2)*3+2] += norm.elements[2];

            this.smoothNormals[(i+2)*3] += norm.elements[0];
            this.smoothNormals[(i+2)*3+1] += norm.elements[1];
            this.smoothNormals[(i+2)*3+2] += norm.elements[2];

            i++;
        }

        // Handle the special case
        this.smoothIndices.push(n, 2*n, n+1);
        this.smoothIndices.push(n, n+1, 1);

        this.smoothNormals[(n)*3] += lastNorm.elements[0];
        this.smoothNormals[(n)*3+1] += lastNorm.elements[1];
        this.smoothNormals[(n)*3+2] += lastNorm.elements[2];

        this.smoothNormals[(2*n)*3] += lastNorm.elements[0];
        this.smoothNormals[(2*n)*3+1] += lastNorm.elements[1];
        this.smoothNormals[(2*n)*3+2] += lastNorm.elements[2];

        this.smoothNormals[(n+1)*3] += lastNorm.elements[0];
        this.smoothNormals[(n+1)*3+1] += lastNorm.elements[1];
        this.smoothNormals[(n+1)*3+2] += lastNorm.elements[2];

        this.smoothNormals[3] += lastNorm.elements[0];
        this.smoothNormals[4] += lastNorm.elements[1];
        this.smoothNormals[5] += lastNorm.elements[2];

        
        // |_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-|
        // |                                                |
        // |   PART 4: Generate Back Cap                    |
        // |_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-|

        // Reset counter
        i = 1;
        
        // Calculate the back face of the cylinder
        while (i<n){
            // Set vertex x, y, z based on vertex count and number of total sides
            this.flatVertices.push(Math.cos(i*angle), Math.sin(i*angle), 0.0);
            this.smoothVertices.push(Math.cos(i*angle), Math.sin(i*angle), 0.0);

            // Store indices of this polygon
            this.flatIndices.push(6*n+1, 5*n+i, 5*n+i+1);

            this.smoothIndices.push(n+i, 2*n+1, n+i+1);

            // Store surface normal
            this.flatNormals.push(0.0, 0.0, -1.0);
            
            this.smoothNormals[(n+i)*3] += 0.0;
            this.smoothNormals[(n+i)*3+1] += 0.0;
            this.smoothNormals[(n+i)*3+2] += -1.0;

            this.smoothNormals[(n+i+1)*3] += 0.0;
            this.smoothNormals[(n+i+1)*3+1] += 0.0;
            this.smoothNormals[(n+i+1)*3+2] += -1.0;

            this.smoothNormals[(2*n+1)*3] += 0.0;
            this.smoothNormals[(2*n+1)*3+1] += 0.0;
            this.smoothNormals[(2*n+1)*3+2] += -1.0;


            // Increment counter and continue
            i++;
        }
        
        // Handle back wrap around case (connecting last face to the first)
        this.flatVertices.push(1.0, 0.0, 0.0);
        this.flatNormals.push(0.0, 0.0, -1.0);
        this.flatIndices.push(6*n+1, 6*n, 5*n+1);

        this.smoothVertices.push(1.0, 0.0, 0.0);
        this.smoothIndices.push(2*n, 2*n+1, n+1);
        
        this.smoothNormals[(2*n)*3] += 0.0;
        this.smoothNormals[(2*n)*3+1] += 0.0;
        this.smoothNormals[(2*n)*3+2] += -1.0;

        this.smoothNormals[(n+1)*3] += 0.0;
        this.smoothNormals[(n+1)*3+1] += 0.0;
        this.smoothNormals[(n+1)*3+2] += -1.0;

        this.smoothNormals[(2*n+1)*3] += 0.0;
        this.smoothNormals[(2*n+1)*3+1] += 0.0;
        this.smoothNormals[(2*n+1)*3+2] += -1.0;

        // Add the back center vertex
        this.flatVertices.push(0.0, 0.0, 0.0);
        this.smoothVertices.push(0.0, 0.0, 0.0);
        this.flatNormals.push(0.0, 0.0, -1.0);
        
        // Assign Color Property from params
        this.color = color;

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
