"use strict";
function showCordinary(e) {
    document.getElementById('cx').innerHTML = '' + e.offsetX;
    document.getElementById('cy').innerHTML = '' + e.offsetY;
}
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = "red";
class DLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
    }
    createNode(item) {
        return {
            item,
            prev: null,
            next: null
        };
    }
    push(node) {
        if (!node) {
            return;
        }
        if (!this.tail) {
            this.head = node;
            this.tail = node;
            return;
        }
        this.tail.next = node;
        node.prev = this.tail;
        this.tail = node;
    }
    pop() {
        if (!this.tail) {
            return null;
        }
        let node = this.tail;
        if (!this.tail.prev) {
            this.head = this.tail = null;
        }
        else {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }
        return node;
    }
    shift() {
        if (!this.head) {
            return null;
        }
        let node = this.head;
        if (!this.head.next) {
            this.head = this.tail = null;
        }
        else {
            this.head = this.head.next;
            this.head.prev = null;
        }
        return node;
    }
    unshift(node) {
        if (!node) {
            return;
        }
        if (!this.head) {
            this.head = node;
            this.tail = node;
            return;
        }
        this.head.prev = node;
        node.next = this.head;
        this.head = node;
    }
    deleteNode(node) {
        if (!node) {
            return;
        }
        if (!node.prev) {
            this.shift();
        }
        else {
            node.prev.next = node.next;
            if (node.next) {
                node.next.prev = node.prev;
            }
        }
    }
    unionBefore(list, node) {
        if (!node || !list.tail) {
            return;
        }
        if (!node.prev) {
            this.head = list.head;
            list.tail.next = node;
        }
        else {
            node.prev.next = list.head;
            list.tail.next = node;
        }
    }
    insertAfter(prevNode, node) {
        if (!node) {
            return;
        }
        if (!prevNode) {
            this.head = this.tail = node;
            return;
        }
        node.next = prevNode.next;
        prevNode.next = node;
        node.prev = prevNode;
        if (node.next) {
            node.next.prev = node;
        }
    }
    each(callback) {
        let node = this.head;
        let index = 0;
        while (node) {
            callback(node, index++);
            node = node.next;
        }
    }
}
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
    }
    draw(color) {
        if (color) {
            ctx.save();
            ctx.fillStyle = color;
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        if (color) {
            ctx.restore();
        }
    }
    lineTo(p) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.closePath();
    }
}
;
function generatePoints(num) {
    const maxWidth = 500;
    const maxHeight = 300;
    return Array.from({ length: num }).map(() => {
        let point = new Point(250 + ~~(Math.random() * maxWidth), 150 + ~~(Math.random() * maxHeight));
        point.draw();
        return point;
    });
}
function generateConvexPolygon4(points) {
    let [left, top, right, bottom] = [];
    points.sort((a, b) => {
        if (!left || a.x < left.x) {
            left = a;
        }
        if (!right || a.x > right.x) {
            right = a;
        }
        if (b.x < left.x) {
            left = b;
        }
        if (b.x > right.x) {
            right = b;
        }
        return a.y - b.y;
    });
    top = points[0];
    bottom = points[points.length - 1];
    let list = new DLinkedList();
    list.push(list.createNode(top));
    let reachLeft = false, reachRight = false;
    for (let i = 1; i < points.length; i++) {
        if (!reachLeft && points[i].x <= list.head.item.x) {
            while (list.head.next && list.head.item !== top
                && getArc(list.head.next.item, list.head.item) !== Infinity
                && getArc(list.head.next.item, list.head.item)
                    >= getArc(list.head.next.item, points[i])) {
                console.log(getArc(list.head.next.item, list.head.item));
                console.log(getArc(list.head.item, points[i]));
                console.log('shift', list.shift());
            }
            list.unshift(list.createNode(points[i]));
        }
        else if (!reachRight && points[i].x >= list.tail.item.x) {
            while (list.tail.prev && list.tail.item !== top
                && getArc(list.tail.prev.item, list.tail.item) !== -Infinity
                && getArc(list.tail.prev.item, list.tail.item)
                    <= getArc(list.tail.prev.item, points[i])) {
                console.log(getArc(list.tail.prev.item, list.tail.item));
                console.log('pop', list.pop());
            }
            list.push(list.createNode(points[i]));
        }
    }
    let list2 = new DLinkedList();
    list2.push(list2.createNode(bottom));
    let reachLeft2 = false, reachRight2 = false;
    for (let i = points.length - 2; i >= 0; i--) {
        if (!reachLeft2 && points[i].x <= list2.head.item.x) {
            while (list2.head.next && list2.head.item !== bottom
                && getArc(list2.head.next.item, list2.head.item) !== Infinity
                && getArc(list2.head.next.item, list2.head.item)
                    <= getArc(list2.head.next.item, points[i])) {
                console.log(getArc(list2.head.next.item, list2.head.item));
                console.log(getArc(list2.head.item, points[i]));
                console.log('shift', list2.shift());
            }
            list2.unshift(list2.createNode(points[i]));
        }
        else if (!reachRight2 && points[i].x >= list2.tail.item.x) {
            while (list2.tail.prev && list2.tail.item !== bottom
                && getArc(list2.tail.prev.item, list2.tail.item) !== -Infinity
                && getArc(list2.tail.prev.item, list2.tail.item)
                    >= getArc(list2.tail.prev.item, points[i])) {
                console.log(getArc(list2.tail.prev.item, list2.tail.item));
                console.log('pop', list2.pop());
            }
            list2.push(list2.createNode(points[i]));
        }
    }
    console.log(list);
    let node = list.head.next;
    let prevNode = list.head;
    while (node && prevNode) {
        prevNode.item.lineTo(node.item);
        prevNode = node;
        node = node.next;
    }
    console.log(list2);
    node = list2.head.next;
    prevNode = list2.head;
    while (node && prevNode) {
        prevNode.item.lineTo(node.item);
        prevNode = node;
        node = node.next;
    }
    // list.head!.item.lineTo(list2.head!.item);
    // list.tail!.item.lineTo(list2.tail!.item);
    function getArc(a, b) {
        return (a.x - b.x) / (a.y - b.y);
    }
}
/*
 * 将点按y坐标排序，排序过程中找到上下左右四个边界点
 * 从上开始往下找，直到到达左和右边界停止
 * 再从下往上找，同样的步骤，完成
 *
 * 一个点是否加入凸边形顶点的判断方法（以上到左为例）：
 * 按排序过程选取点。
 * 这个点的x必小于等于上一个顶点
 *
 * 一个点加入后，是否根据斜率删除上一个点（以上到左为例）：
 * 如果这个点与上一个点的y相等，只要上一个点不是初始点（最上点），则将上一个点抛弃。如果上一个点是始点，则共存。
 * 如果这个点与上上个点的斜率小于等于上个点与上上个点的斜率，并且上个点与上上个点的y不相等，则删除上一个点。
 * 满足以上条件就反复进行
 *
 */
