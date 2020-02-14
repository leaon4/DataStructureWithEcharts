
declare const echarts: any;
const container = document.getElementById('mychart') as HTMLDivElement;
const myChart = echarts.init(container);

const option: any = {
    title: {
        text: 'Euler Circle'
    },
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
        {
            type: 'graph',
            layout: 'none',
            symbolSize: 50,
            // roam: true,
            draggable: true,
            itemStyle: {
                // color:'blue'
                // opacity: 0.5
            },
            label: {
                normal: {
                    show: true,
                    fontSize: 16,
                }
            },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 10],
            edgeLabel: {
                normal: {
                    textStyle: {
                        fontSize: 20
                    }
                }
            },
            lineStyle: {
                normal: {
                    opacity: 1,
                    width: 2,
                    curveness: 0,
                    color: 'grey'
                }
            }
        }
    ]
};

function createChartData(graph: Graph, map: number[][]) {
    let data = [];
    let nameIdx = 1;
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x]) {
                data.push({
                    name: 'v' + (nameIdx++),
                    x,
                    y
                });
            }
        }
    }
    let links: any = [];
    graph.forEach((edges: Edge[], source: number) => {
        edges.forEach((edge: Edge) => {
            links.push({
                // value: edge.distance,
                source,
                target: edge.lineTo,
                label: {
                    // show: true,
                    formatter: '{c}'
                },
            });
        });
    });
    return { data, links };
}
function createChartDataByAdjacent(adjacent: AdjacentList, map: number[][]) {
    let data = [];
    let nameIdx = 1;
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x]) {
                data.push({
                    name: 'v' + (nameIdx++),
                    x,
                    y,
                    itemStyle: {}
                });
            }
        }
    }
    let links: any = [];
    adjacent.forEach((vertex: DLinkedList<Edge>, source: number) => {
        let node: ListNode<Edge> = vertex.head;
        while (node) {
            links.push({
                // value: edge.distance,
                source,
                target: node.item.lineTo,
                label: {
                    // show: true,
                    formatter: '{c}'
                },
            });
            node = node.next;
        }
    });
    return { data, links };
}
/**************disJointSet************************/
class DisJointSet {
    collection: number[];
    constructor(public maxSize: number) {
        this.collection = new Array(maxSize).fill(-1);
    }
    find(index: number): number {
        if (this.collection[index] < 0) {
            return index;
        }
        return this.collection[index] = this.find(this.collection[index]);
    }
    isSame(index1: number, index2: number): boolean {
        return this.find(index1) === this.find(index2);
    }
    setUnion(index1: number, index2: number) {
        let a = this.find(index1);
        let b = this.find(index2);
        if (a === b) {
            return;
        }
        if (this.collection[a] < this.collection[b]) {
            this.collection[a] += this.collection[b];
            this.collection[b] = index1;
        } else {
            this.collection[b] += this.collection[a];
            this.collection[a] = index2;
        }
    }
    toArray(offset = 0): number[][] {
        let obj: {
            [key: string]: number[]
        } = {};
        for (let i = 0; i < this.maxSize; i++) {
            let parent = this.find(i);
            if (!obj[parent]) {
                obj[parent] = [i + offset];
            } else {
                obj[parent].push(i + offset);
            }
        }
        return Object.values(obj);
    }
}
/**************dlinkedList************************/
type ListNode<T> = {
    item: T;
    prev: ListNode<T>;
    next: ListNode<T>;
} | null;
class DLinkedList<T> {
    head: ListNode<T> = null;
    tail: ListNode<T> = null;
    constructor() { }
    createNode<T>(item: T): ListNode<T> {
        return {
            item,
            prev: null,
            next: null
        };
    }
    push(node: ListNode<T>) {
        if (!node) {
            return;
        }
        if (!this.tail) {
            this.head = node;
            this.tail = node;
            return;
        }
        this.tail.next = node;
        node.prev = this.tail;
        this.tail = node;
    }
    pop(): ListNode<T> {
        if (!this.tail) {
            return null;
        }
        let node = this.tail;
        if (!this.tail.prev) {
            this.head = this.tail = null;
        } else {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }
        return node;
    }
    shift(): ListNode<T> {
        if (!this.head) {
            return null;
        }
        let node = this.head;
        if (!this.head.next) {
            this.head = this.tail = null;
        } else {
            this.head = this.head.next;
            this.head.prev = null;
        }
        return node;
    }
    unshift(node: ListNode<T>) {
        if (!node) {
            return;
        }
        if (!this.head) {
            this.head = node;
            this.tail = node;
            return;
        }
        this.head.prev = node;
        node.next = this.head;
        this.head = node;
    }
    deleteNode(node: ListNode<T>) {
        if (!node) {
            return;
        }
        if (!node.prev) {
            this.shift();
        } else {
            node.prev.next = node.next;
            if (node.next) {
                node.next.prev = node.prev;
            }
        }
    }
    unionBefore(list: DLinkedList<T>, node: ListNode<T>) {
        if (!node || !list.tail) {
            return;
        }
        if (!node.prev) {
            this.head = list.head;
            list.tail.next = node;
        } else {
            node.prev.next = list.head;
            list.tail.next = node;
        }
    }
    insertAfter(prevNode: ListNode<T>, node: ListNode<T>) {
        if (!node) {
            return;
        }
        if (!prevNode) {
            this.head = this.tail = node;
            return;
        }
        node.next = prevNode.next;
        prevNode.next = node;
        node.prev = prevNode
        if (node.next) {
            node.next.prev = node;
        }
    }
    each(callback: (node: ListNode<T>, index?: number) => void) {
        let node = this.head;
        let index = 0;
        while (node) {
            callback(node, index++);
            node = node.next;
        }
    }
}
type Edge = {
    lineTo: number;
    revEdgeNode: ListNode<Edge>;
};
type Graph = Edge[][];
type AdjacentList = DLinkedList<Edge>[];

