import { getBits } from './helpers'

// let consoleCount = 0

/**
 * cotree color quantization
 * https://zhuanlan.zhihu.com/p/220177037
 */
export default class Quantizer {
  constructor () {
    this.tree = new TreeNode()
    this.tree.level = -1
    this.levelNodes = new Array(8).fill(0).map(() => {
      return []
    })
  }

  // max color nums-- a slot for transparant color, a slot for background color
  maxColor = 254

  // color count
  colorCount = 0

  // tree
  tree: TreeNode

  // level nodes
  levelNodes: Array<Array<TreeNode | null>>

  // add color
  addColor (r: number, g: number, b: number) {
    let parentNode = this.tree

    for (let i = 7; i >= 0; i--) {
      const idx = (getBits(r, i, 1) << 2) + (getBits(g, i, 1) << 1) + getBits(b, i, 1)

      let node = parentNode.nodes[idx]

      // create node
      if (!node) {
        parentNode.nodes[idx] = new TreeNode()
        node = parentNode.nodes[idx]
        node.level = 7 - i
        node.parent = parentNode
        parentNode.nodesCount++
        node.idxInLevelNodes = this.levelNodes[node.level].length
        this.levelNodes[node.level].push(node)

        // last level, color count + 1
        if (node.level === 7) {
          this.colorCount++
        }
      }

      node.count++
      node.redSum += r
      node.greenSum += g
      node.blueSum += b

      if (node.isLeaf) {
        break
      }

      if (node.level === 7) {
        node.isLeaf = true
      }

      parentNode = node
    }

    // check max color count
    if (this.colorCount > this.maxColor) {
      this.reduceColor()
    }
  }

  // get color--get transformed color
  getColor (r: number, g: number, b: number): Array<number> {
    let parentNode = this.tree
    const color = [0, 0, 0, 1]
    for (let i = 7; i >= 0; i--) {
      const idx = (getBits(r, i, 1) << 2) + (getBits(g, i, 1) << 1) + getBits(b, i, 1)

      const node = parentNode.nodes[idx]

      if (!node) {
        break
      }

      if (node.isLeaf) {
        color[0] = (node.redSum / node.count) >> 0
        color[1] = (node.greenSum / node.count) >> 0
        color[2] = (node.blueSum / node.count) >> 0
        break
      }

      parentNode = node
    }
    return color
  }

  // reduce color
  private reduceColor () {
    /**
     * 1. node has two sub nodes at least
     * 2. if there are nodes in same level match 1., choose the one has less pixels
     * 3. set the node as leaf node, color value is (redSum, greenSum, blueSum) / count
     * 4. delete sub nodes
     */
    let targetNode = null
    let minCount = Number.MAX_SAFE_INTEGER

    // from bottom to top, there are all leaf nodes in level 7, skip
    for (let i = 6; i >= 0; i--) {
      const nodes = this.levelNodes[i]
      for (let idx = 0, len = nodes.length; idx < len; idx++) {
        if (nodes[idx]) {
          const node = nodes[idx] as TreeNode
          if (!node.isLeaf && node.nodesCount > 1 && node.count < minCount) {
            targetNode = node
            minCount = node.count
          }
        }
      }
      if (targetNode) {
        break
      }
    }

    // delete sub nodes
    if (targetNode) {
      this.deleteSubNodes(targetNode)
    }
  }

  // delete sub nodes
  private deleteSubNodes (targetNode: TreeNode) {
    for (let i = 0, len = targetNode.nodes.length; i < len; i++) {
      const node = targetNode.nodes[i]
      if (node) {
        if (!node.isLeaf) {
          this.deleteSubNodes(node)
        }
        this.levelNodes[node.level][node.idxInLevelNodes] = null
      }
    }

    this.colorCount -= targetNode.nodesCount - 1

    targetNode.nodes = []
    targetNode.nodesCount = 0

    targetNode.isLeaf = true
  }
}

export class TreeNode {
  constructor () {
    this.isLeaf = false
    this.level = 0
    this.count = 0
    this.redSum = 0
    this.greenSum = 0
    this.blueSum = 0
    this.parent = null
    this.nodes = []
    this.nodesCount = 0
    this.idxInLevelNodes = 0
  }
  // is leaf node ?
  isLeaf: boolean
  // level
  level: number
  // color count
  count: number
  // red count
  redSum: number
  // green count
  greenSum: number
  // blue count
  blueSum: number
  // parent node
  parent: TreeNode | null
  // nodes
  nodes: Array<TreeNode>
  // nodes count
  nodesCount: number
  // idx in level nodes
  idxInLevelNodes: number
}