function generateConvexPolygon5(points) {
    let [left, top, right, bottom] = [points[0], points[0], points[0], points[0]];
    points.sort((a, b) => {
        if (a.x < left.x) {
            left = a;
        }
        else if (a.x > right.x) {
            right = a;
        }
        if (b.x < left.x) {
            left = b;
        }
        else if (b.x > right.x) {
            right = b;
        }
        return a.y - b.y;
    });
    top = points[0];
    bottom = points[points.length - 1];
    let convexPolygon = new Array(points.length * 2 - 1);
    let head = points.length - 1;
    let tail = head;
    convexPolygon[head] = top;
    let meetLeft = top === left, meetRight = top === right;
    for (let i = 1; i < points.length && (!meetLeft || !meetRight); i++) {
        if (points[i] === left) {
            meetLeft = true;
        }
        else if (points[i] === right) {
            meetRight = true;
        }
        if (points[i].x <= convexPolygon[head].x) {
            for (let j = head; j < points.length - 1
                && (points[i].y === convexPolygon[head].y
                    || convexPolygon[head].y !== convexPolygon[head + 1].y
                        && getArc(points[i], convexPolygon[head + 1])
                            <= getArc(convexPolygon[head], convexPolygon[head + 1])); j++) {
                head++;
            }
            convexPolygon[--head] = points[i];
        }
        if (points[i].x >= convexPolygon[tail].x) {
            for (let j = tail; j > points.length - 1
                && (points[i].y === convexPolygon[tail].y
                    || convexPolygon[tail].y !== convexPolygon[tail - 1].y
                        && getArc(points[i], convexPolygon[tail - 1])
                            >= getArc(convexPolygon[tail], convexPolygon[tail - 1])); j--) {
                tail--;
            }
            convexPolygon[++tail] = points[i];
        }
    }
    let convexPolygon2 = new Array(points.length * 2 - 1);
    let head2 = points.length - 1;
    let tail2 = head2;
    convexPolygon2[head2] = bottom;
    let meetLeft2 = bottom === left, meetRight2 = bottom === right;
    for (let i = points.length - 2; i >= 0 && (!meetLeft2 || !meetRight2); i--) {
        if (points[i] === left) {
            meetLeft2 = true;
        }
        else if (points[i] === right) {
            meetRight2 = true;
        }
        if (points[i].x <= convexPolygon2[head2].x) {
            for (let j = head2; j < points.length - 1
                && (points[i].y === convexPolygon2[head2].y
                    || convexPolygon2[head2].y !== convexPolygon2[head2 + 1].y
                        && getArc(points[i], convexPolygon2[head2 + 1])
                            >= getArc(convexPolygon2[head2], convexPolygon2[head2 + 1])); j++) {
                head2++;
            }
            convexPolygon2[--head2] = points[i];
        }
        if (points[i].x >= convexPolygon2[tail2].x) {
            for (let j = tail2; j > points.length - 1
                && (points[i].y === convexPolygon2[tail2].y
                    || convexPolygon2[tail2].y !== convexPolygon2[tail2 - 1].y
                        && getArc(points[i], convexPolygon2[tail2 - 1])
                            <= getArc(convexPolygon2[tail2], convexPolygon2[tail2 - 1])); j--) {
                tail2--;
            }
            convexPolygon2[++tail2] = points[i];
        }
    }
    for (let i = head; i < tail; i++) {
        convexPolygon[i].lineTo(convexPolygon[i + 1]);
    }
    for (let i = head2; i < tail2; i++) {
        convexPolygon2[i].lineTo(convexPolygon2[i + 1]);
    }
    function getArc(a, b) {
        return (a.x - b.x) / (a.y - b.y);
    }
}
function generateConvexPolygon(points) {
    let [left, top, right, bottom] = [points[0], points[0], points[0], points[0]];
    points.sort((a, b) => {
        if (a.x < left.x) {
            left = a;
        }
        else if (a.x > right.x) {
            right = a;
        }
        if (b.x < left.x) {
            left = b;
        }
        else if (b.x > right.x) {
            right = b;
        }
        return a.y - b.y;
    });
    top = points[0];
    bottom = points[points.length - 1];
    let convexPolygon = new Array(points.length * 2 - 1);
    let head = points.length - 1;
    let tail = head;
    convexPolygon[head] = top;
    let meetLeft = top === left, meetRight = top === right;
    let i;
    for (i = 1; i < points.length && (!meetLeft || !meetRight); i++) {
        macroTemplate(1);
    }
    for (i = head; i < tail; i++) {
        convexPolygon[i].lineTo(convexPolygon[i + 1]);
    }
    // convexPolygon = new Array(points.length * 2 - 1);// 这行可以省略了
    head = points.length - 1;
    tail = head;
    convexPolygon[head] = bottom;
    meetLeft = bottom === left, meetRight = bottom === right;
    for (i = points.length - 2; i >= 0 && (!meetLeft || !meetRight); i--) {
        macroTemplate(-1);
    }
    for (i = head; i < tail; i++) {
        convexPolygon[i].lineTo(convexPolygon[i + 1]);
    }
    function getArc(a, b) {
        return (a.x - b.x) / (a.y - b.y);
    }
    function macroTemplate(arcDirection) {
        if (points[i] === left) {
            meetLeft = true;
        }
        else if (points[i] === right) {
            meetRight = true;
        }
        if (points[i].x <= convexPolygon[head].x) {
            for (let j = head; j < points.length - 1
                && (points[i].y === convexPolygon[head].y
                    || convexPolygon[head].y !== convexPolygon[head + 1].y
                        && getArc(points[i], convexPolygon[head + 1]) * arcDirection
                            <= getArc(convexPolygon[head], convexPolygon[head + 1]) * arcDirection); j++) {
                head++;
            }
            convexPolygon[--head] = points[i];
        }
        if (points[i].x >= convexPolygon[tail].x) {
            for (let j = tail; j > points.length - 1
                && (points[i].y === convexPolygon[tail].y
                    || convexPolygon[tail].y !== convexPolygon[tail - 1].y
                        && getArc(points[i], convexPolygon[tail - 1]) * arcDirection
                            >= getArc(convexPolygon[tail], convexPolygon[tail - 1]) * arcDirection); j--) {
                tail--;
            }
            convexPolygon[++tail] = points[i];
        }
    }
}
let points = generatePoints(10);
// let points = readPoints();
generateConvexPolygon(points);
function readPoints() {
    let json = [{ "x": 712, "y": 170, "radius": 5 }, { "x": 563, "y": 191, "radius": 5 }, { "x": 463, "y": 191, "radius": 5 }, { "x": 331, "y": 223, "radius": 5 }, { "x": 725, "y": 276, "radius": 5 }, { "x": 623, "y": 283, "radius": 5 }, { "x": 668, "y": 291, "radius": 5 }, { "x": 676, "y": 333, "radius": 5 }, { "x": 504, "y": 360, "radius": 5 }, { "x": 564, "y": 379, "radius": 5 }, { "x": 588, "y": 393, "radius": 5 }];
    // let json=[{"x":336,"y":152,"radius":5},{"x":348,"y":168,"radius":5},{"x":622,"y":168,"radius":5},{"x":444,"y":184,"radius":5},{"x":288,"y":188,"radius":5},{"x":689,"y":210,"radius":5},{"x":462,"y":215,"radius":5},{"x":397,"y":217,"radius":5},{"x":437,"y":247,"radius":5},{"x":664,"y":278,"radius":5},{"x":707,"y":281,"radius":5},{"x":591,"y":285,"radius":5},{"x":696,"y":285,"radius":5},{"x":710,"y":293,"radius":5},{"x":694,"y":301,"radius":5},{"x":266,"y":303,"radius":5},{"x":297,"y":304,"radius":5},{"x":592,"y":358,"radius":5},{"x":353,"y":360,"radius":5},{"x":683,"y":361,"radius":5},{"x":353,"y":371,"radius":5},{"x":335,"y":376,"radius":5},{"x":552,"y":406,"radius":5},{"x":315,"y":406,"radius":5},{"x":543,"y":409,"radius":5},{"x":390,"y":410,"radius":5},{"x":345,"y":417,"radius":5},{"x":296,"y":418,"radius":5},{"x":647,"y":434,"radius":5},{"x":694,"y":443,"radius":5}];
    // let json = [{ "x": 379, "y": 165, "radius": 5 }, { "x": 653, "y": 165, "radius": 5 }, { "x": 268, "y": 166, "radius": 5 }, { "x": 388, "y": 191, "radius": 5 }, { "x": 728, "y": 200, "radius": 5 }, { "x": 469, "y": 231, "radius": 5 }, { "x": 693, "y": 237, "radius": 5 }, { "x": 376, "y": 238, "radius": 5 }, { "x": 717, "y": 245, "radius": 5 }, { "x": 386, "y": 257, "radius": 5 }, { "x": 528, "y": 258, "radius": 5 }, { "x": 713, "y": 271, "radius": 5 }, { "x": 567, "y": 278, "radius": 5 }, { "x": 499, "y": 286, "radius": 5 }, { "x": 698, "y": 295, "radius": 5 }, { "x": 731, "y": 305, "radius": 5 }, { "x": 520, "y": 306, "radius": 5 }, { "x": 696, "y": 319, "radius": 5 }, { "x": 362, "y": 340, "radius": 5 }, { "x": 324, "y": 343, "radius": 5 }, { "x": 311, "y": 361, "radius": 5 }, { "x": 495, "y": 363, "radius": 5 }, { "x": 691, "y": 364, "radius": 5 }, { "x": 352, "y": 380, "radius": 5 }, { "x": 273, "y": 400, "radius": 5 }, { "x": 266, "y": 401, "radius": 5 }, { "x": 569, "y": 425, "radius": 5 }, { "x": 390, "y": 425, "radius": 5 }, { "x": 661, "y": 428, "radius": 5 }, { "x": 250, "y": 446, "radius": 5 }];
    // let json = [{ "x": 392, "y": 158, "radius": 5 }, { "x": 492, "y": 205, "radius": 5 }, { "x": 723, "y": 250, "radius": 5 }, { "x": 659, "y": 310, "radius": 5 }, { "x": 519, "y": 426, "radius": 5 }];
    // let json = [{ "x": 392, "y": 158, "radius": 5 }, { "x": 342, "y": 158, "radius": 5 }, { "x": 292, "y": 158, "radius": 5 }, { "x": 492, "y": 205, "radius": 5 }, { "x": 723, "y": 250, "radius": 5 }, { "x": 659, "y": 310, "radius": 5 }, { "x": 519, "y": 426, "radius": 5 }];
    // let json = [{ "x": 329, "y": 159, "radius": 5 }, { "x": 648, "y": 165, "radius": 5 }, { "x": 363, "y": 193, "radius": 5 }, { "x": 277, "y": 254, "radius": 5 }, { "x": 463, "y": 273, "radius": 5 }, { "x": 363, "y": 314, "radius": 5 }, { "x": 474, "y": 337, "radius": 5 }, { "x": 590, "y": 366, "radius": 5 }, { "x": 358, "y": 395, "radius": 5 }, { "x": 641, "y": 395, "radius": 5 }];
    return Array.from({ length: json.length }).map((item, index) => {
        let point = new Point(json[index].x, json[index].y);
        point.draw();
        return point;
    });
}
//# sourceMappingURL=convexPolygon.js.map