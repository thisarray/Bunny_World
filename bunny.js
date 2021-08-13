/*
 * JavaScript Bunny World code.
 */

/*
 * String name of the special page where the game starts out when first run.
 */
const START = 'page1';

/*
 * String name of the inventory / possessions area.
 */
const INVENTORY = 'inventory';

/*
 * Integer y offset in pixels to the top of the inventory.
 */
const INVENTORY_TOP = 320;

/*
 * String separator between shape script clauses.
 */
const CLAUSE_SEPARATOR = ';';

class Shape extends Rect {
  /*
   * Map of string name to the given Shape object.
   */
  static MAP = new Map();

  /*
   * Return an Array of string trigger clauses parsed from script.
   */
  static parseScript(script) {
    if (typeof script !== 'string') {
      throw new TypeError('script must be a non-empty string.');
    }
    if (script.length <= 0) {
      return [];
    }
    return script.split(CLAUSE_SEPARATOR).map(c => c.trim()).filter(c => (c.startsWith('on click ') || c.startsWith('on enter ') || c.startsWith('on drop ')));
  }

  /*
   * Execute the action portion of shape script.
   */
  static runAction(action) {
    if (typeof action !== 'string') {
      throw new TypeError('action must be a non-empty string.');
    }

    let tokens = action.split(' ').map(t => t.trim()),
        raw, verb, name;
    while (tokens.length > 0) {
      raw = tokens.shift();
      verb = raw.toLowerCase();
      if (verb === 'goto') {
        goto(tokens.shift());
      }
      else if (verb === 'play') {
        /*
         * Play the sound of the given name.
         */
        name = tokens.shift();
        if (name in sounds) {
          sounds[name].play();
        }
      }
      else if (verb === 'hide') {
        /*
         * Make the given shape invisible and un-clickable.
         * The shape may or may not be on the currently displayed page.
         */
        name = tokens.shift().trim().toLowerCase();
        if (Shape.MAP.has(name)) {
          Shape.MAP.get(name).hidden = true;
        }
      }
      else if (verb === 'show') {
        /*
         * Make the given shape visible and active.
         * The shape may or may not be on the currently displayed page.
         */
        name = tokens.shift().trim().toLowerCase();
        if (Shape.MAP.has(name)) {
          Shape.MAP.get(name).hidden = false;
        }
      }
      else if (verb === 'beep') {
        /*
         * Play the system beep. Handy for debugging.
         */
        tone.play('A4', 0.5);
      }
      else {
        throw new RangeError(`Unrecognized script action verb "${ raw }".`);
      }
    }
  }

  constructor(name, x, y, width, height) {
    if (typeof name !== 'string') {
      throw new TypeError('name must be a non-empty string.');
    }
    super(x, y, width, height);

    /*
     * String name of this Shape instance. It is not case-sensitive.
     */
    this.name = name.trim().toLowerCase();
    if (this.name.length <= 0) {
      throw new RangeError('name must be a non-empty string.');
    }
    if (Shape.MAP.has(this.name)) {
      throw new RangeError(`Shape "${ name }" already exists.`);
    }

    /*
     * String text this can draw.
     */
    this.text = '';

    /*
     * String name of the image without the extension this can draw.
     */
    this.image = '';

    /*
     * Boolean flag indicating if this Shape instance is hidden.
     */
    this.hidden = false;

    /*
     * Boolean flag indicating if this Shape instance is movable.
     */
    this.movable = false;

    /*
     * String page to which this Shape instance belongs.
     */
    this.location = '';

    /*
     * Array of string trigger clauses in the shape script.
     */
    this.clauses = [];

    Shape.MAP.set(this.name, this);
  }

  draw() {
    if (this.hidden) {
      return;
    }
    if (this.text.length > 0) {
      // If the text is not the empty string, the shape draws the given text
      screen.draw.textbox(this.text, this, {
        fontsize: Math.min(this.width, this.height),
        color: 'black'
      });
    }
    else if ((this.image.length > 0) && (this.image in images)) {
      // If the image name is not the empty string and it is a valid image,
      // the shape draws the given image, scaled to fit the shape rectangle.
      screen.blit(this.image, this);
    }
    else {
      screen.draw.filled_rect(this, 'gray');
    }
  }

  get inInventory() {
    return (this.location === INVENTORY);
  }

  _fire(trigger, runOnce = false) {
    for (let clause of this.clauses) {
      if (clause.startsWith(trigger)) {
        Shape.runAction(clause.substring(trigger.length).trim());
        if (runOnce) {
          return;
        }
      }
    }
  }

  /*
   * Execute actions when the shape is clicked.
   *
   * The shape must not be hidden and must not be in inventory.
   * Executes the actions from left to right.
   * If there are multiple on-click clauses, the first one found will execute and the others are ignored.
   */
  fireClick() {
    if (this.hidden) {
      return;
    }
    if (this.inInventory) {
      return;
    }
    this._fire('on click ', true);
  }

  /*
   * Execute actions if the page this shape is current in has just been "switched to" in game.
   */
  fireEnter() {
    this._fire('on enter ');
  }

  hasDrop(name) {
    if (typeof name !== 'string') {
      throw new TypeError('name must be a non-empty string.');
    }
    name = name.trim().toLowerCase();
    if (Shape.MAP.has(name)) {
      return this.clauses.some(c => c.startsWith('on drop ' + name));
    }
    return false;
  }

