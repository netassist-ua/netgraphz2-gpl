
/*

	NetGraphz2 node.js data access library
	Entry point

	Exports graph connection prototype and link/nodes tool functions

*/


module.exports = {
		tools: {
			nodes: require('./lib/node-tools'),
			links: require('./lib/link-tools')
		},
		connection: require('./lib/connection')
};
