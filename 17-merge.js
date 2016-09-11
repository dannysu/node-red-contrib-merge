'use strict';

module.exports = function(RED) {

    function MergeNode(n) {
        RED.nodes.createNode(this, n);
        const node = this;
        this.timer = Number(n.timeout || 0)*1000;
        let ctx = {};

        const completeSend = function() {
            node.send({
                payload: ctx.payload
            });

            clearTimeout(ctx.timeout);
            ctx = {};
        }

        this.on("input", function(msg) {
            try {
                if (!Array.isArray(ctx.payload)) {
                    ctx.payload = [];
                    ctx.timeout = setTimeout(function() {
                        completeSend();
                    }, node.timer);
                }

                ctx.payload.push(msg);
            }
            catch (err) {
                console.log(err.stack);
            }
        });

        this.on("close", function() {
            clearTimeout(ctx.timeout);
            ctx = {};
        });
    }
    RED.nodes.registerType("merge", MergeNode);
}