class EulerCircle {
    adjacent: AdjacentList;
    constructor(vertexCount: number, edges: number[][], type = 'double') {
        if (type === 'double') {
            this.adjacent = this.createAdjacentList(vertexCount, edges);
        } else {
            this.adjacent = this.createDirectionAdjList(vertexCount, edges);
        }
    }
    createDirectionAdjList(vertexCount: number, edges: number[][]): AdjacentList {
        let adjacent: AdjacentList = new Array(vertexCount);
        for (let i = 0; i < vertexCount; i++) {
            adjacent[i] = new DLinkedList<Edge>();
            edges[i].forEach((lineTo: number) => {
                let node = adjacent[i].createNode({
                    lineTo,
                    revEdgeNode: null
                });
                adjacent[i].push(node);
            });
        }
        return adjacent;
    }
    createAdjacentList(vertexCount: number, edges: number[][]): AdjacentList {
        let adjacent: AdjacentList = new Array(vertexCount);
        for (let i = 0; i < vertexCount; i++) {
            adjacent[i] = new DLinkedList<Edge>();
        }
        edges.forEach((edgeArr) => {
            let edge: Edge = {
                lineTo: edgeArr[1],
                revEdgeNode: null
            };
            let revEdge: Edge = {
                lineTo: edgeArr[0],
                revEdgeNode: null
            };
            let node = adjacent[edgeArr[0]].createNode(edge);
            let revNode = adjacent[edgeArr[1]].createNode(revEdge);
            edge.revEdgeNode = revNode;
            revEdge.revEdgeNode = node;
            adjacent[edgeArr[0]].push(node);
            adjacent[edgeArr[1]].push(revNode);
        });
        return adjacent;
    }
    show() {
        let chartData: any = createChartDataByAdjacent(this.adjacent, vertexPositionMap);
        option.series[0].data = chartData.data;
        option.series[0].links = chartData.links;
        myChart.setOption(option);
    }
    findEulerPath(): DLinkedList<number> {
        let branchs: number[] = [];
        for (let i = 0; i < this.adjacent.length; i++) {
            let count = 0;
            this.adjacent[i].each(() => count++);
            if (count % 2 !== 0) {
                branchs.push(i);
            }
        }
        if (branchs.length !== 0 && branchs.length !== 2) {
            throw 'The graph has not Euler-Circle or Euler-path!';
        }
        return this.findEulerCircle(branchs[0] || ~~(Math.random() * this.adjacent.length));
    }
    findEulerCircle(start = 0): DLinkedList<number> {
        let path = new DLinkedList<number>();
        const dfs = (vertexIdx: number, prevNode: ListNode<number>) => {
            let pathNode = path.createNode(vertexIdx);
            path.insertAfter(prevNode, pathNode);
            let list = this.adjacent[vertexIdx];
            let node: ListNode<Edge>;
            while (node = list.shift()) {
                let revList = this.adjacent[node.item.lineTo];
                revList.deleteNode(node.item.revEdgeNode);
                dfs(node.item.lineTo, pathNode);
            }
        };
        dfs(start, null);
        return path;
    }
    findStrongConnectedBranch2() {
        let records: { path: number, inCollection: boolean }[] = new Array(this.adjacent.length);
        for (let i = 0; i < records.length; i++) {
            records[i] = {
                path: -2,
                inCollection: false
            };
        }
        const setTrue = (from: number) => {
            let record = records[from];
            if (from < 0 || records[from].inCollection) {
                return;
            }
            record.inCollection = true;
            setTrue(record.path);
        }
        const dfs = (vertexIdx: number, from: number) => {
            let record = records[vertexIdx];
            if (record.path > -2) {
                setTrue(from);
                records[vertexIdx].inCollection = false;
                return;
            }
            record.path = from;
            let list = this.adjacent[vertexIdx];
            let node: ListNode<Edge> = list.head;
            while (node) {
                dfs(node.item.lineTo, vertexIdx);
                node = node.next;
            }
            if (!record.inCollection) {
                record.path = -2;
            }
        };
        /*
         * dfs(5,-1)会有bug。实在不想看了，就这样吧
        */
        dfs(5, -1);
        console.log(records);
        console.log(recordsToArray());
        function recordsToArray(): number[][] {
            let obj: any = {};
            for (let i = 0; i < records.length; i++) {
                let parent = find(i);
                if (!obj[parent]) {
                    obj[parent] = [i + 1];
                } else {
                    obj[parent].push(i + 1);
                }
            }
            return Object.values(obj);
        }
        function find(i: number): number {
            if (records[i].path < 0) {
                return i;
            }
            return records[i].path = find(records[i].path);
        }
    }
    findStrongConnectedBranch() {
        /* 
         * 1.没有对没dfs到的点做处理                done
         * 2.indexOf优化点
         * 3.对全path做setUnion可以优化
         * testcase[3] dfs(2,0)也有bug
         */
        let dset = new DisJointSet(this.adjacent.length);
        let path: number[] = new Array(this.adjacent.length);
        let count = 0;
        let visited: boolean[] = new Array(this.adjacent.length).fill(false);
        const dfs = (vertexIdx: number, pathIdx: number) => {
            visited[vertexIdx] = true;
            let idx = path.indexOf(vertexIdx + 1);
            if (idx > -1) {
                if (idx < pathIdx) {
                    let arr = path.slice(idx, pathIdx);
                    for (let i = 1; i < arr.length; i++) {
                        dset.setUnion(arr[0] - 1, arr[i] - 1);
                    }
                }
                return;
            }
            path[pathIdx] = vertexIdx + 1;
            let list = this.adjacent[vertexIdx];
            let node: ListNode<Edge> = list.head;
            while (node && count++ < 1000) {
                dfs(node.item.lineTo, pathIdx + 1);
                node = node.next;
            }
        }
        for (let i = 0; i < this.adjacent.length; i++) {
            if (!visited[i]) {
                dfs(i, 0);
            }
        }
        console.log(dset);
        console.log(dset.toArray(1));
    }
}
let vertexPositionMap: number[][];
let testcases = [
    {
        vertexPositionMap: [
            [0, 0, 0, 1, 0, 0, 0],
            [1, 0, 1, 0, 1, 0, 1],
            [0, 1, 0, 1, 0, 0, 0],
            [1, 0, 1, 0, 1, 0, 1],
            [0, 0, 0, 1, 0, 0, 0],
        ],
        edges: [[0, 2], [0, 3], [1, 2], [1, 7], [2, 3], [2, 5], [2, 6], [2, 8], [3, 4], [3, 6], [3, 9], [3, 10], [4, 9], [5, 8], [6, 8], [6, 9], [7, 8], [8, 9], [8, 11], [9, 11], [9, 10]],
        vertexNum: 12
    },
    {
        vertexPositionMap: [
            [0, 1, 0],
            [1, 0, 1],
            [0, 1, 0],
            [1, 0, 1],
            [0, 1, 0],
        ],
        edges: [
            [0, 1],
            [0, 2],
            [1, 2],
            [1, 3],
            [1, 4],
            [2, 3],
            [2, 5],
            [3, 4],
            [3, 5],
            [4, 5],
            [4, 6],
            [5, 6]
        ],
        vertexNum: 7
    },
    {
        vertexPositionMap: [
            [0, 1, 0],
            [1, 0, 1],
            [0, 1, 0],
            [1, 0, 1],
        ],
        edges: [
            [0, 1],
            [0, 2],
            [1, 2],
            [1, 3],
            [1, 4],
            [2, 3],
            [2, 5],
            [3, 4],
            [3, 5],
            [4, 5],
        ],
        vertexNum: 6
    },
    {
        vertexPositionMap: [
            [1, 1, 0, 1, 0],
            [1, 1, 1, 0, 1],
            [1, 0, 1, 1, 0]
        ],
        edgeType: 'single',
        edges: [
            [4],
            [0],
            [],
            [0, 4],
            [1, 5],
            [1, 2, 6],
            [2, 9],
            [3, 4],
            [6],
            [8],
        ],
        vertexNum: 10
    },
    {
        vertexPositionMap: [
            [0, 1, 0, 1, 0],
            [1, 0, 1, 0, 1],
            [0, 1, 0, 1, 0]
        ],
        edgeType: 'single',
        edges: [
            [1, 3, 4],
            [4],
            [0, 3],
            [4, 5],
            [5, 6],
            [2, 6],
            []
        ],
        vertexNum: 7
    }
];

