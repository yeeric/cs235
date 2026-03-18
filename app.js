class RBNode {
  constructor(value, color, left = null, right = null, parent = null) {
    this.value = value;
    this.color = color;
    this.left = left;
    this.right = right;
    this.parent = parent;
  }
}

class RedBlackTree {
  constructor() {
    this.NIL = new RBNode(null, "BLACK");
    this.NIL.left = this.NIL;
    this.NIL.right = this.NIL;
    this.NIL.parent = this.NIL;
    this.root = this.NIL;
    this.steps = [];
  }

  resetSteps() {
    this.steps = [];
  }

  snapshotNode(node) {
    if (node === this.NIL) {
      return null;
    }

    return {
      value: node.value,
      color: node.color,
      left: this.snapshotNode(node.left),
      right: this.snapshotNode(node.right)
    };
  }

  snapshot() {
    return this.snapshotNode(this.root);
  }

  record(message) {
    this.steps.push({
      message,
      snapshot: this.snapshot()
    });
  }

  search(value) {
    let current = this.root;

    while (current !== this.NIL && current.value !== value) {
      current = value < current.value ? current.left : current.right;
    }

    return current;
  }

  minimum(node) {
    let current = node;
    while (current.left !== this.NIL) {
      current = current.left;
    }
    return current;
  }

  leftRotate(x) {
    const y = x.right;
    x.right = y.left;

    if (y.left !== this.NIL) {
      y.left.parent = x;
    }

    y.parent = x.parent;

    if (x.parent === this.NIL) {
      this.root = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }

    y.left = x;
    x.parent = y;

    this.record(`Left rotation at ${x.value}.`);
  }

  rightRotate(y) {
    const x = y.left;
    y.left = x.right;

    if (x.right !== this.NIL) {
      x.right.parent = y;
    }

    x.parent = y.parent;

    if (y.parent === this.NIL) {
      this.root = x;
    } else if (y === y.parent.right) {
      y.parent.right = x;
    } else {
      y.parent.left = x;
    }

    x.right = y;
    y.parent = x;

    this.record(`Right rotation at ${y.value}.`);
  }

  insert(value) {
    this.resetSteps();
    this.record(`Start insert(${value}).`);

    let parent = this.NIL;
    let current = this.root;

    while (current !== this.NIL) {
      parent = current;

      if (value === current.value) {
        this.record(`Value ${value} already exists. No insertion performed.`);
        return this.steps;
      }

      current = value < current.value ? current.left : current.right;
    }

    const node = new RBNode(value, "RED", this.NIL, this.NIL, parent);

    if (parent === this.NIL) {
      this.root = node;
      this.record(`Inserted ${value} as root.`);
    } else if (value < parent.value) {
      parent.left = node;
      this.record(`Inserted ${value} as left child of ${parent.value}.`);
    } else {
      parent.right = node;
      this.record(`Inserted ${value} as right child of ${parent.value}.`);
    }

    this.insertFixup(node);
    this.root.color = "BLACK";
    this.record(`Insertion complete. Root is forced to black.`);

    return this.steps;
  }

  insertFixup(node) {
    let current = node;

    while (current.parent.color === "RED") {
      if (current.parent === current.parent.parent.left) {
        let uncle = current.parent.parent.right;

        if (uncle.color === "RED") {
          current.parent.color = "BLACK";
          uncle.color = "BLACK";
          current.parent.parent.color = "RED";
          this.record("Insert fix-up case 1: recolor parent, uncle, and grandparent.");
          current = current.parent.parent;
        } else {
          if (current === current.parent.right) {
            current = current.parent;
            this.record("Insert fix-up case 2: convert to case 3 with a left rotation.");
            this.leftRotate(current);
          }

          current.parent.color = "BLACK";
          current.parent.parent.color = "RED";
          this.record("Insert fix-up case 3: right rotation at grandparent.");
          this.rightRotate(current.parent.parent);
        }
      } else {
        let uncle = current.parent.parent.left;

        if (uncle.color === "RED") {
          current.parent.color = "BLACK";
          uncle.color = "BLACK";
          current.parent.parent.color = "RED";
          this.record("Insert fix-up case 1 mirror: recolor parent, uncle, and grandparent.");
          current = current.parent.parent;
        } else {
          if (current === current.parent.left) {
            current = current.parent;
            this.record("Insert fix-up case 2 mirror: convert to case 3 with a right rotation.");
            this.rightRotate(current);
          }

          current.parent.color = "BLACK";
          current.parent.parent.color = "RED";
          this.record("Insert fix-up case 3 mirror: left rotation at grandparent.");
          this.leftRotate(current.parent.parent);
        }
      }

      if (current === this.root) {
        break;
      }
    }
  }

