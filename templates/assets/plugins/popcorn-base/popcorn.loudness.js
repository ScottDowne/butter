// PLUGIN: style

(function (Popcorn) {

	"use strict";

	var originalVolume, instancesRunning = 0;

	Popcorn.basePlugin('loudness', function (options, base) {
		var popcorn = base.popcorn;
		base.animate('volume', function (val) {
			if (!instancesRunning) {
				originalVolume = popcorn.volume();
			}
			if (!popcorn.muted()) {
				popcorn.volume(val * originalVolume);
			}
		});

		return {
			start: function() {
				if (!instancesRunning) {
					originalVolume = popcorn.volume();
				}
				instancesRunning++;
			},
			end: function() {
				instancesRunning--;
				if (!instancesRunning) {
					popcorn.volume(originalVolume);
				}
			}
		};
	}, {
		about: {
			name: 'Popcorn Loudness Plugin',
			version: '0.1',
			author: 'Brian Chirls, @bchirls',
			website: 'http://github.com/brianchirls'
		},
		displayName: "Volume",
		options: {
			start: {
				elem: "input",
				type: "text",
				label: "In",
				units: "seconds"
			},
			end: {
				elem: "input",
				type: "text",
				label: "Out",
				units: "seconds"
			},
			volume: {
				elem: "input",
				type: "number",
				label: "Volume (0 - 1)",
				'default': 1,
				min: 0,
				max: 1
			}

		}
	});
}(Popcorn));