let euler: EulerCircle;
(function () {
    let testcaseIdx = 0;
    let tc = testcases[testcaseIdx];
    vertexPositionMap = tc.vertexPositionMap;
    euler = new EulerCircle(tc.vertexNum, tc.edges, tc.edgeType);
})();
euler.show();
euler.findStrongConnectedBranch();

function* showPathAnimation() {
    let path = euler.findEulerPath();
    (function () {
        let node = path.head;
        let arr = [];
        while (node) {
            arr.push(node.item + 1);
            node = node.next;
        }
        console.log(arr);
    })();
    option.series[0].edgeSymbol = ['circle', 'arrow'];
    option.series[0].itemStyle.opacity = 0.5;
    euler.show();
    let node = path.head;
    while (node) {
        option.series[0].data[node.item].itemStyle.opacity = 1;
        if (node.prev) {
            option.series[0].links.push({
                source: node.prev.item,
                target: node.item
            });
        } else {
            option.series[0].data[node.item].itemStyle.color = 'darkred';
            option.series[0].data[node.item].emphasis = {};
        }
        myChart.setOption(option);
        node = node.next;
        yield;
    }
}
let gen = showPathAnimation();
function showPath() {
    let result = gen.next();
    setTimeout(() => {
        if (!result.done) {
            showPath();
        }
    }, 600);
}