  transplant(u, v) {
    if (u.parent === this.NIL) {
      this.root = v;
    } else if (u === u.parent.left) {
      u.parent.left = v;
    } else {
      u.parent.right = v;
    }

    v.parent = u.parent;
  }

  delete(value) {
    this.resetSteps();
    this.record(`Start delete(${value}).`);

    const target = this.search(value);
    if (target === this.NIL) {
      this.record(`Value ${value} not found. No deletion performed.`);
      return this.steps;
    }

    this.record(`Located node ${value}. Preparing removal.`);

    let y = target;
    let yOriginalColor = y.color;
    let x = this.NIL;

    if (target.left === this.NIL) {
      x = target.right;
      this.transplant(target, target.right);
      this.record(`Node ${value} had no left child. Replaced with right subtree.`);
    } else if (target.right === this.NIL) {
      x = target.left;
      this.transplant(target, target.left);
      this.record(`Node ${value} had no right child. Replaced with left subtree.`);
    } else {
      y = this.minimum(target.right);
      yOriginalColor = y.color;
      x = y.right;

      if (y.parent === target) {
        x.parent = y;
      } else {
        this.transplant(y, y.right);
        y.right = target.right;
        y.right.parent = y;
        this.record(`Detached successor ${y.value} from its original position.`);
      }

      this.transplant(target, y);
      y.left = target.left;
      y.left.parent = y;
      y.color = target.color;
      this.record(`Replaced ${value} with successor ${y.value}.`);
    }

    if (yOriginalColor === "BLACK") {
      this.record("Deleted a black node. Starting delete fix-up.");
      this.deleteFixup(x);
    }

    if (this.root !== this.NIL) {
      this.root.color = "BLACK";
    }

    this.record("Deletion complete. Root is forced to black.");
    return this.steps;
  }

  deleteFixup(node) {
    let x = node;

    while (x !== this.root && x.color === "BLACK") {
      if (x === x.parent.left) {
        let sibling = x.parent.right;

        if (sibling.color === "RED") {
          sibling.color = "BLACK";
          x.parent.color = "RED";
          this.record("Delete fix-up case 1: sibling is red.");
          this.leftRotate(x.parent);
          sibling = x.parent.right;
        }

        if (sibling.left.color === "BLACK" && sibling.right.color === "BLACK") {
          if (sibling !== this.NIL) {
            sibling.color = "RED";
          }
          this.record("Delete fix-up case 2: sibling and children are black.");
          x = x.parent;
        } else {
          if (sibling.right.color === "BLACK") {
            sibling.left.color = "BLACK";
            sibling.color = "RED";
            this.record("Delete fix-up case 3: sibling far child black, near child red.");
            this.rightRotate(sibling);
            sibling = x.parent.right;
          }

          sibling.color = x.parent.color;
          x.parent.color = "BLACK";
          sibling.right.color = "BLACK";
          this.record("Delete fix-up case 4: final rotation and recolor.");
          this.leftRotate(x.parent);
          x = this.root;
        }
      } else {
        let sibling = x.parent.left;

        if (sibling.color === "RED") {
          sibling.color = "BLACK";
          x.parent.color = "RED";
          this.record("Delete fix-up case 1 mirror: sibling is red.");
          this.rightRotate(x.parent);
          sibling = x.parent.left;
        }

        if (sibling.left.color === "BLACK" && sibling.right.color === "BLACK") {
          if (sibling !== this.NIL) {
            sibling.color = "RED";
          }
          this.record("Delete fix-up case 2 mirror: sibling and children are black.");
          x = x.parent;
        } else {
          if (sibling.left.color === "BLACK") {
            sibling.right.color = "BLACK";
            sibling.color = "RED";
            this.record("Delete fix-up case 3 mirror: sibling far child black, near child red.");
            this.leftRotate(sibling);
            sibling = x.parent.left;
          }

          sibling.color = x.parent.color;
          x.parent.color = "BLACK";
          sibling.left.color = "BLACK";
          this.record("Delete fix-up case 4 mirror: final rotation and recolor.");
          this.rightRotate(x.parent);
          x = this.root;
        }
      }
    }

    x.color = "BLACK";
    this.record("Delete fix-up complete.");
  }

