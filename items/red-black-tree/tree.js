"use strict";
const myChart = echarts.init(document.getElementById('mychart'));
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
            top: '8%',
            bottom: '20%',
            symbol: 'emptyCircle',
            orient: 'vertical',
            expandAndCollapse: false,
            lineStyle: {
                curveness: 0,
            },
            initialTreeDepth: -1,
            // symbolSize: 10,
            label: {
                position: 'top',
                align: 'middle',
                fontSize: 18,
                color: 'white',
                // borderWidth: 2,
                // borderColor: '#b03a5b',
                borderRadius: 100,
                width: 32,
                height: 32,
                lineHeight: 34,
                rich: {}
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
var Color;
(function (Color) {
    Color[Color["Red"] = 0] = "Red";
    Color[Color["Black"] = 1] = "Black";
})(Color || (Color = {}));
;
function itemCompare(item1, item2) {
    return item1.num - item2.num;
}
class RedBlackTree {
    constructor() {
        this.nullNode = {
            item: {
                num: Infinity
            },
            left: undefined,
            right: undefined,
            color: Color.Black
        };
        this.nullNode.left = this.nullNode.right = this.nullNode;
        let item = { num: -Infinity };
        this.root = this.createNode(item, Color.Black);
    }
    createNode(item, color) {
        return {
            item,
            left: this.nullNode,
            right: this.nullNode,
            color
        };
    }
    createChartData(node) {
        if (node === this.nullNode) {
            return { name: '' };
        }
        let data = {
            name: '' + node.item.num,
            label: {
                // backgroundColor: node.color === Color.Red ? '#b03a5b' : 'black'
                backgroundColor: node.color === Color.Red ? '#c23531' : '#222'
            },
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
        option.series[0].data = [{ name: 'root', label: { borderWidth: 0 }, children: [data.children[1] || ''] }];
        myChart.setOption(option);
    }
    _reverse(node) {
        if (node === this.nullNode) {
            return;
        }
        this._reverse(node.left);
        this._reverse(node.right);
        let temp = node.left;
        node.left = node.right;
        node.right = temp;
    }
    reverse() {
        this._reverse(this.root.right);
    }
    singleRotateWithLeft(node) {
        let tempNode = node.left;
        node.left = tempNode.right;
        tempNode.right = node;
        return tempNode;
    }
    singleRotateWithRight(node) {
        let tempNode = node.right;
        node.right = tempNode.left;
        tempNode.left = node;
        return tempNode;
    }
    rotate(item, parent) {
        let dir = itemCompare(item, parent.item) < 0 ? 'left' : 'right';
        return parent[dir] = itemCompare(item, parent[dir].item) < 0
            ? this.singleRotateWithLeft(parent[dir])
            : this.singleRotateWithRight(parent[dir]);
    }
    handleReorient(item, [GGP, GP, P, X]) {
        X.color = Color.Red;
        X.left.color = X.right.color = Color.Black;
        if (P.color === Color.Red) {
            GP.color = Color.Red;
            if (itemCompare(item, P.item) < 0 !== itemCompare(item, GP.item) < 0) {
                this.rotate(item, GP);
            }
            this.rotate(item, GGP).color = Color.Black;
        }
        this.root.right.color = Color.Black;
    }
    insert(item) {
        // G: grand, P: parent, X: currentNode
        let [GGP, GP, P, X] = [this.root, this.root, this.root, this.root];
        while (this.nullNode !== X) {
            GGP = GP;
            GP = P;
            P = X;
            X = itemCompare(item, X.item) < 0 ? X.left : X.right;
            if (X.left.color === Color.Red && X.right.color === Color.Red) {
                this.handleReorient(item, [GGP, GP, P, X]);
            }
        }
        X = this.createNode(item, Color.Red);
        itemCompare(item, P.item) < 0 ? (P.left = X) : (P.right = X);
        this.handleReorient(item, [GGP, GP, P, X]);
    }
    find(item) {
        this.nullNode.item = item;
        let comp;
        let [P, X] = [this.root, this.root];
        while ((comp = itemCompare(item, X.item)) !== 0) {
            P = X;
            if (comp < 0) {
                X = X.left;
            }
            else {
                X = X.right;
            }
        }
        if (X === this.nullNode) {
            return undefined;
        }
        return { P, X, dir: P.left === X ? 'left' : 'right' };
    }
    /* 调试函数 */
    dye(num, color) {
        let pair = this.find({ num });
        if (!pair) {
            return;
        }
        pair.X.color = color;
        this.show();
    }
    /* 调试函数 */
    singleRotate(num, dir) {
        let pair = this.find({ num });
        if (!pair) {
            return;
        }
        if (dir === 'left') {
            pair.P[pair.dir] = this.singleRotateWithLeft(pair.X);
        }
        else {
            pair.P[pair.dir] = this.singleRotateWithRight(pair.X);
        }
        this.show();
        return pair;
    }
    /* 调试函数 */
    doubleRotate(num, dir) {
        let pair = this.singleRotate(num, dir);
        if (!pair) {
            return;
        }
        this.singleRotate(pair.P.item.num, pair.dir);
    }
    deleteMin() {
        const delMinReorient = () => {
            if (X.left.color === Color.Red || X.color === Color.Red) {
                return;
            }
            if (X.right.color === Color.Red) {
                if (P.left === X) {
                    P.left = this.singleRotateWithRight(X);
                    GP = P;
                    P = GP.left;
                    T = P.right;
                    X = P.left;
                }
                else {
                    P.right = this.singleRotateWithRight(X);
                    GP = P;
                    P = GP.right;
                    T = P.right;
                    X = P.left;
                }
                GP.color = X.color = Color.Red;
                P.color = T.color = Color.Black;
            }
            else if (T.left.color === Color.Red || T.right.color === Color.Red) {
                if (T.right.color !== Color.Red) {
                    P.right = this.singleRotateWithLeft(T);
                }
                if (GP.left === P) {
                    GP.left = P = this.singleRotateWithRight(P);
                }
                else {
                    GP.right = P = this.singleRotateWithRight(P);
                }
                GP = P;
                P = GP.left;
                T = GP.right;
                GP.color = X.color = Color.Red;
                P.color = T.color = Color.Black;
            }
            else {
                // all children black
                P.color = Color.Black;
                X.color = T.color = Color.Red;
            }
        };
        let [GP, P, X, T] = [this.root, this.root, this.root.right, this.root.left];
        if (X.left.color === Color.Black && X.right.color === Color.Black) {
            X.color = Color.Red;
        }
        while (X !== this.nullNode) {
            delMinReorient();
            GP = P;
            P = X;
            X = X.left;
            T = P.right;
        }
        if (GP.left === P) {
            GP.left = this.nullNode;
        }
        else {
            GP.right = this.nullNode;
        }
        this.root.color = this.root.right.color = Color.Black;
    }
    deleteMax() {
        const delMaxReorient = () => {
            if (X.right.color === Color.Red || X.color === Color.Red) {
                return;
            }
            if (X.left.color === Color.Red) {
                P.right = this.singleRotateWithLeft(X);
                GP = P;
                P = GP.right;
                T = P.left;
                X = P.right;
                GP.color = X.color = Color.Red;
                P.color = T.color = Color.Black;
            }
            else if (T.left.color === Color.Red || T.right.color === Color.Red) {
                if (T.left.color !== Color.Red) {
                    P.left = this.singleRotateWithRight(T);
                }
                GP.right = P = this.singleRotateWithLeft(P);
                GP = P;
                P = GP.right;
                T = GP.left;
                GP.color = X.color = Color.Red;
                P.color = T.color = Color.Black;
            }
            else {
                // all children black
                P.color = Color.Black;
                X.color = T.color = Color.Red;
            }
        };
        let [GP, P, X, T] = [this.root, this.root, this.root.right, this.root.left];
        if (X.left.color === Color.Black && X.right.color === Color.Black) {
            X.color = Color.Red;
        }
        while (X !== this.nullNode) {
            delMaxReorient();
            GP = P;
            P = X;
            X = X.right;
            T = P.left;
        }
        if (GP.left === P) {
            GP.left = this.nullNode;
        }
        else {
            GP.right = this.nullNode;
        }
        this.root.color = this.root.right.color = Color.Black;
    }
    rotateOfDelete(node, parent, comp) {
        let dir = parent.left === node ? 'left' : 'right';
        return parent[dir] = comp < 0
            ? this.singleRotateWithRight(parent[dir])
            : this.singleRotateWithLeft(parent[dir]);
    }
    delete(item) {
        const handleX = () => {
            if (X.color === Color.Red
                || comp < 0 && X.left.color === Color.Red
                || comp >= 0 && X.right.color === Color.Red) {
                return;
            }
            GP = P;
            P = this.rotateOfDelete(X, P, comp);
            T = comp < 0 ? P.right : P.left;
            GP.color = X.color = Color.Red;
            P.color = T.color = Color.Black;
        };
        const handleT = () => {
            if (P.left === T) {
                if (T.left.color !== Color.Red) {
                    P.left = this.rotateOfDelete(T, P, -1);
                }
                GP = this.rotateOfDelete(P, GP, 1);
                T = GP.left;
            }
            else {
                if (T.right.color !== Color.Red) {
                    P.right = this.rotateOfDelete(T, P, 1);
                }
                GP = this.rotateOfDelete(P, GP, -1);
                T = GP.right;
            }
            GP.color = X.color = Color.Red;
            P.color = T.color = Color.Black;
        };
        // T: sibling
        let [GP, P, X, T] = [this.root, this.root, this.root.right, this.root.left];
        if (X.left.color === Color.Black && X.right.color === Color.Black) {
            X.color = Color.Red;
        }
        let comp = 1;
        let delNode = this.nullNode;
        while (X !== this.nullNode) {
            comp = itemCompare(item, X.item);
            if (X.color === Color.Red
                || X.left.color === Color.Red
                || X.right.color === Color.Red) {
                handleX();
            }
            else if (T.left.color === Color.Black && T.right.color === Color.Black) {
                P.color = Color.Black;
                X.color = T.color = Color.Red;
            }
            else {
                handleT();
            }
            GP = P;
            P = X;
            if (comp < 0) {
                X = X.left;
                T = P.right;
            }
            else {
                if (comp === 0) {
                    delNode = X;
                }
                X = X.right;
                T = P.left;
            }
        }
        this.root.color = this.root.right.color = Color.Black;
        if (delNode === this.nullNode) {
            return undefined;
        }
        let delItem = delNode.item;
        delNode.item = P.item;
        if (GP.left === P) {
            GP.left = this.nullNode;
        }
        else {
            GP.right = this.nullNode;
        }
        return delItem;
    }
}
const tree = new RedBlackTree();
const testcase = [];
for (let i = 0; i < 70; i++) {
    testcase.push(~~(Math.random() * 100));
}
const insertToTree = (() => {
    let gen = (function* () {
        for (let num of testcase) {
            tree.insert({ num });
            tree.show();
            yield;
        }
    }());
    return () => gen.next();
})();
function deleteMin() {
    tree.deleteMin();
    tree.show();
}
function deleteMax() {
    tree.deleteMax();
    tree.show();
}
const deleteFromTree = (() => {
    let gen = (function* () {
        let arr = testcase.slice();
        arr.sort((a, b) => Math.random() - 0.5);
        for (let num of arr) {
            tree.delete({ num });
            tree.show();
            yield;
        }
    })();
    return () => gen.next();
})();
myChart.on('click', 'series', (params) => {
    if (params.data && params.data.name) {
        let item = {
            num: +params.data.name
        };
        tree.delete(item);
        tree.show();
    }
});
function reverse() {
    tree.reverse();
    tree.show();
}
//# sourceMappingURL=tree.js.map