'use strict';

module.exports = function(RED) {

    function MergeNodeTopic(n) {
        RED.nodes.createNode(this, n);
        const node = this;
        this.timer = Number(n.timeout || 0)*1000;
	this.msglimit = Number(n.msglimit || 0);
        let ctx = [];

        const completeSend = function(topic) {
		
            node.send({
                payload: ctx[topic].payload,
				topic: topic
            });

            clearTimeout(ctx[topic].timeout);
            ctx[topic] = {};
        }

        this.on("input", function(msg) {
            try {
			
		if (msg.topic==undefined) msg.topic="";
		if (ctx[msg.topic]==undefined) ctx[msg.topic] = {}
				
                if (!Array.isArray(ctx[msg.topic].payload)) {
                    ctx[msg.topic].payload = [];
                }

                ctx[msg.topic].payload.push(msg);
		    
                if (ctx[msg.topic].timeout) {
                    clearTimeout(ctx[msg.topic].timeout);
                }

		// reached limit
		if (node.msglimit != 0 && (ctx[msg.topic].payload.length>=node.msglimit)) {
			completeSend(msg.topic);
		} else {
		// program timer for next loop
		    	ctx[msg.topic].timeout = setTimeout(function() {
			    completeSend(msg.topic);
			}, node.timer);
		}
            }
            catch (err) {
                console.log(err.stack);
            }
        });

        this.on("close", function() {
            
			for (topic in ctx)  {
				clearTimeout(ctx[topic].timeout);
				ctx[topic] = {};
			}
        });
    }
    RED.nodes.registerType("mergeTopic", MergeNodeTopic);
}