  clear() {
    this.root = this.NIL;
    this.NIL.color = "BLACK";
    this.resetSteps();
    this.record("Tree cleared.");
    return this.steps;
  }
}

const tree = new RedBlackTree();

const svg = document.getElementById("treeSvg");
const valueInput = document.getElementById("valueInput");
const statusLine = document.getElementById("statusLine");
const stepCounter = document.getElementById("stepCounter");
const stepLog = document.getElementById("stepLog");
const pythonCode = document.getElementById("pythonCode");
const codeHint = document.getElementById("codeHint");

const insertBtn = document.getElementById("insertBtn");
const deleteBtn = document.getElementById("deleteBtn");
const demoBtn = document.getElementById("demoBtn");
const clearBtn = document.getElementById("clearBtn");
const prevBtn = document.getElementById("prevBtn");
const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");

let timeline = [{ message: "Ready. Tree is empty.", snapshot: null }];
let currentStep = 0;
let playbackTimer = null;
let isPlaying = false;

const PYTHON_LOGIC_SOURCE = [
  'RED, BLACK = "RED", "BLACK"',
  "",
  "class RedBlackTree:",
  "    def left_rotate(self, x):",
  "        y = x.right",
  "        x.right = y.left",
  "        if y.left != self.NIL:",
  "            y.left.parent = x",
  "        y.parent = x.parent",
  "        # parent rewiring omitted for brevity",
  "        y.left = x",
  "        x.parent = y",
  "    # end left_rotate",
  "",
  "    def right_rotate(self, y):",
  "        x = y.left",
  "        y.left = x.right",
  "        # parent rewiring omitted for brevity",
  "        x.right = y",
  "        y.parent = x",
  "    # end right_rotate",
  "",
  "    def insert(self, key):",
  "        z = Node(key, RED, self.NIL, self.NIL)",
  "        y, x = self.NIL, self.root",
  "        while x != self.NIL:",
  "            y = x",
  "            x = x.left if key < x.key else x.right",
  "        z.parent = y",
  "        if y == self.NIL:",
  "            self.root = z",
  "        elif key < y.key:",
  "            y.left = z",
  "        else:",
  "            y.right = z",
  "        self.insert_fixup(z)",
  "        self.root.color = BLACK",
  "    # end insert",
  "",
  "    def insert_fixup(self, z):",
  "        while z.parent.color == RED:",
  "            if z.parent == z.parent.parent.left:",
  "                y = z.parent.parent.right",
  "                if y.color == RED:  # insert case 1",
  "                    z.parent.color = BLACK",
  "                    y.color = BLACK",
  "                    z.parent.parent.color = RED",
  "                    z = z.parent.parent",
  "                else:",
  "                    if z == z.parent.right:  # insert case 2",
  "                        z = z.parent",
  "                        self.left_rotate(z)",
  "                    z.parent.color = BLACK    # insert case 3",
  "                    z.parent.parent.color = RED",
  "                    self.right_rotate(z.parent.parent)",
  "            else:",
  "                # mirror of insert cases 1-3",
  "                ...",
  "    # end insert_fixup",
  "",
  "    def delete(self, key):",
  "        z = self.search(key)",
  "        y = z",
  "        y_original_color = y.color",
  "        if z.left == self.NIL:",
  "            x = z.right",
  "            self.transplant(z, z.right)",
  "        elif z.right == self.NIL:",
  "            x = z.left",
  "            self.transplant(z, z.left)",
  "        else:",
  "            y = self.minimum(z.right)",
  "            y_original_color = y.color",
  "            x = y.right",
  "            if y.parent != z:",
  "                self.transplant(y, y.right)",
  "                y.right = z.right",
  "                y.right.parent = y",
  "            self.transplant(z, y)",
  "            y.left = z.left",
  "            y.left.parent = y",
  "            y.color = z.color",
  "        if y_original_color == BLACK:",
  "            self.delete_fixup(x)",
  "        self.root.color = BLACK",
  "    # end delete",
  "",
  "    def delete_fixup(self, x):",
  "        while x != self.root and x.color == BLACK:",
  "            if x == x.parent.left:",
  "                w = x.parent.right",
  "                if w.color == RED:  # delete case 1",
  "                    ...",
  "                if w.left.color == BLACK and w.right.color == BLACK:  # delete case 2",
  "                    ...",
  "                else:",
  "                    if w.right.color == BLACK:  # delete case 3",
  "                        ...",
  "                    # delete case 4",
  "                    ...",
  "            else:",
  "                # mirror of delete cases 1-4",
  "                ...",
  "        x.color = BLACK",
  "    # end delete_fixup"
].join("\\n");

