// asg5.js
// Author: Stryker Buffington

// Add mozilla header here

// Options that can be configured to alter behavior of the sample
// These are constants but in theory could be changed to variables
// to allow uture UI additions to change them in-flight.

const xRotationDegreesPerSecond = 25;      // Rotation per second around X axis
const yRotationDegreesPerSecond = 15;      // Rotation per second around Y axis
const zRotationDegreesPerSecond = 35;      // Rotation per second around Z axis
const enableRotation = true;
const allowMouseRotation = true;
const allowKeyboardMotion = true;
const enableForcePolyfill = false;
const SESSION_TYPE = "immersive-vr";       // "immersive-vr" or "inline"
// const SESSION_TYPE = "inline";
const MOUSE_SPEED = 0.003;
const MOVE_DISTANCE = 0.4;


// WebXR variables

let polyfill = null;
let xrSession = null;
let xrInputSources = null;
let xrReferenceSpace = null;
let xrButton = null;
let gl = null;
let animationFrameRequestID = 0;
let totalVertexCount = 0;
let testCylinder = null;
let cylinders = [];
let indexBuffer = null;
let rotMatrix = new Matrix4();
let totalRotX = 0;
let totalRotY = 0;
let totalRotZ = 0;

// Renderer variables and constants

const viewerStartPosition = vec3.fromValues(0, 0, -5);
const viewerStartOrientation = vec3.fromValues(0, 0, 1.0);

const upVector = vec3.fromValues(0, 1, 0);
const cubeOrientation = vec3.create();
const cubeMatrix = mat4.create();
const mouseMatrix = mat4.create();

// Conversion constants

const RADIANS_PER_DEGREE = Math.PI / 180.0;

// Vectors used for creating "orthonormal up"; that is,
// the vector pointing straight out of the top of the
// object, even if it's rotated.

const vecX = vec3.create();
const vecY = vec3.create();


// For storing references to the elements into which matrices
// are to be output

let projectionMatrixOut;
let modelMatrixOut;
let cameraMatrixOut;
let normalMatrixOut;
let mouseMatrixOut;

// Log a WebGL error message. The where parameter should be
// a string identifying the circumstance of the error.

function LogGLError(where) {
  let err = gl.getError();
  if (err) {
    console.error(`WebGL error returned by ${where}: ${err}`);
  }
}

//
// Shaders from the original cube demo
//

// Vertex shader program

const vsSource = `
  attribute vec3 aVertexPosition;
  attribute vec3 aVertexNormal;

  uniform mat4 uNormalMatrix;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform highp vec3 u_Color;

  varying highp vec3 vLighting;

  vec3 calcDiffuse(vec3 l, vec3 n, vec3 lColor){
    float nDotL = max(dot(l, n), 0.0);
    return lColor * u_Color * nDotL;
}

  void main(void) {
    highp vec3 lightDirection = normalize(vec3(0.85, 0.8, 0.75));
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    gl_Position = uModelViewMatrix * vec4(aVertexPosition, 0.0);
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
    vec3 n = normalize(uNormalMatrix * vec4(aVertexNormal, 0.0)).xyz;
    vec3 l1 = normalize(lightDirection);

    // Apply lighting effect
    highp vec3 diffuse = calcDiffuse (l1, n, directionalLightColor);
    highp vec3 ambientLight = u_Color * vec3(0.3, 0.3, 0.3);

    vLighting = ambientLight + diffuse;
  }
`;

// Fragment shader program

const fsSource = `
  varying highp vec3 vLighting;

  void main(void) {
    gl_FragColor = vec4(vLighting, 1.0);
  }
`;

window.addEventListener("load", onLoad);

function onLoad() {
  xrButton = document.querySelector("#enter-xr");
  xrButton.addEventListener("click", onXRButtonClick);

  // Get the matrix output elements

  projectionMatrixOut = document.querySelector("#projection-matrix div");
  modelMatrixOut = document.querySelector("#model-view-matrix div");
  cameraMatrixOut = document.querySelector("#camera-matrix div");
  normalMatrixOut = document.querySelector("#normal-matrix div");
  mouseMatrixOut = document.querySelector("#mouse-matrix div");
  
  // Install the WebXR polyfill if needed or if the
  // enableForcePolyfill option is set to true

  if (!navigator.xr || enableForcePolyfill) {
    console.log("Using the polyfill");
    polyfill = new WebXRPolyfill();
  }
  setupXRButton();
}

