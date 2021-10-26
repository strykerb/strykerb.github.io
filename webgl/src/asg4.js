// asg4.js
// Author: Stryker Buffington

let VSHADER=`
    precision mediump float;
    attribute vec3 a_Position;
    attribute vec3 a_Normal;

    uniform vec3 u_eyePosition;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjMatrix;


    uniform vec3 u_Color;

    uniform vec3 u_diffuseColor1;
    uniform vec3 u_diffuseColor2;
    uniform vec3 u_ambientColor;
    uniform vec3 u_specularColor;
    uniform float u_specularAlpha;
    uniform vec3 u_lightPosition;

    uniform vec3 u_lightDirection;

    varying vec4 v_Color;

    vec3 calcSpecular(vec3 r, vec3 v){
        float rDotV = max(dot(r, v), 0.0);
        float rDotVPowAlpha = pow(rDotV, u_specularAlpha);
        return u_specularColor * u_Color * rDotVPowAlpha;
    }
    
    vec3 calcAmbient(){
        return u_ambientColor * u_Color;
    }
    
    vec3 calcDiffuse(vec3 l, vec3 n, vec3 lColor){
        float nDotL = max(dot(l, n), 0.0);
        return lColor * u_Color * nDotL;
    }

    void main() {
      vec4 worldPos =  u_ModelMatrix * vec4(a_Position, 1.0);  

      vec3 n = normalize(u_NormalMatrix * vec4(a_Normal, 0.0)).xyz;
      vec3 l1 = normalize(u_lightPosition - worldPos.xyz);
      //   vec3 l1 = normalize(worldPos.xyz - u_lightPosition);
      vec3 l2 = normalize(u_lightDirection);
      vec3 v = normalize(u_eyePosition - worldPos.xyz);
      vec3 r = reflect(l1, n);

      // SMOOTH SHADING (GORAURD)
      vec3 ambient = calcAmbient();
      vec3 diffuse1 = calcDiffuse (l1, n, u_diffuseColor1);
      vec3 diffuse2 = calcDiffuse (l2, n, u_diffuseColor2);
      vec3 specular = calcSpecular(r, v);
      v_Color = vec4(ambient + (diffuse1 + diffuse2) + specular, 1.0);

      gl_Position = u_ProjMatrix * u_ViewMatrix * worldPos;
    }
`;

let FSHADER=`
    precision mediump float;
    uniform vec3 u_Color;
    varying vec4 v_Color;

    void main() {
        gl_FragColor = v_Color;
    }
`;

let modelMatrix = new Matrix4();
let normalMatrix = new Matrix4();

// Lighting Variables
let lightPosition = new Vector3([-1.0, 0.3, -0.75]);
let lightDirection = new Vector3([1.0, 1.0, -2.0]);

let cylinders = [];

// Uniform locations
let u_ModelMatrix = null;
let u_NormalMatrix = null;
let u_ViewMatrix = null;
let u_ProjMatrix = null;

let u_Color = null;
let u_diffuseColor1 = null;
let u_diffuseColor2 = null;
let u_ambientColor = null;
let u_specularColor = null;

let u_specularAlpha = null;
let u_lightPosition = null;
let u_eyePosition = null;
let u_pumpPosition = null;

// Set up some constants
let MAX_SCALE = 200;
let MAX_TRANSLATE = 100;

let wireFrame = false;
let smoothShade = true;
let flatShade = false;
let pointLight = true;
let directionalLight = true;
let specular = true;
let diffuse = true;
let ambient = true;
let jumping = false;


let pL = 1;
let dL = 1;

let camSpeed = 0.05;
let panSpeed = 0.5;
let zoomAmount = 5;
let jumpHeight = 5;
let jumpTime = 4;

let wDown = false;
let aDown = false;
let sDown = false;
let dDown = false;

let pumpPosition = new Vector3([0, 0, 0]);
let pumpRotation = new Vector3([0, 0, 0]);


