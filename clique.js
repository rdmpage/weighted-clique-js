var Graph = require("graphlib").Graph;

var PriorityQueue = require('priorityqueuejs');

var Clique = function () {};

//----------------------------------------------------------------------------------------
function clean_string(str) {

	str = str.toLowerCase();
	str = str.replace(/\./g, '');
	str = str.replace(/\s\s+/g, ' ');

	return str;
}

//----------------------------------------------------------------------------------------
// Take list of strings and build graph
function make_graph(input) {
	var g = new Graph( { directed: false });

	// add strings to graph
	for (var i in input) {
		g.setNode(input[i], { weight: 0 });
	}

	// compute pairwise distances and add as edges
	var n = input.length;
	for (var i = 0; i < n; i++) {
		for (var j = i+1; j < n; j++) {
			var str1 = input[i];
			var str2 = input[j];
		
			str1 = clean_string(str1);
			str2 = clean_string(str2);
		
			var str_short = str1;
			var str_long = str2;
		
			var parts1 = str1.split(' ');
			var parts2 = str2.split(' ');
		
			if (parts1.length > parts2.length) {
				parts1 = str2.split(' ');
				parts2 = str1.split(' ');
			
				str_short = str2;
				str_long = str1;
			}
		
			var threshold = parts1.length;
		
			var pattern = '';
		
			for (var k in parts1) {
				var pat = parts1[k];
			
				if (pat.length > 1) {
					pat = pat.charAt(0);
				}	
		
				pattern += '(' + pat + '\\w*)?\\s*';
			}
			//pattern = pattern.replace(/\s+$/, '');
		
			result = str_long.match(RegExp(pattern));
		
			var count = 0;
			var num_matches = result.length;
			for (var k = 1; k < num_matches; k++) {
				if (result[k]) {
					count++;
				}
			}

			var score = 0;
			var ok = true;
			if (count >= threshold) {
			
				for (var k = 0; k < count; k++) {
					var s1 = parts1[k];
					var s2 = parts2[k];
				
					if (
						(s1.indexOf(s2) !== -1)
						|| (s2.indexOf(s1) !== -1)
						) {
						score++;
					
						if (s1 === s2) {
							if (s1.length > 1 ) {
								score += 0.1;
							}
						}				
					
					} else {
						ok = false;
					}
				}
			}	
		
			if (ok && score > 0) {
				g.setEdge(input[i], input[j], { weight: score});
			}
		}
	}
		



	return g;
}


//----------------------------------------------------------------------------------------
function graph_to_dot(g) {
	// display graph
	var dot = 'graph {' + "\n";

	g.nodes().forEach(function(v) {
		dot += '"' + v + '";' + "\n";
	});

	g.edges().forEach(function(v) {
		dot += '"' + v.v + '" -- "' + v.w + '" [label="' + g.edge(v).weight + '"];' + "\n";
	 });
	 dot += '}';

  return dot;
}