const PYTHON_LOGIC_LINES = PYTHON_LOGIC_SOURCE.split("\\n");

function findLineContaining(text, startAt = 1) {
  for (let i = Math.max(startAt, 1) - 1; i < PYTHON_LOGIC_LINES.length; i += 1) {
    if (PYTHON_LOGIC_LINES[i].includes(text)) {
      return i + 1;
    }
  }

  return -1;
}

function buildCodeAnchors() {
  const leftRotateStart = findLineContaining("def left_rotate(self, x):");
  const rightRotateStart = findLineContaining("def right_rotate(self, y):");
  const insertStart = findLineContaining("def insert(self, key):");
  const insertFixupStart = findLineContaining("def insert_fixup(self, z):");
  const deleteStart = findLineContaining("def delete(self, key):");
  const deleteFixupStart = findLineContaining("def delete_fixup(self, x):");

  return {
    leftRotateStart,
    leftRotateEnd: findLineContaining("# end left_rotate"),
    rightRotateStart,
    rightRotateEnd: findLineContaining("# end right_rotate"),
    insertStart,
    insertEnd: findLineContaining("# end insert"),
    insertPlacementStart: findLineContaining("if y == self.NIL:", insertStart),
    insertPlacementEnd: findLineContaining("y.right = z", insertStart),
    insertRootForceLine: findLineContaining("self.root.color = BLACK", insertStart),
    insertFixupStart,
    insertFixupEnd: findLineContaining("# end insert_fixup"),
    insertCase1Start: findLineContaining("if y.color == RED:  # insert case 1", insertFixupStart),
    insertCase1End: findLineContaining("z = z.parent.parent", insertFixupStart),
    insertCase2Start: findLineContaining("if z == z.parent.right:  # insert case 2", insertFixupStart),
    insertCase2End: findLineContaining("self.left_rotate(z)", insertFixupStart),
    insertCase3Start: findLineContaining("z.parent.color = BLACK    # insert case 3", insertFixupStart),
    insertCase3End: findLineContaining("self.right_rotate(z.parent.parent)", insertFixupStart),
    insertMirrorLine: findLineContaining("# mirror of insert cases 1-3", insertFixupStart),
    deleteStart,
    deleteEnd: findLineContaining("# end delete"),
    deleteNoLeftStart: findLineContaining("if z.left == self.NIL:", deleteStart),
    deleteNoLeftEnd: findLineContaining("self.transplant(z, z.right)", deleteStart),
    deleteNoRightStart: findLineContaining("elif z.right == self.NIL:", deleteStart),
    deleteNoRightEnd: findLineContaining("self.transplant(z, z.left)", deleteStart),
    deleteSuccessorDetachStart: findLineContaining("if y.parent != z:", deleteStart),
    deleteSuccessorDetachEnd: findLineContaining("y.right.parent = y", deleteStart),
    deleteReplaceStart: findLineContaining("self.transplant(z, y)", deleteStart),
    deleteReplaceEnd: findLineContaining("y.color = z.color", deleteStart),
    deleteNeedsFixLine: findLineContaining("if y_original_color == BLACK:", deleteStart),
    deleteRootForceLine: findLineContaining("self.root.color = BLACK", deleteStart),
    deleteFixupStart,
    deleteFixupEnd: findLineContaining("# end delete_fixup"),
    deleteCase1Line: findLineContaining("if w.color == RED:  # delete case 1", deleteFixupStart),
    deleteCase2Line: findLineContaining(
      "if w.left.color == BLACK and w.right.color == BLACK:  # delete case 2",
      deleteFixupStart
    ),
    deleteCase3Line: findLineContaining("if w.right.color == BLACK:  # delete case 3", deleteFixupStart),
    deleteCase4Line: findLineContaining("# delete case 4", deleteFixupStart),
    deleteMirrorLine: findLineContaining("# mirror of delete cases 1-4", deleteFixupStart),
    deleteFixupDoneLine: findLineContaining("x.color = BLACK", deleteFixupStart)
  };
}

