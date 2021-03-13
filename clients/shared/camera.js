// Backwards compat with existing clients.
function setupCamera(scene, options = {}) {
  return new SimpleOrbitCamera(scene, options);
}

vec3 = ModelViewer.default.common.glMatrix.vec3;
quat = ModelViewer.default.common.glMatrix.quat;

const vecHeap = vec3.create();
const quatHeap = quat.create();

// Get the vector length between two touches.
function getTouchesLength(touch1, touch2) {
  let dx = touch2.clientX - touch1.clientX;
  let dy = touch2.clientY - touch1.clientY;

  return Math.sqrt(dx * dx + dy * dy);
}

// Touch modes.
const TOUCH_MODE_INVALID = -1;
const TOUCH_MODE_ROTATE = 0;
const TOUCH_MODE_ZOOM = 1;

// An orbit camera setup example.
// Left mouse button controls the orbit itself.
// The right mouse button allows to move the camera and the point it's looking at on the XY plane.
// Scrolling zooms in and out.
class SimpleOrbitCamera {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.canvas = scene.viewer.canvas;
    this.camera = scene.camera;
    // Movement per pixel of movement.
    this.moveSpeed = options.moveSpeed || 2;
    // Rotation in radians per pixel of movement.
    this.rotationSpeed = options.rotationSpeed || (Math.PI / 180);
    // Zoom factor per scroll.
    this.zoomFactor = options.zoomFactor || 0.1;
    this.horizontalAngle = options.horizontalAngle || Math.PI / 2;
    this.verticalAngle = options.verticalAngle || Math.PI / 4;
    this.distance = options.distance || 500;
    this.position = options.position || vec3.create();
    // What the camera is looking at.
    this.target = options.target || vec3.create();
    // What is considered "up" to this camera.
    this.worldUp = options.worldUp || vec3.fromValues(0, 0, 1);
    // Mouse.
    this.mouse = { buttons: [false, false, false], x: 0, y: 0, x2: 0, y2: 0 };
    // Touches.
    this.touchMode = TOUCH_MODE_ROTATE;
    this.touches = [];

    this.update();

    window.addEventListener('resize', (e) => this.onResize());
    setTimeout(() => this.onResize(), 0);

    // Disable the context menu when right-clicking.
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    this.canvas.addEventListener('selectstart', (e) => e.preventDefault());

    // Track mouse clicks.
    this.canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();

      this.mouse.buttons[e.button] = true;
    });

    // And mouse unclicks.
    // On the whole document rather than the canvas to stop annoying behavior when moving the mouse out of the canvas.
    document.addEventListener('mouseup', (e) => {
      e.preventDefault();

      this.mouse.buttons[e.button] = false;
    });

    // Handle rotating and moving the camera when the mouse moves.
    window.addEventListener('mousemove', (e) => {
      this.mouse.x2 = this.mouse.x;
      this.mouse.y2 = this.mouse.y;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      let dx = this.mouse.x - this.mouse.x2;
      let dy = this.mouse.y - this.mouse.y2;

      if (this.mouse.buttons[0]) {
        this.rotate(dx, dy);
      }

      if (this.mouse.buttons[2]) {
        this.move(-dx * 2, dy * 2);
      }
    });

    // Handle zooming when the mouse scrolls.
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();

      let deltaY = e.deltaY;

      if (e.deltaMode === 1) {
        deltaY = deltaY / 3 * 100;
      }

      this.zoom(deltaY / 100);
    });

    // Listen to touches.
    // Supports 1 or 2 touch points.
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();

      let targetTouches = e.targetTouches;

      if (targetTouches.length === 1) {
        this.touchMode = TOUCH_MODE_ROTATE;
      } else if (targetTouches.length == 2) {
        this.touchMode = TOUCH_MODE_ZOOM;
      } else {
        this.touchMode = TOUCH_MODE_INVALID;
      }

      this.touches.length = 0;
      this.touches.push(...targetTouches);
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();

      this.touchMode = TOUCH_MODE_INVALID;
    });

    this.canvas.addEventListener('touchcancel', (e) => {
      e.preventDefault();

      this.touchMode = TOUCH_MODE_INVALID;
    });

    // Rotate or zoom based on the touch mode.
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();

      let targetTouches = e.targetTouches;

      if (this.touchMode === TOUCH_MODE_ROTATE) {
        let oldTouch = this.touches[0];
        let newTouch = targetTouches[0];
        let dx = newTouch.clientX - oldTouch.clientX;
        let dy = newTouch.clientY - oldTouch.clientY;

        this.rotate(dx, dy);
      } else if (this.touchMode === TOUCH_MODE_ZOOM) {
        let len1 = getTouchesLength(this.touches[0], this.touches[1]);
        let len2 = getTouchesLength(targetTouches[0], targetTouches[1]);

        this.zoom((len1 - len2) / 50);
      }

      this.touches.length = 0;
      this.touches.push(...targetTouches);
    });
  }

  update() {
    // Limit the vertical angle so it doesn't flip.
    // Since the camera uses a quaternion, flips don't matter to it, but this feels better.
    this.verticalAngle = Math.min(Math.max(0.01, this.verticalAngle), Math.PI - 0.01);

    quat.identity(quatHeap);
    quat.rotateZ(quatHeap, quatHeap, this.horizontalAngle);
    quat.rotateX(quatHeap, quatHeap, this.verticalAngle);

    vec3.set(this.position, 0, 0, 1);
    vec3.transformQuat(this.position, this.position, quatHeap);
    vec3.scale(this.position, this.position, this.distance);
    vec3.add(this.position, this.position, this.target);

    this.camera.moveToAndFace(this.position, this.target, this.worldUp);
  }

  // Move the camera and the target on the XY plane.
  move(x, y) {
    let dirX = this.camera.directionX;
    let dirY = this.camera.directionY;

    // Allow only movement on the XY plane, and scale to moveSpeed.
    vec3.add(this.target, this.target, vec3.scale(vecHeap, vec3.normalize(vecHeap, vec3.set(vecHeap, dirX[0], dirX[1], 0)), x * this.moveSpeed));
    vec3.add(this.target, this.target, vec3.scale(vecHeap, vec3.normalize(vecHeap, vec3.set(vecHeap, dirY[0], dirY[1], 0)), y * this.moveSpeed));

    this.update();
  }

  // Rotate the camera around the target.
  rotate(x, y) {
    this.horizontalAngle -= x * this.rotationSpeed;
    this.verticalAngle -= y * this.rotationSpeed;

    this.update();
  }

  // Zoom the camera by changing the distance from the target.
  zoom(factor) {
    this.distance *= 1 + factor * this.zoomFactor;

    this.update();
  }

  // Resize the canvas automatically and update the camera.
  onResize() {
    let width = this.canvas.clientWidth;
    let height = this.canvas.clientHeight;

    this.canvas.width = width;
    this.canvas.height = height;

    this.scene.viewport[2] = width;
    this.scene.viewport[3] = height;

    this.camera.perspective(Math.PI / 4, width / height, 1, 20000);
  }

  moveToAndFace(position, target) {
    vec3.sub(vecHeap, position, target);

    let r = vec3.length(vecHeap);
    let theta = Math.atan2(vecHeap[1], vecHeap[0]);
    let phi = Math.acos(vecHeap[2] / r);

    vec3.copy(this.target, target);

    this.verticalAngle = phi;
    this.horizontalAngle = theta + Math.PI / 2;
    this.distance = r;

    this.update();
  }
}