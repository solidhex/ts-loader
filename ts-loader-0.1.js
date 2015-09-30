"use strict";

var Telescope = Telescope || {};

(function () {
	
	Telescope.Loader = function (options) {
		
		options = options || {};
		
		var xhrObject = new XMLHttpRequest(),
			domain = options.domain,
			container = options.params.container,
			manifestUrl = domain + '/manifest.json';
		
		xhrObject.open('GET', manifestUrl, true);
		xhrObject.send();
				
		xhrObject.onreadystatechange = function () {
			if (xhrObject.readyState === 4 && xhrObject.status === 200) {
				var files = JSON.parse(xhrObject.responseText);
				files = files.source_files;
				writeCssFile(files.stylesheets);
				writeJsFile(files.javascript, container, domain, options.namespace);
			}
		}
		
		function writeJsFile(scripts, target, domain, namespace) {
			if (scripts.constructor === Array) {
				for (var i = 0; i < scripts.length; i++) {
					if (scripts[i].url.indexOf('app') !== -1) {
						var script_src = scripts[i].url,
							script_ref = document.createElement('script');
					
						script_ref.setAttribute('src', domain + '/' +  script_src);	
						// work around since the DOM still has no insertAfter method
						target.parentNode.insertBefore(script_ref, target.nextSibling);
						
						script_ref.addEventListener('load', function (event) {
							console.log('event', event);
							parseNamespacedFunction(namespace)(options.params);
						});
						
						/**
						 *  Below is specifically for IE - yes, even v10 O_o
						 */
						
						script_ref.onreadystatechange = function () {
							
							if (this.readyState === 'complete') {
								parseNamespacedFunction(namespace)(options.params);
							}
						}
					}
				}
			}
		}
		
		function writeCssFile(stylesheets) {
			// take the first style sheet and use it
			options['params']['cssUrl'] = domain + '/' + stylesheets.shift().url;
		}
		
		function parseNamespacedFunction(namespace) {
			return [window].concat(namespace.split('.')).reduce(function (prev, curr) {
				return prev[curr];
			});
		}
	};
		
})();