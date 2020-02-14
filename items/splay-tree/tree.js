"use strict";
const container = document.getElementById('mychart');
const myChart = geta('echarts').init(container);
function geta(str) {
    return window[str];
}
const option = {
    tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
    },
    series: [
        {
            type: 'tree',
            // data: [data],
            data: [],
            left: '2%',
            right: '2%',
            top: '8%',
            bottom: '20%',
            symbol: 'emptyCircle',
            orient: 'vertical',
            expandAndCollapse: true,
            lineStyle: {
                curveness: 0,
            },
            initialTreeDepth: -1,
            // symbolSize:20,
            label: {
                normal: {
                    position: 'top',
                    align: 'middle',
                    fontSize: 19,
                    color: 'black'
                }
            },
            leaves: {
                label: {
                    normal: {
                        position: 'bottom',
                        align: 'middle'
                    }
                }
            },
            animationDurationUpdate: 750
        }
    ]
};
function itemCompare(item1, item2) {
    return item2.num - item1.num;
}
class BTree {
    constructor() {
        this.size = 0;
        this.root = null;
    }
    createNode(item) {
        return {
            item,
            left: null,
            right: null
        };
    }
    addItem(item) {
        let newNode = this.createNode(item);
        this.root = this._addItem(this.root, newNode);
        this.size++;
    }
    _addItem(node, newNode) {
        if (!node) {
            return newNode;
        }
        let dir = itemCompare(node.item, newNode.item);
        if (dir < 0) {
            node.left = this._addItem(node.left, newNode);
        }
        else if (dir > 0) {
            node.right = this._addItem(node.right, newNode);
        }
        else {
            console.warn('same item');
            this.size--;
        }
        return node;
    }
    createChartData(node) {
        if (!node) {
            return { name: '' };
        }
        let data = {
            name: node.item.num,
            children: []
        };
        data.children[0] = this.createChartData(node.left);
        data.children[1] = this.createChartData(node.right);
        if (data.children.every(item => item.name === '')) {
            data.children = [];
        }
        return data;
    }
    _deleteItem(parentNode, childNode) {
        if (!parentNode) {
            this.root = null;
            parentNode = this.createNode({ num: -Infinity });
        }
        if (!childNode) {
            // 不可能发生的，只为了null check
            return;
        }
        let dir = itemCompare(parentNode.item, childNode.item);
        if (childNode.left && childNode.right) {
            if (dir < 0) {
                parentNode.left = childNode.right;
                let node = childNode.right;
                while (node.left) {
                    node = node.left;
                }
                node.left = childNode.left;
            }
            else {
                parentNode.right = childNode.left;
                let node = childNode.left;
                while (node.right) {
                    node = node.right;
                }
                node.right = childNode.right;
            }
        }
        else {
            if (dir < 0) {
                parentNode.left = childNode.left || childNode.right;
            }
            else {
                parentNode.right = childNode.left || childNode.right;
            }
        }
        if (!this.root) {
            this.root = parentNode.left || parentNode.right;
        }
    }
    deleteItem(item) {
        if (typeof item === 'number') {
            item = { num: item };
        }
        let parentNode = null;
        let node = this.root;
        while (node) {
            let dir = itemCompare(node.item, item);
            if (dir === 0) {
                this._deleteItem(parentNode, node);
                this.size--;
                return;
            }
            else {
                parentNode = node;
                node = dir < 0 ? node.left : node.right;
            }
        }
        throw 'the item is not in tree';
    }
    show() {
        let data = this.createChartData(this.root);
        option.series[0].data = [{ name: 'root', children: [data] }];
        // data.id = ~~(Math.random() * 1000000);
        // option.series[0].data = [data];
        myChart.setOption(option);
    }
}
class AVLTree extends BTree {
    constructor() {
        super();
    }
    addItem(item) {
        let newNode = this.createNode(item);
        newNode.height = 0;
        this.root = this._addItem(this.root, newNode);
        this.size++;
    }
    createNode(item) {
        let newNode = super.createNode(item);
        newNode.height = 0;
        return newNode;
    }
    _addItem(node, newNode) {
        if (!node) {
            return newNode;
        }
        let dir = itemCompare(node.item, newNode.item);
        if (dir < 0) {
            node.left = this._addItem(node.left, newNode);
            if (this.getNodeHeight(node.left) - this.getNodeHeight(node.right) == 2) {
                if (itemCompare(node.left.item, newNode.item) < 0) {
                    console.log('left single rotation');
                    return this.singleRotate(node, -1);
                }
                console.log('left double rotation');
                return this.doubleRotate(node, -1);
            }
        }
        else if (dir > 0) {
            node.right = this._addItem(node.right, newNode);
            if (this.getNodeHeight(node.left) - this.getNodeHeight(node.right) == -2) {
                if (itemCompare(node.right.item, newNode.item) < 0) {
                    console.log('right double rotation');
                    return this.doubleRotate(node, 1);
                }
                console.log('right single rotation');
                return this.singleRotate(node, 1);
            }
        }
        else {
            console.warn('same item');
            this.size--;
        }
        node.height = Math.max(this.getNodeHeight(node.left), this.getNodeHeight(node.right)) + 1;
        return node;
    }
    getNodeHeight(node) {
        if (!node) {
            return -1;
        }
        return node.height;
    }
    singleRotate(parentNode, dir) {
        let childNode;
        if (dir < 0) {
            childNode = parentNode.left;
            parentNode.left = childNode.right;
            childNode.right = parentNode;
        }
        else {
            childNode = parentNode.right;
            parentNode.right = childNode.left;
            childNode.left = parentNode;
        }
        parentNode.height = Math.max(this.getNodeHeight(parentNode.left), this.getNodeHeight(parentNode.right)) + 1;
        childNode.height = Math.max(this.getNodeHeight(childNode.left), this.getNodeHeight(childNode.right)) + 1;
        return childNode;
    }
    doubleRotate(parentNode, dir) {
        if (dir < 0) {
            parentNode.left = this.singleRotate(parentNode.left, 1);
        }
        else {
            parentNode.right = this.singleRotate(parentNode.right, -1);
        }
        return this.singleRotate(parentNode, dir);
    }
    deleteItem(item) {
        throw 'not implemented';
    }
}
class SplayTree extends BTree {
    constructor() {
        super();
    }
    find(item) {
        if (typeof item === 'number') {
            item = { num: item };
        }
        let nodes = [this.root];
        let node = this.root;
        while (node) {
            let dir = itemCompare(node.item, item);
            if (dir === 0) {
                this.splay(nodes);
                return node.item.num;
            }
            else {
                if (dir < 0) {
                    node = node.left;
                }
                else {
                    node = node.right;
                }
                nodes.push(node);
            }
        }
    }
    splay(nodes) {
        const zigzagRotate = (dir) => {
            if (!k4) {
                this.root = this.zigzigRotate(k3, k2, dir);
            }
            else if (k4.left === k3) {
                k4.left = this.zigzigRotate(k3, k2, dir);
            }
            else {
                k4.right = this.zigzigRotate(k3, k2, dir);
            }
        };
        const doubleRotate = (dir) => {
            if (!k4) {
                this.root = this.doubleRotate(k3, dir);
            }
            else if (k4.left === k3) {
                k4.left = this.doubleRotate(k3, dir);
            }
            else {
                k4.right = this.doubleRotate(k3, dir);
            }
        };
        while (true) {
            var k1 = nodes[nodes.length - 1];
            var k2 = nodes[nodes.length - 2];
            var k3 = nodes[nodes.length - 3];
            var k4 = nodes[nodes.length - 4];
            if (!k2 || !k1) {
                return;
            }
            if (!k3) {
                let dir = k2.left === k1 ? -1 : 1;
                this.root = this.singleRotate(k2, dir);
                return;
            }
            if (k3.left && k3.left.left === k1) {
                zigzagRotate(-1);
            }
            else if (k3.left && k3.left.right === k1) {
                doubleRotate(-1);
            }
            else if (k3.right && k3.right.right === k1) {
                zigzagRotate(1);
            }
            else if (k3.right && k3.right.left === k1) {
                doubleRotate(1);
            }
            nodes.splice(nodes.length - 3, 2);
        }
    }
    singleRotate(parentNode, dir) {
        let childNode;
        if (dir < 0) {
            childNode = parentNode.left;
            parentNode.left = childNode.right;
            childNode.right = parentNode;
        }
        else {
            childNode = parentNode.right;
            parentNode.right = childNode.left;
            childNode.left = parentNode;
        }
        return childNode;
    }
    doubleRotate(parentNode, dir) {
        if (dir < 0) {
            parentNode.left = this.singleRotate(parentNode.left, 1);
        }
        else {
            parentNode.right = this.singleRotate(parentNode.right, -1);
        }
        return this.singleRotate(parentNode, dir);
    }
    zigzigRotate(k3, k2, dir) {
        this.singleRotate(k3, dir);
        return this.singleRotate(k2, dir);
    }
}
// 以下为驱动代码
function refresh() {
    myChart.clear();
    myChart.setOption(option);
}
var findNum = 1;
function* main() {
    function addItem(num) {
        tree.addItem({ num });
    }
    const tree = new SplayTree();
    // let testcase = [3, 2, 1, 4, 5, 6, 7, 16, 15, 14, 13, 12, 11, 10, 8, 9];
    // let testcase = [1, 10, 2, 9, 3, 8, 4, 7, 5, 6];
    // let testcase = [7, 6, 5, 4, 3, 2, 1];
    // let testcase = [6, 5, 4, 3, 1, 2];
    // let testcase = [7, 6, 5, 4, 3, 2, 1].reverse();
    let testcase = [];
    for (let i = 32; i > 0; i -= 4) {
        testcase.push(i);
        if (i + 1 !== 33) {
            testcase.push(i + 1);
        }
        testcase.push(i - 2);
        testcase.push(i - 1);
    }
    testcase.push(1);
    for (let num of testcase) {
        addItem(num);
    }
    tree.show();
    while (true) {
        yield;
        tree.find(findNum);
        tree.show();
    }
}
let gen = main();
gen.next();
setInterval(() => {
    findNum = ~~(Math.random() * 32) + 1;
    console.log(findNum);
    gen.next();
}, 1500);
/* function* main() {
    function addItem(num: number) {
        tree.addItem({ num });
    }
    const tree = new SplayTree();
    // let testcase = [3, 2, 1, 4, 5, 6, 7, 16, 15, 14, 13, 12, 11, 10, 8, 9];
    // let testcase = [1, 10, 2, 9, 3, 8, 4, 7, 5, 6];
    // let testcase = [7, 6, 5, 4, 3, 2, 1];
    // let testcase = [6, 5, 4, 3, 1, 2];
    // let testcase = [7, 6, 5, 4, 3, 2, 1].reverse();
    while (true) {
        yield;
        let item = { num: ~~(Math.random() * 1000) + 1 };
        console.log(item.num);
        tree.addItem(item);
        tree.show();
    }
}
let gen = main();
gen.next();

setInterval(() => {
    gen.next();
}, 1500); */
//# sourceMappingURL=tree.js.map