function setupXRButton() {
  if (navigator.xr.isSessionSupported) {
    navigator.xr.isSessionSupported(SESSION_TYPE)
    .then((supported) => {
      xrButton.disabled = !supported;
    });
  } else {
    navigator.xr.supportsSession(SESSION_TYPE)
    .then(() => {
      xrButton.disabled = false;
    })
    .catch(() => {
      xrButton.disabled = true;
    });
  }
}

async function onXRButtonClick(event) {
  if (!xrSession) {
    navigator.xr.requestSession(SESSION_TYPE)
    .then(sessionStarted);
  } else {
    await xrSession.end();
    
    // If the end event didn't cause us to close things down,
    // do it explicitly here, now that the promise returned by
    // end() has been resolved.
    
    if (xrSession) {
      sessionEnded();
    }
  }
}

// Variables for storing the details about the GLSL program and the
// data it needs.

let shaderProgram = null;
let programInfo = null;
let buffers = null;
let texture = null;

function sessionStarted(session) {
  let refSpaceType;
  
  xrSession = session;
  xrButton.innerText = "Exit WebXR";

  // Listen for the "end" event; when it arrives, we will
  // halt any animations and the like.
  
  xrSession.addEventListener("end", sessionEnded);
  
  // Set up the rendering context for use with the display we're
  // using. Here, we're using a context that's actually
  // visible in the document, in order to see what's going
  // on even without a headset. Normally you would use
  // document.createElement("canvas") to create an offscreen
  // canvas.
  
  let canvas = document.querySelector("canvas");
  gl = canvas.getContext("webgl", { xrCompatible: true });

  // If we have mouse rotation support enabled, add it here.

  if (allowMouseRotation) {
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("contextmenu", (event) => { event.preventDefault(); });
  }
  
  // If keyboard movement is enabled, add it
  
  if (allowKeyboardMotion) {
    document.addEventListener("keydown", handleKeyDown);
  }

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVertexNormal, aTextureCoord,
  // and look up uniform locations.
  programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      u_Color: gl.getUniformLocation(shaderProgram, 'u_Color')
    },
  };

  buffers = initBuffers(gl);

  let debug = createCylinder(8, [0.5, 0, 0.7]);
  debug.setRotate(90, 0, 0);
  debug.setScale(0.1, 0.1, 0.1);
  debug.setTranslate(0, 0, -1);

  let mul = 1;
  let move = -6;

  // // Create Shotgun Out of 7 Cylinders
  // let barrel = createCylinder(8, [0.1686274, 0.1686274, 0.16862745]);
  // barrel.setRotate(0, 67, 0);
  // barrel.setScale(mul*0.075, mul*0.075, mul*1);
  // barrel.setTranslate(-0.93, 0, 0+move);

  // let chamber = createCylinder(8, [0.1686274, 0.1686274, 0.16862745]);
  // chamber.setRotate(0, 67, 0);
  // chamber.setScale(mul*0.08, mul*0.125, mul*0.49);
  // chamber.setTranslate(-0.01, -0.05, 0.44+move);

  // let rail = createCylinder(8, [0.1686274, 0.1686274, 0.16862745]);
  // rail.setRotate(0, 59, 0);
  // rail.setScale(mul*0.05, mul*0.04, mul*1);
  // rail.setTranslate(-0.76, -0.13, 0.04+move);

  // let trigger = createCylinder(4, [0.1686274, 0.1686274, 0.16862745]);
  // trigger.setRotate(95, 0, 0);
  // trigger.setScale(mul*0.015, mul*0.01, mul*0.08);
  // trigger.setTranslate(0.45, -0.14, 0.68+move);

  // let handle = createCylinder(8, [0.5372549, 0.3450980, 0.3450980]);
  // handle.setRotate(268, 136, 78);
  // handle.setScale(mul*0.085,mul* 0.075, mul*0.395);
  // handle.setTranslate(0.4, 0.02, 0.69+move);

  // let stock = createCylinder(8, [0.5372549, 0.3450980, 0.3450980]);
  // stock.setRotate(0, 67, 0);
  // stock.setScale(mul*0.085, mul*0.13, mul*0.33);
  // stock.setTranslate(0.63, -0.26, 0.69+move);

  // let pump = createCylinder(8, [0.5372549, 0.3450980, 0.3450980]);
  // pump.setRotate(0, 67, 0);
  // pump.setScale(mul*0.1, mul*0.085, mul*0.395);
  // pump.setTranslate(-0.4, -0.13, 0.21+move);
  
  // Create the XRWebGLLayer to use as the base layer for the
  // session.
  
  xrSession.updateRenderState({
    baseLayer: new XRWebGLLayer(xrSession, gl)
  });
  
  // Get the reference space for querying poses.  
  
  if (SESSION_TYPE == "immersive-vr") {
    refSpaceType = "local";
  } else {
    refSpaceType = "viewer";
  }
  
  // Set up the initial matrix for the cube's position
  // and orientation.
  
  mat4.fromTranslation(cubeMatrix, viewerStartPosition);
  
  // Initialize the cube's current orientation relative to the
  // global space.
  
  vec3.copy(cubeOrientation, viewerStartOrientation);

  // Set vecY to point straight up copying the upVector
  // into it. vecY will always point outward from the top
  // of the object, regardless of changes made to yaw and
  // pitch by the user.
  
  vec3.copy(vecY, upVector);

  xrSession.requestReferenceSpace(refSpaceType)
  .then((refSpace) => {
    xrReferenceSpace = refSpace;
    xrReferenceSpace = xrReferenceSpace.getOffsetReferenceSpace(
          new XRRigidTransform(viewerStartPosition, cubeOrientation));
    animationFrameRequestID = xrSession.requestAnimationFrame(drawFrame);
  });
  
  return xrSession;
}