  /*
   * Execute actions when the shape of the given name is dropped onto this shape.
   */
  fireDrop(name) {
    if (typeof name !== 'string') {
      throw new TypeError('name must be a non-empty string.');
    }
    name = name.trim().toLowerCase();
    if (Shape.MAP.has(name)) {
      this._fire('on drop ' + name);
    }
  }
}

function loadWorld(document) {
  if (typeof document !== 'object') {
    throw new TypeError('document must be an object.');
  }

  Shape.MAP = new Map();

  let world = new Map(),
      pageName, shapes;
  for (const page of Object.getOwnPropertyNames(document)) {
    pageName = page.trim().toLowerCase();
    shapes = [];

    if (pageName.length <= 0) {
      continue;
    }

    for (const name of Object.getOwnPropertyNames(document[page])) {
      if (name.length <= 0) {
        continue;
      }

      shape = new Shape(name, document[page][name]['x'], document[page][name]['y'], document[page][name]['width'], document[page][name]['height']);
      shape.location = pageName;

      if (('text' in document[page][name]) && (typeof document[page][name]['text'] === 'string')) {
        shape.text = document[page][name]['text'];
      }

      if (('image' in document[page][name]) && (typeof document[page][name]['image'] === 'string')) {
        shape.image = document[page][name]['image'];
      }

      if ('hidden' in document[page][name]) {
        shape.hidden = true;
      }

      if ('movable' in document[page][name]) {
        shape.movable = true;
      }

      if (('script' in document[page][name]) && (typeof document[page][name]['script'] === 'string')) {
        shape.clauses = Shape.parseScript(document[page][name]['script']);
      }

      shapes.push(shape);
    }
    world.set(pageName, shapes);
  }

  if (!world.has(INVENTORY)) {
    world.set(INVENTORY, []);
  }

  console.assert(world.has(START), `Missing "${ START }"!`);

  return world;
}

/*
 * Switch to show the page of the given name.
 */
function goto(name) {
  if (typeof name !== 'string') {
    throw new TypeError('name must be a non-empty string.');
  }
  name = name.trim().toLowerCase();
  if (world.has(name)) {
    currentPage = name;
    for (let shape of world.get(currentPage)) {
      // If a page contains multiple shapes with "on enter" triggers, they should all execute,
      // but their order of execution is arbitrary.
      shape.fireEnter();
    }
  }
}

function removeShapeFromPage(shape, page) {
  let shapes = world.get(page);
  for (let i = shapes.length - 1; i > -1; i--) {
    if (shapes[i].name === shape.name) {
      shapes.splice(i, 1);
    }
  }
}

var world, currentPage, dragged, xOffset, yOffset;

function reset() {
  world = loadWorld(JSON.parse(document.querySelector('#world').textContent));
  currentPage = START;
  dragged = null;

  goto(currentPage);
}

function draw() {
  screen.fill('white');

  // Draw the line separating the page area from the inventory
  screen.draw.line([0, INVENTORY_TOP], [WIDTH, INVENTORY_TOP], 'black', 2);

  for (let shape of world.get(currentPage)) {
    shape.draw();
    if (dragged instanceof Shape) {
      if (shape.colliderect(dragged)) {
        if (shape.hasDrop(dragged.name)) {
          // Receiving shapes should give visual feedback with a green border
          // during drag-and-drop mouse tracking to indicate that they have
          // an "on drop" clause for the dropped object
          screen.draw.rect(shape, 'green', 2);
        }
      }
    }
  }
  for (let shape of world.get(INVENTORY)) {
    shape.draw();
  }
}

function on_mouse_down(pos, button) {
  let shapes = world.get(currentPage).concat(world.get(INVENTORY)).filter(s => ((!s.hidden) && s.movable));
  for (let shape of shapes) {
    if (shape.collidepoint(pos)) {
      dragged = shape;
      xOffset = pos[0] - shape.x;
      yOffset = pos[1] - shape.y;
      return;
    }
  }
}

function on_mouse_move(pos, rel, buttons) {
  if (dragged instanceof Shape) {
    dragged.x = pos[0] - xOffset;
    dragged.y = pos[1] - yOffset;
  }
}

function on_mouse_up(pos, button) {
  if (dragged instanceof Shape) {
    dragged.x = pos[0] - xOffset;
    dragged.y = pos[1] - yOffset;

    if (pos[1] > INVENTORY_TOP) {
      // Dragged a shape into the inventory
      removeShapeFromPage(dragged, currentPage);
      dragged.location = INVENTORY;
      world.get(INVENTORY).push(dragged);
    }
    else {
      if (dragged.inInventory) {
        removeShapeFromPage(dragged, INVENTORY);
      }

      for (let shape of world.get(currentPage)) {
        if (shape.colliderect(dragged)) {
          if (shape.hasDrop(dragged.name)) {
            shape.fireDrop(dragged.name);
          }
        }
      }
      dragged.location = currentPage;
      world.get(currentPage).push(dragged);
    }

    dragged = null;
  }
  else {
    // Clicked on a shape not in inventory
    if (pos[1] < INVENTORY_TOP) {
      for (let shape of world.get(currentPage)) {
        if (shape.collidepoint(pos)) {
          shape.fireClick();
        }
      }
    }
  }
}