const CODE_ANCHORS = buildCodeAnchors();

function addRange(target, start, end) {
  if (start < 1 || end < 1) {
    return;
  }

  const low = Math.min(start, end);
  const high = Math.max(start, end);

  for (let line = low; line <= high; line += 1) {
    target.add(line);
  }
}

function addLine(target, line) {
  if (line > 0) {
    target.add(line);
  }
}

function getCodeFocus(stepMessage) {
  const message = stepMessage.toLowerCase();
  const lines = new Set();
  const a = CODE_ANCHORS;
  let hint = "Highlighted lines match the algorithm logic for this step.";

  if (message.includes("left rotation")) {
    addRange(lines, a.leftRotateStart, a.leftRotateEnd);
    hint = "Tree shape changed with a left rotation in the Python logic.";
  }

  if (message.includes("right rotation")) {
    addRange(lines, a.rightRotateStart, a.rightRotateEnd);
    hint = "Tree shape changed with a right rotation in the Python logic.";
  }

  if (message.includes("--- insert") || message.includes("start insert")) {
    addRange(lines, a.insertStart, a.insertEnd);
    hint = "This step is inside insert(): place the node, then call insert_fixup().";
  } else if (message.includes("already exists")) {
    addRange(lines, a.insertStart, a.insertPlacementEnd);
    hint = "Insert search path reached an existing key, so insertion stops.";
  } else if (message.includes("inserted")) {
    addRange(lines, a.insertPlacementStart, a.insertPlacementEnd);
    hint = "Node placement follows standard BST insertion before balancing.";
  } else if (message.includes("insert fix-up case 1 mirror")) {
    addRange(lines, a.insertCase1Start, a.insertCase1End);
    addLine(lines, a.insertMirrorLine);
    hint = "Insert fix-up case 1 mirror: recoloring moves the violation upward.";
  } else if (message.includes("insert fix-up case 2 mirror")) {
    addRange(lines, a.insertCase2Start, a.insertCase2End);
    addLine(lines, a.insertMirrorLine);
    hint = "Insert fix-up case 2 mirror: first rotation converts to case 3.";
  } else if (message.includes("insert fix-up case 3 mirror")) {
    addRange(lines, a.insertCase3Start, a.insertCase3End);
    addLine(lines, a.insertMirrorLine);
    hint = "Insert fix-up case 3 mirror: rotate at grandparent and recolor.";
  } else if (message.includes("insert fix-up case 1")) {
    addRange(lines, a.insertCase1Start, a.insertCase1End);
    hint = "Insert fix-up case 1: parent and uncle are red, so recolor.";
  } else if (message.includes("insert fix-up case 2")) {
    addRange(lines, a.insertCase2Start, a.insertCase2End);
    hint = "Insert fix-up case 2: rotate at parent to align for case 3.";
  } else if (message.includes("insert fix-up case 3")) {
    addRange(lines, a.insertCase3Start, a.insertCase3End);
    hint = "Insert fix-up case 3: recolor and rotate at grandparent.";
  } else if (message.includes("insertion complete")) {
    addLine(lines, a.insertRootForceLine);
    hint = "Insert finalization forces the root to BLACK.";
  }

  if (message.includes("--- delete") || message.includes("start delete")) {
    addRange(lines, a.deleteStart, a.deleteEnd);
    hint = "This step is inside delete(): remove/replace the node, then maybe fix colors.";
  } else if (message.includes("value") && message.includes("not found")) {
    addRange(lines, a.deleteStart, a.deleteStart + 3);
    hint = "Delete first searches for the key; if missing, no structural change is made.";
  } else if (message.includes("located node")) {
    addRange(lines, a.deleteStart, a.deleteStart + 4);
    hint = "Delete found the target and is now selecting the proper removal case.";
  } else if (message.includes("no left child")) {
    addRange(lines, a.deleteNoLeftStart, a.deleteNoLeftEnd);
    hint = "Delete case: target has no left child, so transplant right subtree.";
  } else if (message.includes("no right child")) {
    addRange(lines, a.deleteNoRightStart, a.deleteNoRightEnd);
    hint = "Delete case: target has no right child, so transplant left subtree.";
  } else if (message.includes("detached successor")) {
    addRange(lines, a.deleteSuccessorDetachStart, a.deleteSuccessorDetachEnd);
    hint = "Successor was detached from its old location before replacement.";
  } else if (message.includes("replaced") && message.includes("successor")) {
    addRange(lines, a.deleteReplaceStart, a.deleteReplaceEnd);
    hint = "Target with two children is replaced by its successor.";
  } else if (message.includes("deleted a black node")) {
    addLine(lines, a.deleteNeedsFixLine);
    addRange(lines, a.deleteFixupStart, a.deleteFixupEnd);
    hint = "Deleting a black node can break black-height, so delete_fixup() runs.";
  } else if (message.includes("delete fix-up case 1 mirror")) {
    addLine(lines, a.deleteCase1Line);
    addLine(lines, a.deleteMirrorLine);
    hint = "Delete fix-up case 1 mirror: red sibling case resolved by rotation/recolor.";
  } else if (message.includes("delete fix-up case 2 mirror")) {
    addLine(lines, a.deleteCase2Line);
    addLine(lines, a.deleteMirrorLine);
    hint = "Delete fix-up case 2 mirror: black sibling with black children pushes issue up.";
  } else if (message.includes("delete fix-up case 3 mirror")) {
    addLine(lines, a.deleteCase3Line);
    addLine(lines, a.deleteMirrorLine);
    hint = "Delete fix-up case 3 mirror: prepare sibling for final case 4.";
  } else if (message.includes("delete fix-up case 4 mirror")) {
    addLine(lines, a.deleteCase4Line);
    addLine(lines, a.deleteMirrorLine);
    hint = "Delete fix-up case 4 mirror: final rotation/recolor restores RB properties.";
  } else if (message.includes("delete fix-up case 1")) {
    addLine(lines, a.deleteCase1Line);
    hint = "Delete fix-up case 1: sibling red, rotate to convert to a black-sibling case.";
  } else if (message.includes("delete fix-up case 2")) {
    addLine(lines, a.deleteCase2Line);
    hint = "Delete fix-up case 2: sibling and children black, move double-black upward.";
  } else if (message.includes("delete fix-up case 3")) {
    addLine(lines, a.deleteCase3Line);
    hint = "Delete fix-up case 3: rotate at sibling to prepare case 4.";
  } else if (message.includes("delete fix-up case 4")) {
    addLine(lines, a.deleteCase4Line);
    hint = "Delete fix-up case 4: final rotation and recolor complete repair.";
  } else if (message.includes("delete fix-up complete")) {
    addLine(lines, a.deleteFixupDoneLine);
    hint = "Delete fix-up ends by forcing the current node to BLACK.";
  } else if (message.includes("deletion complete")) {
    addLine(lines, a.deleteRootForceLine);
    hint = "Delete finalization forces the root to BLACK.";
  }

  if (message.includes("tree cleared")) {
    lines.clear();
    hint = "Tree reset: no active algorithm step.";
  }

  return { lines, hint };
}