function initBuffer(attibuteName, n) {
  
  let shaderBuffer = gl.createBuffer();
    if(!shaderBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);

    let shaderAttribute = gl.getAttribLocation(shaderProgram, attibuteName);
    gl.vertexAttribPointer(shaderAttribute, n, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderAttribute);

    return shaderBuffer;
}

function sessionEnded() {
  xrButton.innerText = "Enter WebXR";
  
  // If we have a pending animation request, cancel it; this
  // will stop processing the animation of the scene.
  
  if (animationFrameRequestID) {
    xrSession.cancelAnimationFrame(animationFrameRequestID);
    animationFrameRequestID = 0;
  }
  xrSession = null;
}

// Variables used to handle rotation using the mouse

let mouseYaw = 0;
let mousePitch = 0;
const inverseOrientation = quat.create();

// Variables for handling keyboard movement

let axialDistance = 0;
let transverseDistance = 0;
let verticalDistance = 0;

// Handle keyboard events; for the WASD keys,
// apply movement forward/backward or side-to-side.
// The "R" key resets the position and orientation
// to the starting point.

function handleKeyDown(event) {
  switch(event.key) {
    // Forward
    case "w":
    case "W":
      verticalDistance -= MOVE_DISTANCE;
      break;
    // Backward
    case "s":
    case "S":
      verticalDistance += MOVE_DISTANCE;
      break;
    // Left
    case "a":
    case "A":
      transverseDistance += MOVE_DISTANCE;
      break;
    // Right
    case "d":
    case "D":
      transverseDistance -= MOVE_DISTANCE;
      break;
    case "ArrowUp":
      axialDistance += MOVE_DISTANCE;
      break;
    case "ArrowDown":
      axialDistance -= MOVE_DISTANCE;
      break;
    // Reset
    case "r":
    case "R":
      transverseDistance = axialDistance = verticalDistance = 0;
      mouseYaw = mousePitch = 0;
      break;
    default:
      break;
  }
}

// Handle the pointermove event; called only if rotation
// using the mouse is enabled. The right mouse button
// must also be down.

function handlePointerMove(event) {
  if (event.buttons & 2) {
    rotateViewBy(event.movementX, event.movementY);
  }
}

// Rotate the view by the specified deltas. Used for
// things like mouse/keyboard/touch controls.

function rotateViewBy(dx, dy) {
  mouseYaw -= dx * MOUSE_SPEED;
  mousePitch -= dy * MOUSE_SPEED;

  if (mousePitch < -Math.PI * 0.5) {
    mousePitch = -Math.PI * 0.5;
  } else if (mousePitch > Math.PI * 0.5) {
    mousePitch = Math.PI * 0.5;
  }
}

let lastFrameTime = 0;

function drawFrame(time, frame) {
  // Adjust for any mouse-based movement of the viewer
  
  let adjustedRefSpace = applyViewerControls(xrReferenceSpace);

  // Get the pose relative to the reference space
  
  let pose = frame.getViewerPose(adjustedRefSpace);

  // Let the session know to go ahead and plan to hit us up
  // again next frame
  
  animationFrameRequestID = frame.session.requestAnimationFrame(drawFrame);
    
  // Make sure we have a pose and start rendering
  
  if (pose) {
    let glLayer = frame.session.renderState.baseLayer;
    
    // Bind the WebGL layer's framebuffer to the renderer
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);
    LogGLError("bindFrameBuffer");

    // Clear the GL context in preparation to render the
    // new frame
    
    gl.clearColor(0, 0, 0, 1.0);
    gl.clearDepth(1.0);                 // Clear everything
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    LogGLError("glClear");
        
    const deltaTime = (time - lastFrameTime) * 0.001;  // Convert to seconds
    lastFrameTime = time;

    // Render all of the frame's views to the output

    for (let view of pose.views) {
      let viewport = glLayer.getViewport(view);
      gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
      LogGLError(`Setting viewport for eye: ${view.eye}`);
      gl.canvas.width = viewport.width * pose.views.length;
      gl.canvas.height = viewport.height;
            
      // Draw the view; typically there's one view for each eye unless
      // we're in a monoscopic view, such as an inline session.
      
      renderScene(gl, view, programInfo, buffers, texture, deltaTime);
    }
  }
}