function main() {
    // Retrieving the canvas tag from html document
  canvas = document.getElementById("canvas");

  // Get the rendering context for 2D drawing (vs WebGL)
  gl = canvas.getContext("webgl");
  if(!gl) {
      console.log("Failed to get webgl context");
      return -1;
  }

  // Clear screen
  gl.enable(gl.DEPTH_TEST);

  //gl.clearColor(0.8, 0.9, 1.0, 1.0);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//   gl.enable(gl.CULL_FACE);
//   gl.cullFace(gl.BACK);

  // Compiling both shaders and sending them to the GPU
  if(!initShaders(gl, VSHADER, FSHADER)) {
      console.log("Failed to initialize shaders.");
      return -1;
  }

  // Retrieve uniforms from shaders

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");

  u_Color = gl.getUniformLocation(gl.program, "u_Color");
  u_ambientColor = gl.getUniformLocation(gl.program, "u_ambientColor");
  u_diffuseColor1 = gl.getUniformLocation(gl.program, "u_diffuseColor1");
  u_diffuseColor2 = gl.getUniformLocation(gl.program, "u_diffuseColor2");
  u_specularColor = gl.getUniformLocation(gl.program, "u_specularColor");
  
  u_specularAlpha = gl.getUniformLocation(gl.program, "u_specularAlpha");
  u_lightPosition = gl.getUniformLocation(gl.program, "u_lightPosition");
  u_lightDirection = gl.getUniformLocation(gl.program, "u_lightDirection");

    // Set light data
    gl.uniform3f(u_ambientColor, 0.2, 0.2, 0.2);
    gl.uniform3f(u_diffuseColor1, 1.0, 0.8, 0.2);
    gl.uniform3f(u_diffuseColor2, 0.5, 0.5, 0.5);

    gl.uniform3f(u_specularColor, 1.0, 0.8, 0.2);

    gl.uniform1f(u_specularAlpha, 8.0);

    gl.uniform3fv(u_lightPosition, lightPosition.elements);
    gl.uniform3fv(u_lightDirection, lightDirection.elements);

    // Instantiate Camera 
    camera = new Camera();

  generateScene();

  vertexBuffer = initBuffer("a_Position", 3);
  normalBuffer = initBuffer("a_Normal", 3);

  indexBuffer = gl.createBuffer();
  if(!indexBuffer) {
      console.log("Can't create buffer.")
      return -1;
  }

  checkPlayerInput();
  draw();
}

function drawCylinder(cylinder) {
    // Update model matrix combining translate, rotate and scale from cylinder
    modelMatrix.setIdentity();

    // Apply translation for this cylinder
    modelMatrix.translate(cylinder.translate[0], cylinder.translate[1], cylinder.translate[2]);

    // Apply rotations for this cylinder
    modelMatrix.rotate(cylinder.rotate[0], 1, 0, 0);
    modelMatrix.rotate(cylinder.rotate[1], 0, 1, 0);
    modelMatrix.rotate(cylinder.rotate[2], 0, 0, 1);

    // Apply scaling for this cylinder
    modelMatrix.scale(cylinder.scale[0], cylinder.scale[1], cylinder.scale[2]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    
    
    // Compute normal matrix N_mat = (M^-1).T
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    // Set u_Color variable from fragment shader
    gl.uniform3f(u_Color, cylinder.color[0], cylinder.color[1], cylinder.color[2]);

    if (smoothShade){
        // Send vertices and indices from cylinder to the shaders
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinder.smoothVertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinder.smoothNormals), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylinder.smoothIndices), gl.STATIC_DRAW);

        // Draw cylinder
        gl.drawElements(gl.TRIANGLES, cylinder.smoothIndices.length, gl.UNSIGNED_SHORT, 0);
    } else {
        // Send vertices and indices from cylinder to the shaders
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinder.flatVertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinder.flatNormals), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylinder.flatIndices), gl.STATIC_DRAW);

        // Draw cylinder
        if (flatShade){
            gl.drawElements(gl.TRIANGLES, cylinder.flatIndices.length, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawElements(gl.LINE_LOOP, cylinder.flatIndices.length, gl.UNSIGNED_SHORT, 0);
        }
    }
}

function drawSphere(sphere) {
    let smooth = true;
    
    // Update model matrix combining translate, rotate and scale from cylinder
    modelMatrix.setIdentity();

    // Apply translation for this cylinder
    modelMatrix.translate(sphere.translate[0], sphere.translate[1], sphere.translate[2]);

    // Apply rotations for this cylinder
    modelMatrix.rotate(sphere.rotate[0], 1, 0, 0);
    modelMatrix.rotate(sphere.rotate[1], 0, 1, 0);
    modelMatrix.rotate(sphere.rotate[2], 0, 0, 1);

    // Apply scaling for this cylinder
    modelMatrix.scale(sphere.scale[0], sphere.scale[1], sphere.scale[2]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Compute normal matrix N_mat = (M^-1).T
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    // Set u_Color variable from fragment shader
    gl.uniform3f(u_Color, 1.0, 1.0, 1.0);

    if (smooth){
        // Send vertices and indices from cylinder to the shaders
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphere.smoothVertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphere.smoothNormals), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphere.smoothIndices), gl.STATIC_DRAW);

        // Draw cylinder
        gl.drawElements(gl.TRIANGLES, sphere.smoothIndices.length, gl.UNSIGNED_SHORT, 0);
    } 
}