function renderPythonForMessage(stepMessage) {
  const focus = getCodeFocus(stepMessage);
  codeHint.textContent = focus.hint;
  pythonCode.innerHTML = "";

  PYTHON_LOGIC_LINES.forEach((line, index) => {
    const lineNumber = index + 1;
    const wrapper = document.createElement("span");
    wrapper.className = "python-line";

    if (focus.lines.has(lineNumber)) {
      wrapper.classList.add("active");
    }

    const lineNo = document.createElement("span");
    lineNo.className = "line-no";
    lineNo.textContent = String(lineNumber).padStart(2, "0");

    const codeText = document.createElement("span");
    codeText.textContent = line.length === 0 ? " " : line;

    wrapper.appendChild(lineNo);
    wrapper.appendChild(codeText);
    pythonCode.appendChild(wrapper);
  });

  const firstActive = pythonCode.querySelector(".python-line.active");
  if (firstActive) {
    firstActive.scrollIntoView({ block: "center" });
  }
}

function setTimeline(steps) {
  timeline = steps.length > 0 ? steps : [{ message: "No steps available.", snapshot: tree.snapshot() }];
  currentStep = 0;
  renderAll();
}

function parseInputValue() {
  const raw = valueInput.value.trim();
  if (raw.length === 0) {
    statusLine.textContent = "Please enter a value first.";
    return null;
  }

  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) {
    statusLine.textContent = "Please enter a valid integer.";
    return null;
  }

  return value;
}

