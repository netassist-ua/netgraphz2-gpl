var netgraphz = netgraphz || {};

netgraphz.tools = (function(){
	var module = {};

	module.extend = function (a, b, deep_extend) {
		var c = {}
		if( typeof b == "undefined" )
			return a;
		if(typeof deep_extend === "undefined"){
			deep_extend = false;
		}
		for (var key in a) {
			if (b.hasOwnProperty(key)){
				if(deep_extend && typeof b[key] === "object" && !Array.isArray(b[key])) {
					c[key] = module.extend(a[key], b[key], true);
				}
				else {
					c[key] = b[key];
				}
			}
			else {
				c[key] = a[key];
			}
		}
		return c;
	};


	/**
	 *  Formats data rate in bits per second to a human readable form
	 *  @param {Number} value Data date in bps
	 *  @returns {string} Formatted data rate string
	 */
	module.dataRateBpsFormat = function( value ){
		var prefixes = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
		var pow = Math.floor(Math.log10(value));
		var index = Math.floor(pow/3);
		var decimalPower = index * 3;	
		if( index >= prefixes.length ){
			index = prefixes.length - 1;
			decimalPower = (prefixes.length - 1) * 3;
		}
		return value / Math.pow(10, decimalPower) + ' ' + prefixes[index] + 'bps';
	};

	/**
	 * HSV to RGB color conversion
	 *
	 * H runs from 0 to 360 degrees
	 * S and V run from 0 to 100
	 * 
	 * Ported from the excellent java algorithm by Eugene Vishnevsky at:
	 * http://www.cs.rit.edu/~ncs/color/t_convert.html
	 */
	module.hsvToRgb = function(h, s, v) {
		var r, g, b;
		var i;
		var f, p, q, t;

		// Make sure our arguments stay in-range
		h = Math.max(0, Math.min(360, h));
		s = Math.max(0, Math.min(100, s));
		v = Math.max(0, Math.min(100, v));

		// We accept saturation and value arguments from 0 to 100 because that's
		// how Photoshop represents those values. Internally, however, the
		// saturation and value are calculated from a range of 0 to 1. We make
		// That conversion here.
		s /= 100;
		v /= 100;

		if(s == 0) {
			// Achromatic (grey)
			r = g = b = v;
			return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
		}

		h /= 60; // sector 0 to 5
		i = Math.floor(h);
		f = h - i; // factorial part of h
		p = v * (1 - s);
		q = v * (1 - s * f);
		t = v * (1 - s * (1 - f));

		switch(i) {
			case 0:
				r = v;
				g = t;
				b = p;
				break;

			case 1:
				r = q;
				g = v;
				b = p;
				break;

			case 2:
				r = p;
				g = v;
				b = t;
				break;

			case 3:
				r = p;
				g = q;
				b = v;
				break;

			case 4:
				r = t;
				g = p;
				b = v;
				break;

			default: // case 5:
				r = v;
				g = p;
				b = q;
		}

		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	};
	return module;
})();