// Create a new reference space that includes the effect
// of the rotiation indicated by mousePitch and mouseYaw.
// Include also the keyboard motion information if
// available.

function applyViewerControls(refSpace) {
  if (!mouseYaw && !mousePitch && !axialDistance &&
      !transverseDistance && !verticalDistance) {
    return refSpace;
  }
    
  // Compute the quaternion used to rotate the viewpoint based
  // on the pitch and yaw.
  
  quat.identity(inverseOrientation);
  quat.rotateX(inverseOrientation, inverseOrientation, -mousePitch);
  quat.rotateY(inverseOrientation, inverseOrientation, -mouseYaw);
      
  // Compute the true "up" vector for our object.
  
 // vec3.cross(vecX, vecY, cubeOrientation);
 // vec3.cross(vecY, cubeOrientation, vecX);
  
  // Now compute the transform that teleports the object to the
  // specified point and save a copy of it to display to the user
  // later; otherwise we probably wouldn't need to save mouseMatrix
  // at all.
  
  let newTransform = new XRRigidTransform({x: transverseDistance,
                                           y: verticalDistance, 
                                           z: axialDistance},
                         {x: inverseOrientation[0], y: inverseOrientation[1],
                          z: inverseOrientation[2], w: inverseOrientation[3]});
  mat4.copy(mouseMatrix, newTransform.matrix);
  
  // Create a new reference space that transforms the object to the new
  // position and orientation, returning the new reference space.
  
  return refSpace.getOffsetReferenceSpace(newTransform);
}

// Storage for values used by renderScene(), declared
// globally so they aren't being reallocated every
// frame. Could also be in an object if renderScene()
// were a method on an object.

const normalMatrix = mat4.create();
const modelViewMatrix = mat4.create();

