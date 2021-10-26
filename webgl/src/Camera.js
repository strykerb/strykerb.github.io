class Camera {
    constructor(){
        this.eye = new Vector3([0, 1, 5.0]);
        this.center = new Vector3([0, 0, 0]);
        this.up = new Vector3([0, 1, 0]);
        this.viewMatrix = new Matrix4();
        this.projMatrix = new Matrix4();
        this.tiltAngle = 0;
        this.panAngle = 0;
        this.currZoom = 60;
        this.ortho = false;
        this.movingForward = false;
        this.movingBackwards = false;
        this.movingLeft = false;
        this.movingRight = false;


        this.projMatrix.setPerspective(60, canvas.width/canvas.height, 0.1, 1000);

        this.updateView();

    }

    moveForward(scale){
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        
        // Cancel out y movement so camera stays attached to the ground
        forward.sub(new Vector3([0, forward.elements[1], 0]));
        forward.normalize();
        forward.mul(scale);

        this.eye.add(forward);
        this.center.add(forward);

        this.updateView();
    }

    moveSideways(scale){
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        let sideways = Vector3.cross(this.up, forward);  // Calculate u equal to cross product of up and forward
        sideways.normalize();
        sideways.mul(scale);

        this.eye.add(sideways);
        this.center.add(sideways);

        this.updateView();
    }

    moveUp(scale){
        let up = new Vector3([0, 1, 0]);
        up.mul(scale);

        this.eye.add(up);
        this.center.add(up);

        this.updateView();
    }

    tilt(angle){
        // Changes the up vector

        this.tiltAngle += angle;
        
        // Clamp tilt angle to prevent front/back flips
        if (this.tiltAngle < -90){this.tiltAngle = -90;}
        if (this.tiltAngle > 90){this.tiltAngle = 90;}

        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        
        // Cancel out y-offset of lookAt
        forward.sub(new Vector3([0, forward.elements[1], 0]));

        // Calculate X-axis without any tilt
        let xAxis = Vector3.cross(forward, new Vector3([0, 1,0]));

        let rotMatrix = new Matrix4();

        // Make Tilt angle relative to original tilt value
        rotMatrix.setRotate(this.tiltAngle, 
            xAxis.elements[0],
            xAxis.elements[1],
            xAxis.elements[2]);
        
        this.up = rotMatrix.multiplyVector3(new Vector3([0, 1, 0]));

        // let forward_prime = Vector3.cross(xAxis, this.up);
        let forward_prime = rotMatrix.multiplyVector3(forward);
        this.center.set(forward_prime);

        //console.log(this.tiltAngle);

        this.updateView();
    }

    pan(angle){
        
        // Rotate center point around the up vector
        let rotMatrix = new Matrix4();
        rotMatrix.setRotate(angle, this.up.elements[0],
                                this.up.elements[1],
                                this.up.elements[2]);
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);

        let forward_prime = rotMatrix.multiplyVector3(forward);
        this.center.set(forward_prime);

        this.updateView();
    }

    zoomIn(scale){
        this.currZoom += scale;
        if (this.currZoom < 30){this.currZoom = 30;}
        if (this.currZoom > 90){this.currZoom = 90;}
        this.projMatrix.setPerspective(this.currZoom, canvas.width/canvas.height, 0.1, 1000);
    }

    toggleOrthographic(){
        if(this.ortho) {
            this.ortho = false;
            this.projMatrix.setPerspective(this.currZoom, canvas.width/canvas.height, 0.1, 1000);
        }
        else {
            this.ortho = true;
            this.projMatrix.setOrtho(-1, 1, -1, 1, 0.1, 1000);
        }
        
        // let bound = 2;
        
        // this.ortho = !this.ortho;
        // if (this.ortho){
        //     this.projMatrix.setOrtho(
        //         new Vector3([-bound, 0, 0]), 
        //         new Vector3([bound, 0, 0]), 
        //         new Vector3([0, bound, 0]),
        //         new Vector3([0, -bound, 0]),
        //         0.1, 1);
        // } else {
        //     this.projMatrix.setPerspective(this.currZoom, canvas.width/canvas.height, 0.1, 1000);
        // }
        // console.log(this.projMatrix);
    }

    updateView(){
        this.viewMatrix.setLookAt(
            this.eye.elements[0],      // Position
            this.eye.elements[1], 
            this.eye.elements[2],
            this.center.elements[0],   // Center
            this.center.elements[1], 
            this.center.elements[2],
            this.up.elements[0],        // Up
            this.up.elements[1], 
            this.up.elements[2]
            );
    }
}