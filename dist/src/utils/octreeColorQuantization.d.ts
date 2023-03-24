/**
 * cotree color quantization
 * https://zhuanlan.zhihu.com/p/220177037
 */
export default class Quantizer {
    constructor();
    maxColor: number;
    colorCount: number;
    tree: TreeNode;
    levelNodes: Array<Array<TreeNode | null>>;
    addColor(r: number, g: number, b: number): void;
    getColor(r: number, g: number, b: number): Array<number>;
    private reduceColor;
    private deleteSubNodes;
}
export declare class TreeNode {
    constructor();
    isLeaf: boolean;
    level: number;
    count: number;
    redSum: number;
    greenSum: number;
    blueSum: number;
    parent: TreeNode | null;
    nodes: Array<TreeNode>;
    nodesCount: number;
    idxInLevelNodes: number;
}
