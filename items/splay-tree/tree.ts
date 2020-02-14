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
    private createChartData(node: TreeNode): ChartData {
        if (!node) {
            return { name: '' };
        }
        let data: ChartData = {
            name: node.item.num,
            children: []
        }
        data.children![0] = this.createChartData(node.left);
        data.children![1] = this.createChartData(node.right);
        if (data.children!.every(item => item.name === '')) {
            data.children = [];
        }
        return data;
    }
    private _deleteItem(parentNode: TreeNode, childNode: TreeNode) {
        if (!parentNode) {
            this.root = null;
            parentNode = this.createNode({ num: -Infinity });
        }
        if (!childNode) {
            // 不可能发生的，只为了null check
            return;
        }
        let dir = itemCompare(parentNode!.item, childNode.item);
        if (childNode.left && childNode.right) {
            if (dir < 0) {
                parentNode!.left = childNode.right;
                let node: TreeNode = childNode.right;
                while (node.left) {
                    node = node.left;
                }
                node.left = childNode.left;
            } else {
                parentNode!.right = childNode.left;
                let node: TreeNode = childNode.left;
                while (node.right) {
                    node = node.right;
                }
                node.right = childNode.right;
            }
        } else {
            if (dir < 0) {
                parentNode!.left = childNode.left || childNode.right;
            } else {
                parentNode!.right = childNode.left || childNode.right
            }
        }
        if (!this.root) {
            this.root = parentNode!.left || parentNode!.right;
        }
    }
    deleteItem(item: Item | number) {
        if (typeof item === 'number') {
            item = { num: item };
        }
        let parentNode: TreeNode = null;
        let node = this.root;
        while (node) {
            let dir = itemCompare(node.item, item);
            if (dir === 0) {
                this._deleteItem(parentNode, node);
                this.size--;
                return;
            } else {
                parentNode = node;
                node = dir < 0 ? node.left : node.right;
            }
        }
        throw 'the item is not in tree';
    }
    show(): void {
        let data: ChartData = this.createChartData(this.root);
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
            if (this.getNodeHeight(node.left) - this.getNodeHeight(node.right) == 2) {
                if (itemCompare(node.left!.item, newNode!.item) < 0) {
                    console.log('left single rotation');
                    return this.singleRotate(node, -1);
                }
                console.log('left double rotation');
                return this.doubleRotate(node, -1);
            }
        } else if (dir > 0) {
            node.right = this._addItem(node.right, newNode);
            if (this.getNodeHeight(node.left) - this.getNodeHeight(node.right) == -2) {
                if (itemCompare(node.right!.item, newNode!.item) < 0) {
                    console.log('right double rotation')
                    return this.doubleRotate(node, 1);
                }
                console.log('right single rotation');
                return this.singleRotate(node, 1);
            }
        } else {
            console.warn('same item');
            this.size--;
        }
        node.height = Math.max(this.getNodeHeight(node.left), this.getNodeHeight(node.right)) + 1;
        return node;
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
    deleteItem(item: Item) {
        throw 'not implemented';
    }
}

class SplayTree extends BTree {
    constructor() {
        super();
    }
    find(item: Item | number) {
        if (typeof item === 'number') {
            item = { num: item };
        }
        let nodes: TreeNode[] = [this.root];
        let node: TreeNode = this.root;
        while (node) {
            let dir = itemCompare(node.item, item);
            if (dir === 0) {
                this.splay(nodes);
                return node.item.num;
            } else {
                if (dir < 0) {
                    node = node.left;
                } else {
                    node = node.right;
                }
                nodes.push(node);
            }
        }
    }
    private splay(nodes: TreeNode[]) {
        const zigzagRotate = (dir: number) => {
            if (!k4) {
                this.root = this.zigzigRotate(k3, k2, dir);
            } else if (k4.left === k3) {
                k4.left = this.zigzigRotate(k3, k2, dir);
            } else {
                k4.right = this.zigzigRotate(k3, k2, dir);
            }
        }
        const doubleRotate = (dir: number) => {
            if (!k4) {
                this.root = this.doubleRotate(k3, dir);
            } else if (k4.left === k3) {
                k4.left = this.doubleRotate(k3, dir);
            } else {
                k4.right = this.doubleRotate(k3, dir);
            }
        }
        while (true) {
            var k1: TreeNode = nodes[nodes.length - 1];
            var k2: TreeNode = nodes[nodes.length - 2];
            var k3: TreeNode = nodes[nodes.length - 3];
            var k4: TreeNode = nodes[nodes.length - 4];
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
            } else if (k3.left && k3.left.right === k1) {
                doubleRotate(-1);
            } else if (k3.right && k3.right.right === k1) {
                zigzagRotate(1);
            } else if (k3.right && k3.right.left === k1) {
                doubleRotate(1);
            }
            nodes.splice(nodes.length - 3, 2);
        }
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
    private zigzigRotate(k3: TreeNode, k2: TreeNode, dir: number): TreeNode {
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
    function addItem(num: number) {
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
    testcase.push(1)
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