//----------------------------------------------------------------------------------------
function find_cliques(g) {
	// Hold the final clusters
	var C = [];

	// 1. Sort edges in entire graph by maximum edge weight
	var queue = new PriorityQueue(function(a, b) {
	  return g.edge(a).weight - g.edge(b).weight;
	});

	// add edges to queue
	g.edges().forEach(function(v) {
		queue.enq(v);
	});
	
	var skiplist = [];	
	var node_weight = [];

	while (1)
	{	
		//------------------------------------------------------------------------------------------
		// Take "heaviest" node by arbitrarily picking one of the two nodes attached to the
		//  heaviest edge
		var e = queue.peek();
		var a = e.v;
		var b = e.w;
		
		while (
			((skiplist.indexOf(a) != -1) || skiplist.indexOf(b) != -1) 
			&& queue.size() > 0
			) {
			e = queue.deq();
			a = e.v;
			b = e.w;
		}
	
		if (queue.size() == 0) {
			break;
		}

		// Node a forms the starting cluster
		var cluster = [];
	
		// Ensure a has higher degree than b (to avoid being locally trapped)
		if (g.nodeEdges(a).length > g.nodeEdges(b).length)
		{
			a = b;
		}
		cluster.push(a);
	
		var growing = true;
		
		//------------------------------------------------------------------------------------------
		// Try to grow our clique
		while (growing)
		{	
			//--------------------------------------------------------------------------------------
			// Find candidates to join the cluster, namely nodes connected to every node in the
			// cluster. Use a priority queue to ensure that candidates are sorted by edge weight.

			var nq = new PriorityQueue(function(a, b) {
			  return g.node(a).weight - g.node(b).weight;
			});
				
			g.nodeEdges(a).forEach(function(v) {
			
				var node = v.v;
				if (node == a) {
					node = v.w;
				}
			
				// Ignore nodes already in the cluster
				if (cluster.indexOf(node) == -1) {

					// node is not in cluster, so take a look					
					var max_weight = 0.0;
				
					// Is node connected to all members of the existing cluster?
					var count = 0;
					for (var i in cluster) {
						// do we have an edge between node 
						if (g.hasEdge(node, cluster[i])) {
							max_weight = Math.max(max_weight, g.edge(node, cluster[i]).weight);
							count++;
						}
					}
					// Store maximum weight of any edge between v and the cluster
					// (we use this to order the candidate nodes)
					// node_weight[v] = max_weight;
					g.node(node).weight = max_weight;
									
					// v is connected to every node in the cluster, so it is a candidate
					if (count == cluster.length)
						nq.enq(node);
					}				
			});
		
			//--------------------------------------------------------------------------------------
			// OK, now we have a list of nodes that are connected to every member of our current cluster
			// but which may also be connected to nodes outside the cluster. This list is sorted
			// by weight of the heaviest edge connecting a given node to the cluster
			growing = false;
		
			while ((nq.size() > 0) && !growing) 
			{
				var candidate = nq.deq();
			
				//----------------------------------------------------------------------------------
				// Store neighbours of candidate node in a priority queue
				var pq = new PriorityQueue(function(a, b) {
					return g.edge(a).weight - g.edge(b).weight;
					});
		
				g.nodeEdges(candidate).forEach(function(v) {
					var node = v.v;
					if (node == candidate) {
						node = v.w;
					}
				
					pq.enq(v);				
				});
			
			
				//----------------------------------------------------------------------------------
				// If the top n neighbours are all connected to the n members of the cluster, then 
				// we can extend clique. Once we do this then we need to start again as the cluster
				// has now grown, and not all of the original candidates may be connected to the new 
				// cluster.
				var weight		= 0;		// weight of current edge
				var last_weight	= weight;	// weight of last edge looked at
				var count			= 0;		// count of nodes examined
				var found			= 0;		// count nodes that linked to cluster
			
				var neighbour_count = pq.size();
			
				// For each neighbour go down list of edges (heaviest to lightest) until
				// we have encountered all edges linking node to the cluster.
				while (pq.size() > 0 && (count == found)) {
					count++;
				
					var x = pq.deq();
				
					last_weight = g.edge(x).weight;
				
					var n1 = x.v;
					var n2 = x.w;
				
					if (n1 != candidate) {
						n2 = n1;
						n1 = candidate;
					}
				
					if (skiplist.indexOf(n1) == -1) {
						// Is n2 in the current cluster?
						if (cluster.indexOf(n2) == -1) {
							// No
						} else {
							// Yes
							found++;
							weight = g.edge(x).weight;
						}
					} else {
						// Ignore candidate if it is already in a previously
						// found cluster
					}
				}
			
				// If found < cluster size then while going down the list 
				// we've encountered a heavy node that isn't connected
				// to the cluster, and hence candidate can't be added to cluster
				if (found == cluster.length)
				{
					// We have found all the edges linked to the cluster in the top edges linked to 
					// the candidate.				
					var growing = false;
					if (weight > last_weight) {
						// All the heaviest edges are those linking the candidate to the cluster
						growing = true;
					} else { if ((weight == last_weight) && (neighbour_count == cluster.length) ) {
						// Handle case where all candidate's edges are linked to the cluster
						growing = true;
						}
					}		
				
					if (growing) {
						cluster.push(candidate);
						console.log("add " + candidate + " to cluster");
					}
				} else {
					console.log(candidate + " connected to heavy edges not in cluster");
				}				
			}			
		}
		
		C.push(cluster);
		
		for (var i in cluster) {
			skiplist.push(cluster[i]);
		}
	
		queue.deq();
	
		if (queue.size() == 0) {
			break;
		}
	}

	// add singletons
	g.nodes().forEach(function(v) {
		if (skiplist.indexOf(v) == -1) {
			var singleton = [];
			singleton.push(v);
			C.push(singleton);
		}
	});
	
	return C;
}



Clique.prototype.find = function(input) { 
	var result = {};
  
  var g = make_graph(input);
	var C = find_cliques(g);
  
  result.clusters = C;
  result.dot = graph_to_dot(g);
 
  return result;
}

module.exports = Clique;