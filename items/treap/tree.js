"use strict";
const container = document.getElementById('mychart');
const myChart = echarts.init(container);
const option = {
    tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
    },
    series: [
        {
            type: 'tree',
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
            symbolSize: 1,
            label: {
                rich: {
                    a: {
                        color: '#111',
                        position: 'top',
                        align: 'center',
                        fontSize: 19,
                        borderWidth: 2,
                        borderColor: '#b03a5b',
                        borderRadius: 100,
                        width: 30,
                        height: 30,
                        lineHeight: 32,
                    },
                    b: {
                        color: '#2f4554',
                        align: 'center'
                    },
                }
            },
            leaves: {
                label: {
                    position: 'bottom',
                    align: 'middle'
                }
            },
            animationDurationUpdate: 750
        }
    ]
};
const nullNode = {
    item: { num: Infinity },
    left: undefined,
    right: undefined,
    priority: 255
};
nullNode.left = nullNode.right = nullNode;
function itemCompare(item1, item2) {
    return item1.num - item2.num;
}
class BTree {
    constructor() {
        this.nullNode = nullNode;
        this.size = 0;
        this.root = this.nullNode;
    }
    createNode(item) {
        return {
            item,
            left: this.nullNode,
            right: this.nullNode
        };
    }
    addItem(item) {
        let newNode = this.createNode(item);
        this.root = this._addItem(this.root, newNode);
        this.size++;
    }
    _addItem(node, newNode) {
        if (node === this.nullNode) {
            return newNode;
        }
        let dir = itemCompare(newNode.item, node.item);
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
    traverseByLevel(callback) {
        if (this.root === this.nullNode) {
            return;
        }
        let arr = [this.root];
        for (let i = 0; i < arr.length; i++) {
            callback(arr[i]);
            if (arr[i].left !== this.nullNode) {
                arr.push(arr[i].left);
            }
            if (arr[i].right !== this.nullNode) {
                arr.push(arr[i].right);
            }
        }
    }
    createChartData(node) {
        if (node === this.nullNode) {
            return { name: '' };
        }
        let data = {
            name: `{a|${node.item.num}}\n{b|${node.priority}}`,
            children: []
        };
        data.children[0] = this.createChartData(node.left);
        data.children[1] = this.createChartData(node.right);
        if (data.children.every(item => item.name === '')) {
            data.children = [];
        }
        return data;
    }
    show() {
        let data = this.createChartData(this.root);
        option.series[0].data = [{ name: 'root', label: { borderWidth: 0 }, children: [data] }];
        myChart.setOption(option);
    }
}
class Treap extends BTree {
    constructor() {
        super();
        this.nullNode.priority = 255;
    }
    createNode(item) {
        let node = super.createNode(item);
        node.priority = ~~(Math.random() * 255);
        return node;
    }
    insert(item, priority) {
        this.size++;
        this.root = this._insert(item, this.root, priority);
    }
    singleRotateWithLeft(node) {
        let tempNode = node.left;
        node.left = tempNode.right;
        tempNode.right = node;
        return tempNode;
    }
    singleRotateWithRight(node) {
        let tempNode = node.right;
        node.right = tempNode.left;
        tempNode.left = node;
        return tempNode;
    }
    _insert(item, node, priority) {
        if (node === this.nullNode) {
            let newNode = this.createNode(item);
            if (typeof priority === 'number') {
                newNode.priority = priority;
            }
            return newNode;
        }
        if (itemCompare(item, node.item) < 0) {
            node.left = this._insert(item, node.left, priority);
            if (node.left.priority < node.priority) {
                node = this.singleRotateWithLeft(node);
            }
        }
        else {
            node.right = this._insert(item, node.right, priority);
            if (node.right.priority < node.priority) {
                node = this.singleRotateWithRight(node);
            }
        }
        return node;
    }
    delete(item) {
        if (this.root === this.nullNode) {
            return;
        }
        this.size--;
        this.root = this._delete(item, this.root);
    }
    _delete(item, node) {
        if (node !== this.nullNode) {
            if (itemCompare(item, node.item) < 0) {
                node.left = this._delete(item, node.left);
            }
            else if (itemCompare(item, node.item) > 0) {
                node.right = this._delete(item, node.right);
            }
            else {
                if (node.left.priority < node.right.priority) {
                    node = this.singleRotateWithLeft(node);
                    // 只要左priority小于右priority，左子节点绝不可能是nullNode
                    node.right = this._delete(item, node.right);
                }
                else {
                    node = this.singleRotateWithRight(node);
                    if (node !== this.nullNode) {
                        node.left = this._delete(item, node.left);
                    }
                    else {
                        node.left = this.nullNode;
                    }
                }
            }
        }
        return node;
    }
    split(item) {
        let [left, right] = this.splitNode(item, this.root);
        this.root = left;
        let splitTree = new Treap();
        splitTree.root = right;
        return splitTree;
    }
    splitNode(item, node) {
        let newNode = this.createNode({ num: Infinity }); // dump node;
        let leftMaxNode = newNode;
        let rightMinNode = newNode;
        while (node !== this.nullNode) {
            if (itemCompare(item, node.item) < 0) {
                rightMinNode.left = node;
                node = node.left;
                rightMinNode = rightMinNode.left;
                rightMinNode.left = this.nullNode;
            }
            else {
                leftMaxNode.right = node;
                node = node.right;
                leftMaxNode = leftMaxNode.right;
                leftMaxNode.right = this.nullNode;
            }
        }
        return [newNode.right, newNode.left];
    }
    merge(treap) {
        this.root = this.preMerge(this.root, treap.root);
    }
    preMerge(node1, node2) {
        if (node1 === this.nullNode) {
            return node2;
        }
        if (node2 === this.nullNode) {
            return node1;
        }
        if (itemCompare(node1.item, node2.item) < 0) {
            return this._merge(node1, node2);
        }
        return this._merge(node2, node1);
    }
    _merge(node1, node2) {
        if (node1.priority < node2.priority) {
            let [left, right] = this.splitNode(node1.item, node2);
            node1.right = this.preMerge(node1.right, right);
            node1.left = this.preMerge(node1.left, left);
            return node1;
        }
        else {
            let [left, right] = this.splitNode(node2.item, node1);
            node2.right = this.preMerge(node2.right, right);
            node2.left = this.preMerge(node2.left, left);
            return node2;
        }
    }
    mergeByEach(treap) {
        const each = (node) => {
            if (node === this.nullNode) {
                return;
            }
            this.insert(node.item, node.priority);
            each(node.left);
            each(node.right);
        };
        each(treap.root);
    }
}
const tree = new Treap();
let testcase = [];
for (let i = 0; i < 20; i++) {
    testcase.push(~~(Math.random() * 100));
}
for (let num of testcase) {
    tree.insert({ num });
}
tree.show();
let idx = 0;
function insertToTree() {
    if (idx >= testcase.length) {
        return;
    }
    tree.insert({ num: testcase[idx++] });
    tree.show();
}
function deleteRoot() {
    tree.delete(tree.root.item);
    tree.show();
}
/* const tree1 = new Treap();
let testcase1 = [
    { num: 10, priority: 1 },
    { num: 5, priority: 5 },
    { num: 17, priority: 6 },
    { num: 3, priority: 10 },
    { num: 7, priority: 9 },
    { num: 14, priority: 14 },
    { num: 20, priority: 7 },
];
for (let item of testcase1) {
    tree1.insert({ num: item.num }, item.priority);
}
tree1.show();

const tree2 = new Treap();
let testcase2 = [
    { num: 7, priority: 4 },
    { num: 5, priority: 8 },
    { num: 10, priority: 4 },
    { num: 1, priority: 10 },
    { num: 5, priority: 9 },
    { num: 9, priority: 5 },
    { num: 14, priority: 6 },
];
for (let item of testcase2) {
    tree2.insert({ num: item.num }, item.priority);
}
tree2.show();

tree1.merge(tree2); */
// tree1.show()
/* function aa() {
    const tree = new Treap();

    let testcase: number[] = [];
    for (let i = 0; i < 20; i++) {
        testcase.push(~~(Math.random() * 20));
    }

    for (let num of testcase) {
        tree.insert({ num });
    }
    return tree;
}
let tree1 = aa();
let tree2 = aa();
tree1.show()
function bb() {
    console.time('aa')
    tree1.merge(tree2);
    console.timeEnd('aa')
    tree1.show();
}
function cc(){
    console.time('aa')
    tree1.mergeByEach(tree2);
    console.timeEnd('aa')
} */ 
//# sourceMappingURL=tree.js.map