function initBuffer(attibuteName, n) {
    let shaderBuffer = gl.createBuffer();
    if(!shaderBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);

    let shaderAttribute = gl.getAttribLocation(gl.program, attibuteName);
    gl.vertexAttribPointer(shaderAttribute, n, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderAttribute);

    return shaderBuffer;
}

cylinderAngle = 0.0;
function draw() {
    // Draw frame
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform3fv(u_lightPosition, lightPosition.elements);
    
    // Set eye positions
    gl.uniform3fv(u_eyePosition, camera.center.elements);
    
    // Update view matrix
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);

    // Update proj matrix
    gl.uniformMatrix4fv(u_ProjMatrix, false, camera.projMatrix.elements);
    
    for(let shape of cylinders) {
        if (shape.constructor.name == "Cylinder"){
            drawCylinder(shape);
        } else {
            drawSphere(shape);
        }
        
    }

    requestAnimationFrame(draw);
}


// Called when pre-constructed cylinders are being made
function createCylinder(n, color, gun) {

    // Create a new cylinder
    let cylinder = new Cylinder(n, color, gun);
    cylinders.push(cylinder);

    return cylinder;
}

function createSphere(){
    
    // Create a new cylinder
    let sphere = new Sphere();
    cylinders.push(sphere);

    return sphere;
}

function onTranslateLight(value) {
    // Translate sphere
    let light = cylinders[0];
    //-1.0, 0.8, -0.5
    light.setTranslate(value/MAX_TRANSLATE, 0.3, -0.75);

    let newPos = new Vector3([value/MAX_TRANSLATE, 0.3, -0.75]);
    lightPosition = newPos;

}


function updateLighting(){
    if (diffuse){
        gl.uniform3f(u_diffuseColor1, pL*1.0, pL*0.8, pL*0.2);
        gl.uniform3f(u_diffuseColor2, dL*0.5, dL*0.5, dL*0.5);
    } else {
        gl.uniform3f(u_diffuseColor1, pL*0.0, pL*0.0, pL*0.0);
        gl.uniform3f(u_diffuseColor2, dL*0.0, dL*0.0, dL*0.0);
    }
    
    if (ambient){
        gl.uniform3f(u_ambientColor, 0.2, 0.2, 0.2);
    } else {
        gl.uniform3f(u_ambientColor, 0.0, 0.0, 0.0);
    }
    
    if (specular){
        gl.uniform3f(u_specularColor, pL*1.0, pL*0.8, pL*0.2);
    } else {
        gl.uniform3f(u_specularColor, 0.0, 0.0, 0.0);
    }
}

function togglePointLight(){
    if (!pointLight){
        pL = 1;
        pointLight = true;
    } else {
        pL = 0;
        pointLight = false;
    }
    if (diffuse){
        gl.uniform3f(u_diffuseColor1, pL*1.0, pL*0.8, pL*0.2);
    } else {
        gl.uniform3f(u_diffuseColor1, 0.0, 0.0, 0.0);
    }
    if (specular){
        gl.uniform3f(u_specularColor, pL*1.0, pL*0.8, pL*0.2);
    } else {
        gl.uniform3f(u_specularColor, 0.0, 0.0, 0.0);
    }
}

function toggleDirectionalLight(){
    if (!directionalLight){
        dL = 1;
        directionalLight = true;
    } else {
        dL = 0;
        directionalLight = false;
    }
    if (diffuse){
        gl.uniform3f(u_diffuseColor2, dL*0.5, dL*0.5, dL*0.5);
    } else {
        gl.uniform3f(u_diffuseColor2, 0.0, 0.0, 0.0);
    }
}

function jump(time){
    if (time <=1000){
        setTimeout(function() {
            time += 100/6;
            camera.moveUp(JumpPosition(time) - camera.eye.elements[1]);
            jump(time); 
        }, 100/6);
    } else {
        jumping = false;
    }
}

function checkPlayerInput(){
    if (wDown){
        camera.moveForward(camSpeed);
    } else if (sDown){
        camera.moveForward(-camSpeed);
    }

    if (aDown){
        camera.moveSideways(camSpeed);
    } else if (dDown){
        camera.moveSideways(-camSpeed);
    }

    let origin = new Vector3([0, 1, 0]);
    if (origin.sub(camera.eye).magnitude() > 10){
        window.location.reload();
    }
    
    setTimeout(function() {
        checkPlayerInput(); 
    }, 100/6);
}

function JumpPosition(x){
    // Convert from milliseconds to seconds
    x /= 1000;

    // f(x) = -(Ax-A/2)^2 + B
    y = -Math.pow(jumpTime*x-(jumpTime/2), 2)+jumpHeight;
    return y;
}

