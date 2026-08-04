class TextToNode {
    constructor() {
        this.ranges = [];
    }

    addTextToNodeRange(start, end, node) {
        let range = {
            start: start,
            end: end,
            node: node
        }
        this.ranges.push(range);
    }

    getNodeAtIdx(idx) {
        let rangeAtIdx = this._getNodeAtIdx(idx, this.ranges);
        return rangeAtIdx.node;
    }

    getNextIdx(idx) {
        let rangeAtIdx = this._getNodeAtIdx(idx, this.ranges);
        return rangeAtIdx.end;
    }

    getPrevIdx(idx) {
        let rangeAtIdx = this._getNodeAtIdx(idx, this.ranges);
        return rangeAtIdx.start - 1;
    }

    /**
     * O(lgn) time complexity text to node find
     * @param {index of character to find node for} idx 
     * @param {array of ranges to check} ranges 
     */
    _getNodeAtIdx(idx, ranges) {
        if(ranges.length == 1) {
            if(idx < ranges[0].end){
                return ranges[0]
            } else {
                throw new Error(`No node at specified position ${idx}`);
            }
        } else if(idx > ranges[Math.floor(ranges.length/2)].start) {
            return this._getNodeAtIdx(idx, ranges.slice(Math.floor(ranges.length/2), ranges.length));
        } else if(idx == ranges[Math.floor(ranges.length/2)].start) {
            return ranges[Math.floor(ranges.length/2)];
        } else {
            return this._getNodeAtIdx(idx, ranges.slice(0, Math.floor(ranges.length/2)));
        }
    }

    reset() {
        this.ranges = [];
    }
}