function renderAll() {
  const step = timeline[currentStep];
  statusLine.textContent = step.message;
  stepCounter.textContent = `Step ${currentStep + 1} / ${timeline.length}`;
  renderTree(step.snapshot);
  renderLog();
  renderPythonForMessage(step.message);
  updateButtons();
}

function drawEmptyState() {
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", "600");
  text.setAttribute("y", "300");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("fill", "#6f8799");
  text.setAttribute("font-size", "24");
  text.textContent = "Tree is empty";
  svg.appendChild(text);
}

function traverseInOrder(node, depth, collector) {
  if (!node) {
    return;
  }

  traverseInOrder(node.left, depth + 1, collector);
  collector.push(node);
  node.depth = depth;
  traverseInOrder(node.right, depth + 1, collector);
}

function getMaxDepth(node) {
  if (!node) {
    return 0;
  }

  return 1 + Math.max(getMaxDepth(node.left), getMaxDepth(node.right));
}

function renderTree(snapshotRoot) {
  svg.innerHTML = "";

  if (!snapshotRoot) {
    svg.setAttribute("viewBox", "0 0 1200 600");
    drawEmptyState();
    return;
  }

  const nodes = [];
  traverseInOrder(snapshotRoot, 0, nodes);

  const maxDepth = getMaxDepth(snapshotRoot);
  const width = 1200;
  const height = Math.max(600, 130 * maxDepth + 80);
  const xGap = width / (nodes.length + 1);
  const yGap = Math.max(85, Math.floor((height - 120) / Math.max(maxDepth, 1)));

  nodes.forEach((node, i) => {
    node.x = (i + 1) * xGap;
    node.y = 65 + node.depth * yGap;
  });

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const drawEdges = (node) => {
    if (!node) {
      return;
    }

    if (node.left) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", node.x);
      line.setAttribute("y1", node.y);
      line.setAttribute("x2", node.left.x);
      line.setAttribute("y2", node.left.y);
      line.setAttribute("class", "edge");
      svg.appendChild(line);
      drawEdges(node.left);
    }

    if (node.right) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", node.x);
      line.setAttribute("y1", node.y);
      line.setAttribute("x2", node.right.x);
      line.setAttribute("y2", node.right.y);
      line.setAttribute("class", "edge");
      svg.appendChild(line);
      drawEdges(node.right);
    }
  };

  drawEdges(snapshotRoot);

  nodes.forEach((node) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", node.x);
    circle.setAttribute("cy", node.y);
    circle.setAttribute("r", "24");
    circle.setAttribute("fill", node.color === "RED" ? "#c43f4b" : "#1d2935");

    if (node === snapshotRoot) {
      circle.setAttribute("stroke", "#f5c54f");
      circle.setAttribute("stroke-width", "4");
    }

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", node.x);
    label.setAttribute("y", node.y + 1);
    label.setAttribute("class", "node-label");
    label.textContent = String(node.value);

    svg.appendChild(circle);
    svg.appendChild(label);
  });

  const legend = document.createElementNS("http://www.w3.org/2000/svg", "text");
  legend.setAttribute("x", "20");
  legend.setAttribute("y", String(height - 20));
  legend.setAttribute("fill", "#5b7282");
  legend.setAttribute("font-size", "16");
  legend.textContent = "Legend: gold border = root, red node = RED, dark node = BLACK";
  svg.appendChild(legend);
}