//
// Render the scene.
//
function renderScene(gl, view, programInfo, buffers, texture, deltaTime) {
  const xRotationForTime = (xRotationDegreesPerSecond) * deltaTime;
  const yRotationForTime = (yRotationDegreesPerSecond) * deltaTime;
  const zRotationForTime = (zRotationDegreesPerSecond) * deltaTime;
  totalRotX += xRotationForTime;
  totalRotY += yRotationForTime;
  totalRotZ += zRotationForTime;
  
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  console.log(totalRotX);

  rotMatrix.setIdentity();

  if (enableRotation) {
    mat4.rotate(cubeMatrix,  // destination matrix
                cubeMatrix,  // matrix to rotate
                zRotationForTime,     // amount to rotate in radians
                [0, 0, 1]);       // axis to rotate around (Z)
    mat4.rotate(cubeMatrix,  // destination matrix
                cubeMatrix,  // matrix to rotate
                yRotationForTime, // amount to rotate in radians
                [0, 1, 0]);       // axis to rotate around (Y)
    mat4.rotate(cubeMatrix,  // destination matrix
                cubeMatrix,  // matrix to rotate
                xRotationForTime, // amount to rotate in radians
                [1, 0, 0]);       // axis to rotate around (X)

    rotMatrix.rotate(totalRotX , 1, 0, 0);
    rotMatrix.rotate(totalRotY , 0, 1, 0);
    rotMatrix.rotate(totalRotZ , 1, 0, 1);
  }

  gl.useProgram(programInfo.program);
  
  // Send our computed matrices to the GPU by setting the
  // values of the corresponding uniforms.
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    view.projectionMatrix);

  for (let cylinder of cylinders){
    // Update model matrix combining translate, rotate and scale from cylinder
    modelMatrix.setIdentity();

    // Apply translation for this cylinder
    modelMatrix.translate(cylinder.translate[0], cylinder.translate[1], cylinder.translate[2]);

    // Apply rotations for this cylinder
    modelMatrix.rotate(cylinder.rotate[0], 1, 0, 0);
    modelMatrix.rotate(cylinder.rotate[1], 0, 1, 0);
    modelMatrix.rotate(cylinder.rotate[2], 0, 0, 1);

    modelMatrix = modelMatrix.multiply(rotMatrix);

    // Apply scaling for this cylinder
    modelMatrix.scale(cylinder.scale[0], cylinder.scale[1], cylinder.scale[2]);
    // Model view matrix is view.transform.inverse.matrix * cubeMatrix; this
    // moves the object in relation to the viewer in order to simulate the movement
    // of the viewer.
    
    mat4.multiply(modelViewMatrix, view.transform.inverse.matrix, modelMatrix.elements);
    // mat4.multiply(modelViewMatrix, modelMatrix.elements, view.transform.inverse.matrix);
    
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    // Compute normal matrix N_mat = (M^-1).T
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    
    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

    // Set u_Color variable from fragment shader
    gl.uniform3f(programInfo.uniformLocations.u_Color, cylinder.color[0], cylinder.color[1], cylinder.color[2]);

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
          cylinder.smoothVertices,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          cylinder.smoothVertices);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinder.smoothVertices), gl.STATIC_DRAW);
    }
  
    // Tell WebGL how to pull out the normals from
  // the normal buffer into the vertexNormal attribute.
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
      gl.vertexAttribPointer(
        cylinder.smoothNormals,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
        cylinder.smoothNormals);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinder.smoothNormals), gl.STATIC_DRAW);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylinder.smoothIndices), gl.STATIC_DRAW);
    
    // // Send vertices and indices from cylinder to the shaders
    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinder.smoothVertices), gl.STATIC_DRAW);

    // gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinder.smoothNormals), gl.STATIC_DRAW);

    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylinder.smoothIndices), gl.STATIC_DRAW);

    // Draw cylinder
    gl.drawElements(gl.TRIANGLES, cylinder.smoothIndices.length, gl.UNSIGNED_SHORT, 0);
  }

  // Display the matrices to the screen for review and because MathML
  // is a nifty underused technology.
  
  displayMatrix(view.projectionMatrix, 4, projectionMatrixOut);    
  displayMatrix(modelViewMatrix, 4, modelMatrixOut);
  displayMatrix(view.transform.matrix, 4, cameraMatrixOut);
  displayMatrix(normalMatrix, 4, normalMatrixOut);
  displayMatrix(mouseMatrix, 4, mouseMatrixOut);

}

// Replace the contents of the specified block with a
// MathML-rendered matrix, because MathML is nifty!

function displayMatrix(mat, rowLength, target) {
  let outHTML = "";

  if (mat && rowLength && rowLength <= mat.length) {
    let numRows = mat.length / rowLength;
    outHTML = "<math xmlns='http://www.w3.org/1998/Math/MathML' display='block'>\n<mrow>\n<mo>[</mo>\n<mtable>\n";
    
    for (let y=0; y<numRows; y++) {
      outHTML += "<mtr>\n";
      for (let x=0; x<rowLength; x++) {
        outHTML += `<mtd><mn>${mat[(x*rowLength) + y].toFixed(2)}</mn></mtd>\n`;
      }
      outHTML += "</mtr>\n";
    }
    
    outHTML += "</mtable>\n<mo>]</mo>\n</mrow>\n</math>";
  }
  
  target.innerHTML = outHTML;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  LogGLError("createProgram");
  gl.attachShader(shaderProgram, vertexShader);
  LogGLError("attachShader (vertex)");
  gl.attachShader(shaderProgram, fragmentShader);
  LogGLError("attachShader (fragment)");
  
  gl.linkProgram(shaderProgram);
  LogGLError("linkProgram");

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  LogGLError("createShader");

  // Send the source to the shader object

  gl.shaderSource(shader, source);
  LogGLError("shaderSource");

  // Compile the shader program

  gl.compileShader(shader);
  LogGLError("compileShader");

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}


//
// initBuffers
//
// Initialize the buffers we'll need.
//
function initBuffers(gl) {
  let vertexBuffer = initBuffer("aVertexPosition", 3, gl);
  let normalBuffer = initBuffer("aVertexNormal", 3);

  let indexBuffer = gl.createBuffer();
  if(!indexBuffer) {
      console.log("Can't create buffer.")
      return -1;
  }

  return {
    position: vertexBuffer,
    normal: normalBuffer,
    indices: indexBuffer
  };
}


function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}



// Called when pre-constructed cylinders are being made
function createCylinder(n, color) {

    // Create a new cylinder
    let cylinder = new Cylinder(n, color);
    cylinders.push(cylinder);

    return cylinder;
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let color = [parseInt(result[1], 16)/255, parseInt(result[2], 16)/255, parseInt(result[3], 16)/255];
    return color;
}
