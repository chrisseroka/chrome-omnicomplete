'use strict';

if (chrome && chrome.runtime && chrome.runtime.onInstalled)
{
	chrome.runtime.onInstalled.addListener(function (details) {
		console.log('previousVersion', details.previousVersion);
	});

	console.log('\'Allo \'Allo! Event Page');
}