window.addEventListener("keydown", function(event){
    switch (event.key){
        case "w":
            wDown = true;
            sDown = false;
            //camera.moveForward(camSpeed);
            break;
        case "a":
            aDown = true;
            dDown = false;
            //camera.moveSideways(camSpeed);
            break;
        case "s":
            sDown = true;
            wDown = false;
            //camera.moveForward(-camSpeed);
            break;
        case "d":
            dDown = true;
            aDown = false;
            //camera.moveSideways(-camSpeed);
            break;
        case "e":
            camera.zoomIn(-zoomAmount);
            break;
        case "q":
            camera.zoomIn(zoomAmount);
            break;
        case "r":
            camera.toggleOrthographic();
            break;
        case " ":
            if (!jumping){
                jumping = true;
                jump(0);
            }
            break;

        case "1":
            smoothShade = true;
            wireFrame = false;
            flatShade = false;
            updateLighting();
            break;
        case "2":
            smoothShade = false;
            wireFrame = false;
            flatShade = true;
            updateLighting();
            break;
        case "3":
            smoothShade = false;
            wireFrame = true;
            flatShade = false;
            updateLighting();
            break;
        case "4":
            diffuse = !diffuse;
            updateLighting();
            break;
        case "5":
            ambient = !ambient;
            updateLighting();
            break;
        case "6":
            specular = !specular;
            updateLighting();
            break;
        case "7":
            togglePointLight();
            updateLighting();
            break;
        case "8":
            toggleDirectionalLight();
            updateLighting();
            break;
        default:
            break;
    }
});

window.addEventListener("keyup", function(event){
    switch (event.key){
        case "w":
            wDown = false;
            break;
        case "a":
            aDown = false;
            break;
        case "s":
            sDown = false;
            break;
        case "d":
            dDown = false;
            break;
        default:
            break;
    }
});

window.addEventListener("mousemove", function(event){
    camera.pan(Math.round(-event.movementX * panSpeed));
    camera.tilt(Math.round(-event.movementY * panSpeed));
});

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let color = [parseInt(result[1], 16)/255, parseInt(result[2], 16)/255, parseInt(result[3], 16)/255];
    return color;
  }

function generateScene(){
    // Create Point Light Model
    let light = createSphere();
    light.setScale(0.1, 0.1, 0.1);
    light.setTranslate(-1.0, 0.3, -0.5); 

    // let debug = createSphere();
    // debug.setScale(0.75, 0.75, 0.75);

    // //Create Shotgun Out of 7 Cylinders
    let barrel = createCylinder(8, [0.1686274, 0.1686274, 0.16862745], true);
    barrel.setRotate(0, 67, 0);
    barrel.setScale(0.075, 0.075, 1);
    barrel.setTranslate(-0.93, 0, 0);

    let chamber = createCylinder(8, [0.1686274, 0.1686274, 0.16862745], true);
    chamber.setRotate(0, 67, 0);
    chamber.setScale(0.08, 0.125, 0.49);
    chamber.setTranslate(-0.01, -0.05, 0.44);

    let rail = createCylinder(8, [0.1686274, 0.1686274, 0.16862745], true);
    rail.setRotate(0, 59, 0);
    rail.setScale(0.05, 0.04, 1);
    rail.setTranslate(-0.76, -0.13, 0.04);

    let trigger = createCylinder(4, [0.1686274, 0.1686274, 0.16862745], true);
    trigger.setRotate(95, 0, 0);
    trigger.setScale(0.015, 0.01, 0.08);
    trigger.setTranslate(0.45, -0.14, 0.68);

    let handle = createCylinder(8, [0.5372549, 0.3450980, 0.3450980], true);
    handle.setRotate(268, 136, 78);
    handle.setScale(0.085, 0.075, 0.395);
    handle.setTranslate(0.4, 0.02, 0.69);

    let stock = createCylinder(8, [0.5372549, 0.3450980, 0.3450980], true);
    stock.setRotate(0, 67, 0);
    stock.setScale(0.085, 0.13, 0.33);
    stock.setTranslate(0.63, -0.26, 0.69);

    let pump = createCylinder(8, [0.5372549, 0.3450980, 0.3450980], true);
    pump.setRotate(0, 67, 0);
    pump.setScale(0.1, 0.085, 0.395);
    pump.setTranslate(-0.4, -0.13, 0.21);

    let floor = createCylinder(8, [1, 1, 1], false);
    floor.setRotate(90, 0, 0);
    floor.setScale(10, 10, 1);
    floor.setTranslate(0.0, -1.0, 0.0);
}
