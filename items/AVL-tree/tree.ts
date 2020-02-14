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
    height?: number;
} | null;

function itemCompare(item1: Item, item2: Item): number {
    return item2.num - item1.num;
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

class AVLTree extends BTree {
    constructor() {
        super();
    }
    addItem(item: Item): void {
        let newNode = this.createNode(item);
        newNode!.height = 0;
        this.root = this._addItem(this.root, newNode);
        this.size++;
    }
    protected createNode(item: Item): TreeNode {
        let newNode = super.createNode(item);
        newNode!.height = 0;
        return newNode;
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
        return this.rebanlance(node);
    }
    private getNodeHeight(node: TreeNode): number {
        if (!node) {
            return -1;
        }
        return node.height as number;
    }
    private singleRotate(parentNode: TreeNode, dir: number): TreeNode {
        let childNode: TreeNode;
        if (dir < 0) {
            childNode = parentNode!.left;
            parentNode!.left = childNode!.right;
            childNode!.right = parentNode;
        } else {
            childNode = parentNode!.right;
            parentNode!.right = childNode!.left;
            childNode!.left = parentNode;
        }
        parentNode!.height = Math.max(this.getNodeHeight(parentNode!.left), this.getNodeHeight(parentNode!.right)) + 1;
        childNode!.height = Math.max(this.getNodeHeight(childNode!.left), this.getNodeHeight(childNode!.right)) + 1;
        return childNode;
    }
    private doubleRotate(parentNode: TreeNode, dir: number): TreeNode {
        if (dir < 0) {
            parentNode!.left = this.singleRotate(parentNode!.left, 1);
        } else {
            parentNode!.right = this.singleRotate(parentNode!.right, -1);
        }
        return this.singleRotate(parentNode, dir);
    }
    /* 若指定了parentNode，不对parentNode上层做平衡调整 */
    deleteMin(parentNode?: TreeNode, dir?: 'left' | 'right'): Item | null {
        return this.deleteMinMax(parentNode, 'left', 'left');
    }
    /* 若指定了parentNode，不对parentNode上层做平衡调整 */
    deleteMax(parentNode?: TreeNode, dir?: 'left' | 'right'): Item | null {
        return this.deleteMinMax(parentNode, 'left', 'right');
    }
    private deleteMinMax(parentNode: TreeNode | undefined, keydir: 'left' | 'right', minmaxdir: 'left' | 'right'): Item | null {
        if (!this.root) {
            return null;
        }
        if (parentNode === undefined) {
            let nodes = this._deleteMinMax(this.root, minmaxdir);
            this.root = nodes[0];
            return nodes[1] && nodes[1].item;
        }
        if (!parentNode) {
            return null;
        }
        let nodes = this._deleteMinMax(parentNode[keydir], minmaxdir);
        parentNode[keydir] = nodes[0];
        return nodes[1] && nodes[1].item;
    }
    private _deleteMinMax(node: TreeNode, dir: 'left' | 'right'): [TreeNode, TreeNode] {
        if (!node) {
            return [null, null];
        }
        let oppositeDir: 'left' | 'right' = dir === 'left' ? 'right' : 'left';
        if (!node[dir]) {
            let deletedNode = node;
            node = node[oppositeDir];
            this.size--;
            return [node, deletedNode];
        }
        let nodes = this._deleteMinMax(node[dir], dir);
        node[dir] = nodes[0];
        node = this.rebanlance(node);
        return [node, nodes[1]];
    }
    private rebanlance(node: TreeNode): TreeNode {
        if (!node) {
            return null;
        }
        let leftHeight = this.getNodeHeight(node.left);
        let rightHeight = this.getNodeHeight(node.right);
        if (leftHeight > rightHeight + 1) {
            if (this.getNodeHeight(node.left!.left) >= this.getNodeHeight(node.left!.right)) {
                node = this.singleRotate(node, -1);
            } else {
                node = this.doubleRotate(node, -1);
            }
        } else if (leftHeight < rightHeight - 1) {
            if (this.getNodeHeight(node.right!.right) >= this.getNodeHeight(node.right!.left)) {
                node = this.singleRotate(node, 1);
            } else {
                node = this.doubleRotate(node, 1);
            }
        } else {
            node.height = Math.max(leftHeight, rightHeight) + 1;
        }
        return node;
    }
    deleteItem(item: Item) {
        if (!this.root) {
            return null;
        }
        this.root = this._deleteItem(this.root, item);
    }
    private _deleteItem(node: TreeNode, item: Item): TreeNode {
        if (!node) {
            console.log('not find');
            return node;
        }
        let dir = itemCompare(node.item, item);
        if (dir === 0) {
            // 虽然可以将一个条件合并，即只要左边存在，左边可以和都存在都执行一个方法
            // 但从效率上讲还是这样写要高一点点
            if (node.left && node.right) {
                let nodes = this._deleteMinMax(node.left, 'right');
                nodes[1]!.left = nodes[0];
                nodes[1]!.right = node.right;
                node = nodes[1];
            } else {
                this.size--;
                node = node.left ? node.left : node.right;
            }
        } else if (dir < 0) {
            node.left = this._deleteItem(node.left, item);
        } else {
            node.right = this._deleteItem(node.right, item);
        }
        return this.rebanlance(node);
    }
}


// 以下为驱动代码
/* function addItem(num: number) {
    tree.addItem({ num });
    tree.show();
}
const tree = new AVLTree();
function* main() {
    // let testcase = [3, 2, 1, 4, 5, 6, 7, 16, 15, 14, 13, 12, 11, 10, 8, 9];
    // let testcase = [1, 10, 2, 9, 3, 8, 4, 7, 5, 6];

    // let testcase = [4, 2, 6, 1, 5, 7, 8];
    // let testcase = [4, 2, 6, 3, 5, 7, 5.5];
    let testcase = [6, 4, 10, 3, 5, 8, 12, 2, 7, 9, 11, 14, 13, 15];
    for (let num of testcase) {
        tree.addItem({ num });
    }
    tree.show();
    testcase = [1];
    for (let num of testcase) {
        console.log(num);
        yield;
        tree.deleteItem({ num });
        tree.show();
    }
} */
/* function addItem(num: number) {
    tree.addItem({ num });
    tree.show();
} */

/* const tree = new AVLTree();
function* main() {
    // let testcase = [40, 20, 10, 5, 2, 60, 70, 75, 77, 30, 50, 15, 25, 35, 45, 55, 65, 7, 12, 17, 22, 27, 32, 37, 42, 47, 52, 57, 62, 67, 72];
    let testcase = [];
    for (let i = 1; i < 100; i++) {
        testcase.push(~~(Math.random() * 100) + 1);
    }
    testcase = [...new Set(testcase)]
    for (let num of testcase) {
        tree.addItem({ num });
    }
    tree.show();
    let arr: number[] = [];
    tree.traverseByLevel((item: Item | null) => {
        if (item) {
            arr.push(item.num);
        } else {
            console.log(arr.join());
            console.log('------------------');
            arr = [];
        }
    });
    testcase.sort(() => Math.random() - 0.5);
    for (let num of testcase) {
        console.log(num);
        yield;
        tree.deleteItem({ num });
        tree.show();
    }
}
let gen = main();
gen.next();

function refresh() {
    myChart.clear();
    myChart.setOption(option);
} */

const tree = new AVLTree();
let testcase = [40, 20, 10, 5, 2, 60, 70, 75, 77, 30, 50, 15, 25, 35, 45, 55, 65, 7, 12, 17, 22, 27, 32, 37, 42, 47, 52, 57, 62, 67, 72];
let index = 0;
const nextNumber = document.getElementById('next-number') as HTMLSpanElement;
const currentNumber = document.getElementById('current-number') as HTMLSpanElement;
showNumber();
tree.show();
function insertToTree() {
    tree.addItem({ num: testcase[index++] });
    tree.show();
    showNumber();
}

function deleteFromTree() {
    tree.deleteItem({ num: testcase[--index] });
    tree.show();
    showNumber();
}

function showNumber() {
    currentNumber.innerHTML = '' + (testcase[index - 1] || '');
    nextNumber.innerHTML = '' + testcase[index];
}