function renderLog() {
  stepLog.innerHTML = "";

  timeline.forEach((step, index) => {
    const li = document.createElement("li");
    li.textContent = step.message;

    if (index === currentStep) {
      li.classList.add("active");
    }

    li.addEventListener("click", () => {
      stopPlayback();
      currentStep = index;
      renderAll();
    });

    stepLog.appendChild(li);
  });
}

function stopPlayback() {
  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }

  isPlaying = false;
  updateButtons();
}

function startPlayback() {
  if (timeline.length < 2) {
    return;
  }

  if (currentStep >= timeline.length - 1) {
    currentStep = 0;
    renderAll();
  }

  isPlaying = true;
  updateButtons();

  playbackTimer = setInterval(() => {
    if (currentStep >= timeline.length - 1) {
      stopPlayback();
      return;
    }

    currentStep += 1;
    renderAll();
  }, 950);
}

function updateButtons() {
  prevBtn.disabled = currentStep === 0;
  nextBtn.disabled = currentStep >= timeline.length - 1;
  playBtn.disabled = timeline.length < 2;
  playBtn.textContent = isPlaying ? "Pause" : "Play";

  const editingDisabled = isPlaying;
  insertBtn.disabled = editingDisabled;
  deleteBtn.disabled = editingDisabled;
  demoBtn.disabled = editingDisabled;
  clearBtn.disabled = editingDisabled;
}

insertBtn.addEventListener("click", () => {
  const value = parseInputValue();
  if (value === null) {
    return;
  }

  stopPlayback();
  setTimeline(tree.insert(value));
});

deleteBtn.addEventListener("click", () => {
  const value = parseInputValue();
  if (value === null) {
    return;
  }

  stopPlayback();
  setTimeline(tree.delete(value));
});

clearBtn.addEventListener("click", () => {
  stopPlayback();
  setTimeline(tree.clear());
});

demoBtn.addEventListener("click", () => {
  stopPlayback();
  tree.clear();

  const operations = [
    ["insert", 41],
    ["insert", 38],
    ["insert", 31],
    ["insert", 12],
    ["insert", 19],
    ["insert", 8],
    ["delete", 8],
    ["delete", 12],
    ["delete", 19]
  ];

  const allSteps = [{ message: "Demo sequence started on empty tree.", snapshot: tree.snapshot() }];

  operations.forEach(([action, value]) => {
    allSteps.push({
      message: `--- ${action.toUpperCase()} ${value} ---`,
      snapshot: tree.snapshot()
    });

    const result = action === "insert" ? tree.insert(value) : tree.delete(value);
    allSteps.push(...result);
  });

  setTimeline(allSteps);
});

prevBtn.addEventListener("click", () => {
  stopPlayback();
  if (currentStep > 0) {
    currentStep -= 1;
    renderAll();
  }
});

nextBtn.addEventListener("click", () => {
  stopPlayback();
  if (currentStep < timeline.length - 1) {
    currentStep += 1;
    renderAll();
  }
});

playBtn.addEventListener("click", () => {
  if (isPlaying) {
    stopPlayback();
  } else {
    startPlayback();
  }
});

valueInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    insertBtn.click();
  }
});

renderAll();
