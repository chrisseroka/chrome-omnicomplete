'use strict';

window.data = {};

if (chrome && chrome.runtime && chrome.runtime.onInstalled)
{
	chrome.runtime.onInstalled.addListener(function (details) {
		console.log('previousVersion', details.previousVersion);
	});

	chrome.tabs.onActivated.addListener(function(activeInfo){
		console.log('activating :' + JSON.stringify(activeInfo));
		var tabId = activeInfo.tabId;
		window.data[tabId] = (window.data[tabId] || {});
		window.data[tabId].lastActivated = new Date().valueOf();
		console.log('data: ' + JSON.stringify(window.data));
	});

	console.log('\'Allo \'Allo! Event Page');
}

