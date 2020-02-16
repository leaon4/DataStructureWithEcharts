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
function itemCompare(item1, item2) {
    return item1.num - item2.num;
}
class FHQ_Treap {
    constructor() {
        this.treap = [];
        this.root = 0;
        this.pushNode({ num: -Infinity });
    }
    createChartData(cur) {
        if (!cur) {
            return { name: '' };
        }
        let node = this.treap[cur];
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
    createNode(item, priority = ~~(Math.random() * 256)) {
        return {
            item,
            left: 0,
            right: 0,
            priority
        };
    }
    pushNode(item, priority) {
        this.treap.push(this.createNode(item, priority));
        return this.treap.length - 1;
    }
    split(item, cur, x, y) {
        if (!cur) {
            x.right = y.left = 0;
            return;
        }
        if (itemCompare(item, this.treap[cur].item) < 0) {
            y.left = cur;
            this.split(item, this.treap[cur].left, x, this.treap[cur]);
        }
        else {
            x.right = cur;
            this.split(item, this.treap[cur].right, this.treap[cur], y);
        }
    }
    merge(x, y) {
        if (!x || !y) {
            return x + y;
        }
        if (this.treap[x].priority <= this.treap[y].priority) {
            this.treap[x].right = this.merge(this.treap[x].right, y);
            return x;
        }
        this.treap[y].left = this.merge(x, this.treap[y].left);
        return y;
    }
    insert(item, priority) {
        let newNode = this.pushNode(item, priority);
        let dumpNode = this.createNode({ num: Infinity });
        this.split(item, this.root, dumpNode, dumpNode);
        this.root = this.merge(this.merge(dumpNode.right, newNode), dumpNode.left);
    }
    deleteMin(item) {
        let cur = this.root, parent = this.root;
        if (!this.treap[cur].left) {
            this.root = this.treap[cur].right;
            return;
        }
        while (this.treap[cur].left) {
            parent = cur;
            cur = this.treap[cur].left;
        }
        if (item && itemCompare(item, this.treap[cur].item) !== 0) {
            return;
        }
        this.treap[parent].left = this.treap[cur].right;
    }
    deleteMax(item) {
        let cur = this.root, parent = this.root;
        if (!this.treap[cur].right) {
            this.root = this.treap[cur].left;
            return;
        }
        while (this.treap[cur].right) {
            parent = cur;
            cur = this.treap[cur].right;
        }
        if (item && itemCompare(item, this.treap[cur].item) !== 0) {
            return;
        }
        this.treap[parent].right = this.treap[cur].left;
    }
    delete(item) {
        let dumpNode = this.createNode({ num: Infinity });
        this.split(item, this.root, dumpNode, dumpNode);
        this.root = dumpNode.right;
        this.deleteMax(item);
        this.root = this.merge(this.root, dumpNode.left);
        this.show();
    }
}
const tree = new FHQ_Treap();
let testcase = [];
for (let i = 0; i < 50; i++) {
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
function deleteMin() {
    tree.deleteMin();
    tree.show();
}
function deleteMax() {
    tree.deleteMax();
    tree.show();
}
function deleteRoot() {
    tree.delete(tree.treap[tree.root].item);
    tree.show();
}
//# sourceMappingURL=tree.js.map