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
            // symbolSize:1,
            label: {
                normal: {
                    position: 'top',
                    align: 'middle',
                    fontSize: 19,
                    color: '#111',
                    borderWidth: 2,
                    borderColor: '#b03a5b',
                    borderRadius: 100,
                    width: 30,
                    height: 30,
                    lineHeight: 30,
                    rich: {}
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
    return item1.num - item2.num;
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
    traverseByLevel(callback) {
        if (!this.root) {
            return;
        }
        this._traverseByLevel([this.root, null], callback);
    }
    _traverseByLevel(nodes, callback) {
        if (!nodes.length) {
            return;
        }
        let arr = [];
        nodes.forEach((node) => {
            callback(node && node.item);
            if (node) {
                if (node.left) {
                    arr.push(node.left);
                }
                if (node.right) {
                    arr.push(node.right);
                }
            }
        });
        if (arr.length) {
            arr.push(null);
            this._traverseByLevel(arr, callback);
        }
    }
    createChartData(node) {
        if (!node) {
            return { name: '' };
        }
        let data = {
            name: '' + node.item.num,
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
class LeftistHeap extends BTree {
    constructor() {
        super();
    }
    createNode(item) {
        return {
            item,
            left: null,
            right: null,
            npl: 0
        };
    }
    insert(item) {
        let node = this.createNode(item);
        this.size++;
        this.root = this._preMerge(this.root, node);
    }
    insertUseCirculateMerge(item) {
        let node = this.createNode(item);
        this.size++;
        // this.root = this._preMerge(this.root, node);
        let tempHeap = new LeftistHeap();
        tempHeap.size++;
        tempHeap.root = node;
        this.mergeWithCirculate(tempHeap);
    }
    merge(h2) {
        this.size += h2.size;
        this.root = this._preMerge(this.root, h2.root);
    }
    deleteMin() {
        if (!this.root) {
            return undefined;
        }
        let node = this.root;
        this.root = this._preMerge(node.left, node.right);
        this.size--;
        return node.item;
    }
    deleteMinUseCirlucateMerge() {
        if (!this.root) {
            return undefined;
        }
        let item = this.root.item;
        this.size--;
        let rightNode = this.root.right;
        this.root = this.root.left;
        let rightHeap = new LeftistHeap();
        rightHeap.root = rightNode;
        this.mergeWithCirculate(rightHeap);
        return item;
    }
    _preMerge(node1, node2) {
        if (!node1) {
            return node2;
        }
        if (!node2) {
            return node1;
        }
        if (itemCompare(node1.item, node2.item) < 0) {
            return this._merge(node1, node2);
        }
        return this._merge(node2, node1);
    }
    _merge(node1, node2) {
        // for null check
        if (!node1 || !node2) {
            return null;
        }
        if (!node1.left) {
            node1.left = node2;
        }
        else {
            node1.right = this._preMerge(node1.right, node2);
            if (node1.left.npl < node1.right.npl) {
                this.swapChild(node1);
            }
            node1.npl = node1.right.npl + 1;
        }
        return node1;
    }
    swapChild(node) {
        // for null check
        if (!node) {
            return;
        }
        let tempNode = node.left;
        node.left = node.right;
        node.right = tempNode;
    }
    mergeWithCirculate(h2) {
        if (!h2.root) {
            return;
        }
        this.size += h2.size;
        if (!this.root) {
            this.root = h2.root;
            return;
        }
        let node1 = this.root, node2 = h2.root;
        let nodes = [];
        while (node1 || node2) {
            if (!node1) {
                do {
                    nodes.push(node2);
                    node2 = node2.right;
                } while (node2);
            }
            else if (!node2) {
                do {
                    nodes.push(node1);
                    node1 = node1.right;
                } while (node1);
            }
            else if (itemCompare(node1.item, node2.item) < 0) {
                nodes.push(node1);
                node1 = node1.right;
            }
            else {
                nodes.push(node2);
                node2 = node2.right;
            }
        }
        for (let i = nodes.length - 2; i >= 0; i--) {
            nodes[i].right = nodes[i + 1];
            if (!nodes[i].left || nodes[i].left.npl < nodes[i].right.npl) {
                this.swapChild(nodes[i]);
            }
            nodes[i].npl = !nodes[i].right ? 0 : nodes[i].right.npl + 1;
        }
        this.root = nodes[0];
    }
}
// let heap = new LeftistHeap();
// let heap = getTest2Heap();
let heap1 = getTest1Heap();
let heap2 = getTest2Heap();
function* main() {
    heap1.mergeWithCirculate(heap2);
    heap1.show();
    while (heap1.size) {
        yield;
        console.log(heap1.deleteMinUseCirlucateMerge());
        heap1.show();
    }
    /* let testcase = [6, 12, 7, 18, 24, 37, 18, 33];
    for (let num of testcase) {
        heap = heap.insert({ num });
        heap.show();
        yield;
    } */
}
let gen = main();
gen.next();
function getTest1Heap() {
    let heap = new LeftistHeap();
    let testcase = [3, 10, 8, 21, 14, 17, 23, 26];
    let npls = [2, 1, 0, 0, 0, 0, 0, 0];
    let nodes = testcase.map((num, index) => {
        return {
            item: { num },
            left: null,
            right: null,
            npl: npls[index]
        };
    });
    heap.root = nodes[0];
    heap.root.left = nodes[1];
    heap.root.right = nodes[2];
    heap.root.left.left = nodes[3];
    heap.root.left.right = nodes[4];
    heap.root.right.left = nodes[5];
    heap.root.left.right.left = nodes[6];
    heap.root.right.left.left = nodes[7];
    heap.size = testcase.length;
    return heap;
}
function getTest2Heap() {
    let heap = new LeftistHeap();
    let testcase = [6, 7, 12, 18, 24, 37, 18];
    for (let num of testcase) {
        heap.insert({ num });
    }
    heap.root.left.right.left = {
        item: { num: 33 },
        left: null,
        right: null,
        npl: 0
    };
    heap.size++;
    return heap;
}
//# sourceMappingURL=leftist_tree.js.map