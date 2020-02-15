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
type NullNode = {
    item: Item;
    left: NullNode;
    right: NullNode;
    priority?: number;
};
type TreeNode = {
    item: Item;
    left: TreeNode;
    right: TreeNode;
    priority?: number;
} | NullNode;

function itemCompare(item1: Item, item2: Item): number {
    return item1.num - item2.num;
}


class BTree {
    size: number;
    root: TreeNode;
    protected readonly nullNode: NullNode;
    constructor() {
        this.size = 0;
        this.nullNode = this.createNode({ num: Infinity });
        this.nullNode.left = this.nullNode.right = this.nullNode;
        this.root = this.nullNode;
    }
    protected createNode(item: Item): TreeNode {
        return {
            item,
            left: this.nullNode,
            right: this.nullNode
        };
    }
    addItem(item: Item): void {
        let newNode = this.createNode(item);
        this.root = this._addItem(this.root, newNode);
        this.size++;
    }
    protected _addItem(node: TreeNode, newNode: TreeNode): TreeNode {
        if (node === this.nullNode) {
            return newNode;
        }
        let dir: number = itemCompare(newNode!.item, node.item);
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
    traverseByLevel(callback: (node: TreeNode, ...args: any) => any) {
        if (this.root === this.nullNode) {
            return;
        }
        let arr: TreeNode[] = [this.root];
        for (let i = 0; i < arr.length; i++) {
            callback(arr[i]);
            if (arr[i].left !== this.nullNode) {
                arr.push(arr[i].left)
            }
            if (arr[i].right !== this.nullNode) {
                arr.push(arr[i].right);
            }
        }
    }
    private createChartData(node: TreeNode): ChartData {
        if (node === this.nullNode) {
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

class Treap extends BTree {
    constructor() {
        super();
        this.nullNode.priority = 255;
    }
    createNode(item: Item): TreeNode {
        let node = super.createNode(item);
        node.priority = ~~(Math.random() * 255);
        return node;
    }
    insert(item: Item) {
        this.size++;
        this.root = this._insert(item, this.root);
    }
    private singleRotateWithLeft(node: TreeNode) {
        let tempNode = node.left;
        node.left = tempNode.right;
        tempNode.right = node;
        return tempNode;
    }
    private singleRotateWithRight(node: TreeNode) {
        let tempNode = node.right;
        node.right = tempNode.left;
        tempNode.left = node;
        return tempNode;
    }
    private _insert(item: Item, node: TreeNode): TreeNode {
        if (node === this.nullNode) {
            return this.createNode(item);
        }
        if (itemCompare(item, node.item) < 0) {
            node.left = this._insert(item, node.left);
            if ((node.left.priority as number) < (node.priority as number)) {
                node = this.singleRotateWithLeft(node);
            }
        } else {
            node.right = this._insert(item, node.right);
            if ((node.right.priority as number) < (node.priority as number)) {
                node = this.singleRotateWithRight(node);
            }
        }
        return node;
    }
    delete(item: Item) {
        if (this.root === this.nullNode) {
            return;
        }
        this.size--;
        this.root = this._delete(item, this.root);
    }
    private _delete(item: Item, node: TreeNode): TreeNode {
        if (node !== this.nullNode) {
            if (itemCompare(item, node.item) < 0) {
                node.left = this._delete(item, node.left);
            } else if (itemCompare(item, node.item) > 0) {
                node.right = this._delete(item, node.right);
            } else {
                if ((node.left.priority as number) < (node.right.priority as number)) {
                    node = this.singleRotateWithLeft(node);
                    // 只要左priority小于右priority，左子节点绝不可能是nullNode
                    node.right = this._delete(item, node.right);
                } else {
                    node = this.singleRotateWithRight(node);
                    if (node !== this.nullNode) {
                        node.left = this._delete(item, node.left);
                    } else {
                        node.left = this.nullNode;
                    }
                }
            }
        }
        return node;
    }
}

const tree = new Treap();

let testcase: number[] = [];
for (let i = 0; i < 60; i++) {
    testcase.push(~~(Math.random() * 100));
    // testcase.push(i);
}

for (let num of testcase) {
    tree.insert({ num });
}


tree.show()

let idx = 0
function insertToTree() {
    tree.insert({ num: testcase[idx++] });
    tree.show();
}

function deleteRoot(){
    tree.delete(tree.root.item);
    tree.show();
}