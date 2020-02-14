"use strict";
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = "red";
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
    }
    draw(color) {
        if (color) {
            ctx.save();
            ctx.fillStyle = color;
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        if (color) {
            ctx.restore();
        }
    }
    lineTo(p) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.closePath();
    }
}
;
function generatePoints(num) {
    const maxWidth = 1000;
    const maxHeight = 600;
    return Array.from({ length: num }).map(() => {
        let point = new Point(~~(Math.random() * maxWidth), ~~(Math.random() * maxHeight));
        point.draw();
        return point;
    });
}
function nearestPoints(points) {
    points.sort((a, b) => a.x - b.x);
    return _find(points, 0, points.length - 1);
    function _find(points, left, right) {
        /*
         * 甚至可以直接处理只有一个的情形，再由合并minC的部分处理其他。代码更大简化
         * 当然性能应该是稍差一点点
         */
        if (left === right) {
            return {
                points: [],
                distance: Infinity
            };
        }
        let center = ~~((left + right) / 2);
        let minL = _find(points, left, center);
        let minR = _find(points, center + 1, right);
        let min = minL.distance < minR.distance ? minL : minR;
        let stripPoints = points.slice(left, right + 1).filter((p) => {
            return p.x >= points[center].x - min.distance
                && p.x <= points[center].x + min.distance;
        });
        for (let i = 0; i < stripPoints.length - 1; i++) {
            for (let j = i + 1; j < stripPoints.length; j++) {
                let a = stripPoints[i], b = stripPoints[j];
                let dis = getDistance(a, b);
                if (dis < min.distance) {
                    min = {
                        points: [a, b],
                        distance: dis
                    };
                }
            }
        }
        return min;
    }
    function getDistance(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
}
/*
 * 使用书上的y坐标预排序算法。80000个点以上才有优势
 */
function nearestPointsOptimize(points) {
    let initYSortPoints = points.slice(0).sort((a, b) => a.y - b.y);
    points.sort((a, b) => a.x - b.x);
    return _find(points, 0, points.length - 1, initYSortPoints);
    function _find(points, left, right, ySortPoints) {
        if (left === right) {
            return {
                points: [],
                distance: Infinity
            };
        }
        if (left + 1 === right) {
            return {
                points: [points[left], points[right]],
                distance: getDistance(points[left], points[right])
            };
        }
        let center = ~~((left + right) / 2);
        let ll = [], lr = [];
        for (let i = 0; i < ySortPoints.length; i++) {
            if (ySortPoints[i].x <= points[center].x) {
                ll.push(ySortPoints[i]);
            }
            else {
                lr.push(ySortPoints[i]);
            }
        }
        let minL = _find(points, left, center, ll);
        let minR = _find(points, center + 1, right, lr);
        let min = minL.distance < minR.distance ? minL : minR;
        let stripPoints = ySortPoints.filter(p => {
            return p.x >= points[center].x - min.distance
                && p.x <= points[center].x + min.distance;
        });
        for (let i = 0; i < stripPoints.length - 1; i++) {
            for (let j = i + 1; j < stripPoints.length; j++) {
                let a = stripPoints[i], b = stripPoints[j];
                if (Math.abs(a.y - b.y) > min.distance) {
                    break;
                }
                let dis = getDistance(a, b);
                if (dis < min.distance) {
                    min = {
                        points: [a, b],
                        distance: dis
                    };
                }
            }
        }
        return min;
    }
    function getDistance(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
}
let points = generatePoints(20);
console.time('nearestPoints');
let minStantard = nearestPoints(points);
console.timeEnd('nearestPoints');
console.time('nearestPointsOptimize');
let min = nearestPointsOptimize(points);
console.timeEnd('nearestPointsOptimize');
if (minStantard.distance !== min.distance) {
    console.warn(minStantard, min);
}
min.points.forEach(p => {
    p.draw('green');
});
min.points[0].lineTo(min.points[1]);
console.log(min.distance);
//# sourceMappingURL=nearestPoints.js.map