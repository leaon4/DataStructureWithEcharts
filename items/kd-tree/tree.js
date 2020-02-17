"use strict";
// declare const echarts: any;
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
            top: '12%',
            bottom: '20%',
            symbol: 'emptyCircle',
            orient: 'vertical',
            expandAndCollapse: true,
            lineStyle: {
                curveness: 0,
                color: '#f9d0c4',
            },
            initialTreeDepth: -1,
            // symbolSize:20,
            label: {
                position: 'top',
                align: 'middle',
                fontSize: 18,
                color: '#ddd',
                borderWidth: 1,
                backgroundColor: '#7b60bc',
                padding: [6, 10],
                borderRadius: 20,
                rich: {
                    a: {
                        color: '#fff',
                        fontSize: 18,
                        fontWeight: 'bold'
                    },
                }
            },
            leaves: {
                label: {
                    position: 'bottom',
                }
            },
            animationDurationUpdate: 750
        }
    ]
};
const NULLNODE = {
    item: [-Infinity, -Infinity],
    left: undefined,
    right: undefined
};
NULLNODE.left = NULLNODE.right = NULLNODE;
function itemCompare(item1, item2, dimension) {
    if (typeof dimension === 'number') {
        return item1[dimension] - item2[dimension];
    }
    return item1[0] - item2[0] || item1[1] - item2[1];
}
function isInRange(low, high, item) {
    return item.every((num, index) => low[index] <= num && num <= high[index]);
}
class KDTree {
    constructor(k, data) {
        this.k = k;
        this.table = [];
        this.root = NULLNODE;
        if (data) {
            this.table = data;
            this.build(data);
        }
    }
    build(data) {
        this.root = this._build(data, 0);
    }
    _build(data, dimension) {
        if (data.length === 0) {
            return NULLNODE;
        }
        data.sort((a, b) => a[dimension] - b[dimension]);
        let middle = ~~((data.length - 1) / 2);
        let low = data.slice(0, middle);
        let high = data.slice(middle + 1, data.length);
        let node = this.createNode(data[middle]);
        node.left = this._build(low, this.nextDimension(dimension));
        node.right = this._build(high, this.nextDimension(dimension));
        return node;
    }
    rebuild() {
        this.build(this.table);
    }
    createNode(item) {
        return {
            item,
            left: NULLNODE,
            right: NULLNODE
        };
    }
    show() {
        let data = this.createChartData(this.root, 0);
        option.series[0].data = [{ name: '', children: [data] }];
        myChart.setOption(option);
    }
    createChartData(node, dimension) {
        if (node === NULLNODE) {
            return { name: '', label: { padding: 0 } };
        }
        let arr = node.item.slice(0);
        arr[dimension] = `{a|${arr[dimension]}}`;
        let data = {
            name: `${arr.join(' | ')}`,
            children: []
        };
        data.children[0] = this.createChartData(node.left, this.nextDimension(dimension));
        data.children[1] = this.createChartData(node.right, this.nextDimension(dimension));
        if (data.children.every(item => item.name === '')) {
            data.children = [];
        }
        return data;
    }
    nextDimension(dimension) {
        return ++dimension % this.k;
    }
    insert(item) {
        this.root = this._insert(item, this.root, 0);
    }
    _insert(item, node, dimension) {
        if (node === NULLNODE) {
            this.table.push(item);
            return this.createNode(item);
        }
        if (itemCompare(item, node.item, dimension) < 0) {
            node.left = this._insert(item, node.left, this.nextDimension(dimension));
        }
        else {
            node.right = this._insert(item, node.right, this.nextDimension(dimension));
        }
        return node;
    }
    range(low, high, callback) {
        this._range(low, high, 0, this.root, callback);
    }
    _range(low, high, dimension, node, callback) {
        if (node === NULLNODE) {
            return;
        }
        if (isInRange(low, high, node.item)) {
            callback(node.item);
        }
        if (itemCompare(node.item, low, dimension) >= 0) {
            this._range(low, high, this.nextDimension(dimension), node.left, callback);
        }
        if (itemCompare(node.item, high, dimension) <= 0) {
            this._range(low, high, this.nextDimension(dimension), node.right, callback);
        }
    }
}
let tree;
let testcase = [];
function two() {
    testcase = [
        [53, 14],
        [27, 28],
        [67, 50],
        [30, 11],
        [31, 85],
        [79, 3],
        [99, 90],
        [29, 16],
        [40, 26],
        [7, 39],
        [32, 29],
        [82, 64],
        [38, 23],
        [15, 61],
        [73, 75],
    ];
    // testcase.reverse()
    tree = new KDTree(2, testcase);
    /* for (let item of testcase) {
        tree.insert(item);
    } */
    tree.show();
}
function three() {
    testcase = [
        [3, 1, 4],
        [2, 3, 7],
        [4, 3, 4],
        [2, 1, 3],
        [2, 4, 5],
        [6, 1, 4],
        [1, 4, 4],
        [0, 5, 7],
        [5, 2, 5],
        [4, 0, 6],
        [7, 1, 6],
    ];
    tree = new KDTree(3, testcase);
    // testcase.reverse()
    /* for (let item of testcase) {
        tree.insert(item);
    } */
    tree.show();
}
function random() {
    testcase = [];
    for (let i = 0; i < 20; i++) {
        testcase.push([
            ~~(Math.random() * 100),
            ~~(Math.random() * 100),
        ]);
    }
    tree = new KDTree(2);
    for (let item of testcase) {
        // tree.insert(item);
    }
    tree.show();
}
// two();
// three()
random();
// tree.range([-Infinity,-Infinity,-Infinity],[Infinity,Infinity,Infinity],(item:Item)=>console.log(item))
// tree.range([2, 2, 2], [5, 5, 5], (item: Item) => console.log(item))
let idx = 0;
function insertToTree() {
    if (idx < testcase.length) {
        let item = testcase[idx++].slice(0);
        tree.insert(item);
        tree.show();
    }
}
function rebuild() {
    tree.rebuild();
    tree.show();
}
//# sourceMappingURL=tree.js.map