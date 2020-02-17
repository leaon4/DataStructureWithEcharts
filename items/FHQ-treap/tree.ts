declare const echarts: any;
const container = document.getElementById('mychart') as HTMLDivElement;
const myChart = echarts.init(container);

const option: any = {
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

type ChartData = {
    name: number | string;
    children?: ChartData[];
};
type Item = {
    num: number;
};

type TreeNode = {
    item: Item;
    left: number;
    right: number;
    priority: number;
};

function itemCompare(item1: Item, item2: Item): number {
    return item1.num - item2.num;
}
class FHQ_Treap {
    treap: TreeNode[] = [];
    root = 0;
    constructor() {
        this.pushNode({ num: -Infinity });
    }
    private createChartData(cur: number): ChartData {
        if (!cur) {
            return { name: '' };
        }
        let node = this.treap[cur];
        let data: ChartData = {
            name: `{a|${node.item.num}}\n{b|${node.priority}}`,
            children: []
        }
        data.children![0] = this.createChartData(node.left);
        data.children![1] = this.createChartData(node.right);
        if (data.children!.every(item => item.name === '')) {
            data.children = [];
        }
        return data;
    }
    show(): void {
        let data: ChartData = this.createChartData(this.root);
        option.series[0].data = [{ name: 'root', label: { borderWidth: 0 }, children: [data] }];
        myChart.setOption(option);
    }
    private createNode(item: Item, priority: number = ~~(Math.random() * 256)): TreeNode {
        return {
            item,
            left: 0,
            right: 0,
            priority
        };
    }
    private pushNode(item: Item, priority?: number): number {
        this.treap.push(this.createNode(item, priority));
        return this.treap.length - 1;
    }
    private split(item: Item, cur: number, x: TreeNode, y: TreeNode) {
        if (!cur) {
            x.right = y.left = 0;
            return;
        }
        if (itemCompare(item, this.treap[cur].item) < 0) {
            y.left = cur;
            this.split(item, this.treap[cur].left, x, this.treap[cur]);
        } else {
            x.right = cur;
            this.split(item, this.treap[cur].right, this.treap[cur], y);
        }
    }
    private merge(x: number, y: number): number {
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
    insert(item: Item, priority?: number) {
        let newNode = this.pushNode(item, priority);
        let dumpNode = this.createNode({ num: Infinity });
        this.split(item, this.root, dumpNode, dumpNode);
        this.root = this.merge(this.merge(dumpNode.right, newNode), dumpNode.left);
    }
    deleteMin(item?: Item) {
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
    deleteMax(item?: Item) {
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
    delete(item: Item) {
        let dumpNode = this.createNode({ num: Infinity });
        this.split(item, this.root, dumpNode, dumpNode);
        this.root = dumpNode.right;
        this.deleteMax(item);
        this.root = this.merge(this.root, dumpNode.left);
    }
    range(min: Item, max: Item, cur = this.root) {
        if (!cur) {
            return;
        }
        if (itemCompare(this.treap[cur].item, max) > 0) {
            this.range(min, max, this.treap[cur].left);
        } else if (itemCompare(this.treap[cur].item, min) < 0) {
            this.range(min, max, this.treap[cur].right);
        } else {
            this.range(min, max, this.treap[cur].left);
            console.log(this.treap[cur].item.num);
            this.range(min, max, this.treap[cur].right);
        }
    }
}

const tree = new FHQ_Treap();

let testcase: number[] = [];
for (let i = 0; i < 50; i++) {
    testcase.push(~~(Math.random() * 100));
}
for (let num of testcase) {
    tree.insert({ num });
}

tree.show()

let idx = 0
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
