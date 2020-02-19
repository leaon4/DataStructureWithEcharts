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
    prev: NullNode;
    leftChild: NullNode;
    nextSibling: NullNode;
};

type HeapNode = {
    item: Item;
    prev: NullNode;
    leftChild: NullNode;
    nextSibling: NullNode;
} | NullNode;

const NULLNODE: NullNode = {
    item: { num: -Infinity },
    prev: undefined,
    leftChild: undefined,
    nextSibling: undefined
} as unknown as NullNode;
NULLNODE.prev = NULLNODE.leftChild = NULLNODE.nextSibling = NULLNODE;


function itemCompare(item1: Item, item2: Item): number {
    return item1.num - item2.num;
}


class PairHeap {
    root: HeapNode;
    constructor() {
        this.root = NULLNODE;
    }
    createNode(item: Item): HeapNode {
        return {
            item,
            prev: NULLNODE,
            leftChild: NULLNODE,
            nextSibling: NULLNODE
        };
    }
    private createChartData(node: HeapNode): ChartData[] | undefined {
        if (node === NULLNODE) {
            return;
        }
        let chartData: ChartData[] = [];
        while (node !== NULLNODE) {
            let data: ChartData = {
                name: '' + node.item.num,
                children: this.createChartData(node.leftChild)
            };
            chartData.push(data);
            node = node.nextSibling;
        }
        return chartData;
    }
    show(): void {
        let data: ChartData[] | undefined = this.createChartData(this.root);
        option.series[0].data = [{ name: 'root', label: { borderWidth: 0 }, children: data }];
        myChart.setOption(option);
    }
    /* node1.nextSibling会被重置，所以使用前应保证node1.nextSibling不再需要 */
    link(node1: HeapNode, node2: HeapNode): HeapNode {
        if (node1 === NULLNODE) {
            return node1;
        }
        if (node2 === NULLNODE) {
            return node1;
        }
        if (itemCompare(node1.item, node2.item) < 0) {
            // 重置node1.nextSibling, node2.prev
            node1.nextSibling = node2.nextSibling;
            node1.nextSibling.prev = node1;
            node2.nextSibling = node1.leftChild;
            node2.nextSibling.prev = node2;
            node1.leftChild = node2;
            node2.prev = node1;
            return node1;
        }
        // 重置node1.nextSibling, node1.prev
        node1.nextSibling = node2.leftChild;
        node1.nextSibling.prev = node1;
        node2.leftChild = node1;
        node1.prev = node2;
        return node2;
    }
    insert(item: Item): HeapNode {
        let node = this.createNode(item);
        if (this.root === NULLNODE) {
            this.root = node;
        } else {
            this.root = this.link(this.root, node);
        }
        return node;
    }
    decreaseKey(node: HeapNode, delta: number) {
        if (delta < 0) {
            throw 'DecreaseKey called with negative Delta';
        }
        node.item.num -= delta;
        if (this.root === node) {
            return;
        }
        node.nextSibling.prev = node.prev;
        if (node.prev.leftChild === node) {
            node.prev.leftChild = node.nextSibling;
        } else {
            node.prev.nextSibling = node.nextSibling;
        }
        node.nextSibling = NULLNODE;
        this.root = this.link(node, this.root);
    }
    deleteMin(): Item | undefined {
        if (this.root === NULLNODE) {
            return;
        }
        let item = this.root.item;
        this.root = this.combineSiblings(this.root.leftChild);
        // this.root = this.combineSiblingsSingleWay(this.root.leftChild);
        this.root.prev = NULLNODE;
        return item;
    }
    combineSiblingsSingleWay(node: HeapNode): HeapNode {
        // let sibling: HeapNode;
        // while ((sibling = node.nextSibling) !== NULLNODE) {
        //     /* 此行代码删除不影响正确性。node.nextSibling会在link()中被重置为正确值 */
        //     node.nextSibling = NULLNODE;

        //     /* 此行代码删除暂未发现会影响正确性，唯一会让根节点的prev不指向NULLNODE */
        //     /* 表面上也没有问题，只是会造成对已删除的元素没有解引用。但也只需在deleteMin里重置一次便可 */
        //     sibling.prev = NULLNODE;
        //     node = this.link(node, sibling);
        // }
        // return node;

        /* 因此以上代码可简化为 */
        while (node.nextSibling !== NULLNODE) {
            node = this.link(node, node.nextSibling);
        }
        return node;
    }
    combineSiblings(node: HeapNode) {
        if (node.nextSibling === NULLNODE) {
            return node;
        }
        let nodes: HeapNode[] = [];
        while (node !== NULLNODE) {
            nodes.push(node = this.link(node, node.nextSibling));
            node = node.nextSibling;
        }
        for (let i = nodes.length - 1; i > 0; i--) {
            nodes[i - 1] = this.link(nodes[i - 1], nodes[i]);
        }
        return nodes[0];
    }
}

let heap = new PairHeap();

// let testcase = [2, 6, 3, 4, 5, 9, 7, 10, 13, 8, 11, 15, 14, 12, 17, 19, 16, 18].reverse();
let testcase: number[] = [];
for (let i = 0; i < 20; i++) {
    testcase.push(~~(Math.random() * 100));
    // testcase.push(i);
}
for (let num of testcase) {
    heap.insert({ num });
}
heap.show();

let idx = 0
function insertToTree() {
    if (idx < testcase.length) {
        heap.insert({ num: testcase[idx++] });
        heap.show();
    }
}
function deleteMin() {
    console.log(heap.deleteMin());
    heap.show();
}