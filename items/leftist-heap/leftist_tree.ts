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
                    rich: {
                    }
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

type ChartData = {
    name: number | string;
    children?: ChartData[];
};
type Item = {
    num: number;
};
type TreeNode = {
    item: Item;
    left: TreeNode;
    right: TreeNode;
    npl?: number;
} | null;

function itemCompare(item1: Item, item2: Item): number {
    return item1.num - item2.num;
}


class BTree {
    size: number;
    root: TreeNode;
    constructor() {
        this.size = 0;
        this.root = null;
    }
    protected createNode(item: Item): TreeNode {
        return {
            item,
            left: null,
            right: null
        };
    }
    addItem(item: Item): void {
        let newNode = this.createNode(item);
        this.root = this._addItem(this.root, newNode);
        this.size++;
    }
    protected _addItem(node: TreeNode, newNode: TreeNode): TreeNode {
        if (!node) {
            return newNode;
        }
        let dir: number = itemCompare(node.item, newNode!.item);
        if (dir < 0) {
            node.left = this._addItem(node.left, newNode);
        } else if (dir > 0) {
            node.right = this._addItem(node.right, newNode);
        } else {
            console.warn('same item');
            this.size--;
        }
        return node;
    }
    traverseByLevel(callback: (item: Item | null, ...args: any) => any) {
        if (!this.root) {
            return;
        }
        this._traverseByLevel([this.root, null], callback);
    }
    private _traverseByLevel(nodes: TreeNode[], callback: (item: Item | null, ...args: any) => any) {
        if (!nodes.length) {
            return;
        }
        let arr: TreeNode[] = [];
        nodes.forEach((node: TreeNode) => {
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
    private createChartData(node: TreeNode): ChartData {
        if (!node) {
            return { name: '' };
        }
        let data: ChartData = {
            name: '' + node.item.num,
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
}

class LeftistHeap extends BTree {
    constructor() {
        super();
    }
    protected createNode(item: Item): TreeNode {
        return {
            item,
            left: null,
            right: null,
            npl: 0
        };
    }
    insert(item: Item): void {
        let node = this.createNode(item);
        this.size++;
        this.root = this._preMerge(this.root, node);
    }
    insertUseCirculateMerge(item: Item): void {
        let node = this.createNode(item);
        this.size++;
        // this.root = this._preMerge(this.root, node);
        let tempHeap = new LeftistHeap();
        tempHeap.size++;
        tempHeap.root = node;
        this.mergeWithCirculate(tempHeap);
    }
    merge(h2: LeftistHeap): void {
        this.size += h2.size;
        this.root = this._preMerge(this.root, h2.root);
    }
    deleteMin(): Item | undefined {
        if (!this.root) {
            return undefined;
        }
        let node = this.root;
        this.root = this._preMerge(node.left, node.right);
        this.size--;
        return node.item;
    }
    deleteMinUseCirlucateMerge(): Item | undefined {
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
    private _preMerge(node1: TreeNode, node2: TreeNode): TreeNode {
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
    private _merge(node1: TreeNode, node2: TreeNode): TreeNode {
        // for null check
        if (!node1 || !node2) {
            return null;
        }
        if (!node1.left) {
            node1.left = node2;
        } else {
            node1.right = this._preMerge(node1.right, node2);
            if (node1.left.npl as number < (node1.right!.npl as number)) {
                this.swapChild(node1);
            }
            node1!.npl = (node1.right!.npl as number) + 1;
        }
        return node1;
    }
    private swapChild(node: TreeNode): void {
        // for null check
        if (!node) {
            return;
        }
        let tempNode = node.left;
        node.left = node.right;
        node.right = tempNode;
    }
    mergeWithCirculate(h2: LeftistHeap): void {
        if (!h2.root) {
            return;
        }
        this.size += h2.size;
        if (!this.root) {
            this.root = h2.root;
            return;
        }
        let node1: TreeNode = this.root, node2: TreeNode = h2.root;
        let nodes: TreeNode[] = [];
        while (node1 || node2) {
            if (!node1) {
                do {
                    nodes.push(node2);
                    node2 = node2!.right;
                } while (node2);
            } else if (!node2) {
                do {
                    nodes.push(node1);
                    node1 = node1!.right;
                } while (node1);
            } else if (itemCompare(node1.item, node2.item) < 0) {
                nodes.push(node1);
                node1 = node1!.right;
            } else {
                nodes.push(node2);
                node2 = node2!.right;
            }
        }
        for (let i = nodes.length - 2; i >= 0; i--) {
            nodes[i]!.right = nodes[i + 1];
            if (!nodes[i]!.left || (nodes[i]!.left!.npl as number) < (nodes[i]!.right!.npl as number)) {
                this.swapChild(nodes[i]);
            }
            nodes[i]!.npl = !nodes[i]!.right ? 0 : (nodes[i]!.right!.npl as number) + 1;
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


function getTest1Heap(): LeftistHeap {
    let heap = new LeftistHeap();
    let testcase = [3, 10, 8, 21, 14, 17, 23, 26];
    let npls = [2, 1, 0, 0, 0, 0, 0, 0];
    let nodes = testcase.map((num: number, index: number) => {
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
function getTest2Heap(): LeftistHeap {
    let heap = new LeftistHeap();
    let testcase = [6, 7, 12, 18, 24, 37, 18];
    for (let num of testcase) {
        heap.insert({ num });
    }
    heap.root!.left!.right!.left = {
        item: { num: 33 },
        left: null,
        right: null,
        npl: 0
    };
    heap.size++;
    return heap;
}