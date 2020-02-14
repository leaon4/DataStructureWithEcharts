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
    return item1.num - item2.num;
}


class BinaryTree {
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
        if (dir > 0) {
            node.left = this._addItem(node.left, newNode);
        } else if (dir < 0) {
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

class TopSplayTree extends BinaryTree {
    leftMax: TreeNode = null;
    rightMin: TreeNode = null;
    header!: BinaryTree;
    constructor() {
        super();
    }
    private initHeader() {
        this.header = new BinaryTree();
        this.header.addItem({ num: NaN });
        this.leftMax = this.rightMin = this.header.root;
    }
    private singleRotationWithLeft(node: TreeNode) {
        let tempNode = node!.left;
        node!.left = tempNode!.right;
        tempNode!.right = node;
        return tempNode;
    }
    private singleRotationWithRight(node: TreeNode) {
        let tempNode = node!.right;
        node!.right = tempNode!.left;
        tempNode!.left = node;
        return tempNode;
    }
    private splay(item: Item, node: TreeNode): TreeNode {
        this.initHeader();
        let comp: number;
        while ((comp = itemCompare(item, node!.item)) !== 0) {
            if (comp < 0) {
                if (!node!.left) {
                    break;
                }
                if (itemCompare(item, node!.left.item) < 0) {
                    node = this.singleRotationWithLeft(node);
                }
                if (!node!.left) {
                    break;
                }
                this.rightMin!.left = node;
                this.rightMin = node;
                node = node!.left;
            } else {
                if (!node!.right) {
                    break;
                }
                if (itemCompare(item, node!.right.item) > 0) {
                    node = this.singleRotationWithRight(node);
                }
                if (!node!.right) {
                    break;
                }
                this.leftMax!.right = node;
                this.leftMax = node;
                node = node!.right;
            }
        }
        this.leftMax!.right = node!.left;
        this.rightMin!.left = node!.right;
        node!.left = this.header.root!.right;
        node!.right = this.header.root!.left;
        return node;
    }
    find(item: Item): Item | undefined {
        if (!this.root) {
            return undefined;
        }
        let node = this.splay(item, this.root);
        this.root = node;
        if (itemCompare(item, node!.item) !== 0) {
            return undefined;
        }
        return node!.item;
    }
    insert(item: Item) {
        if (!this.root) {
            this.addItem(item);
            return;
        }
        let node = this.splay(item, this.root);
        let newNode = this.createNode(item);
        if (itemCompare(item, node!.item) < 0) {
            newNode!.left = node!.left;
            newNode!.right = node;
            node!.left = null;
        } else {
            newNode!.right = node!.right;
            newNode!.left = node;
            node!.right = null;
        }
        this.root = newNode;
        this.size++;
    }
    delete(item: Item): boolean {
        if (!this.root) {
            return false;
        }
        let node = this.splay(item, this.root);
        if (itemCompare(item, node!.item) !== 0) {
            this.root = node;
            return false;
        }
        this.size--;
        if (!node!.left) {
            this.root = node!.right;
        } else {
            let rightNode = node!.right;
            node = node!.left;
            node = this.splay(item, node);
            if (node!.right) {
                console.error('has right');
            }
            node!.right = rightNode;
            this.root = node;
        }
        return true;
    }
}
let testcase = [12, 5, 25, 30, 20, 24, 15, 13, 18, 16, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
testcase = testcase.concat(testcase);
let tree = new TopSplayTree();
tree.show();
function* test1() {
    for (let num of testcase) {
        console.log(num)
        tree.insert({ num });
        tree.show();
        yield;
    }
}
function* test2() {
    testcase = testcase.reverse();
    for (let num of testcase) {
        console.log(num)
        tree.delete({ num });
        tree.show();
        yield;
    }
}
let gen1 = test1();
let gen2 = test2();
function insertToTree() {
    gen1.next();
}
function deleteFromTree() {
    gen2.next();
}