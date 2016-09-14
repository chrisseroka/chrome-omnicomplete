'use strict';

function debug() {
	var enabled = true;

	var text = arguments[0];
    text = text.replace('{0}', arguments[1])
		       .replace('{1}', arguments[2])
		       .replace('{2}', arguments[3])
		       .replace('{3}', arguments[4])
		       .replace('{4}', arguments[5])
		       .replace('{5}', arguments[6])
		       .replace('{6}', arguments[7])
	if (enabled)
	{
		console.log(text);
	}

}

function getChromeBookmarks(callback)
{
	var result = [];
	var gtr = chrome.bookmarks.getTree(function(items){
		console.log('gt inside');
		result = items;
		console.log('inside l: ' + items.length);
		callback(items);
	});
	console.log('gt outside ' +result.length);
	getChromeTabs(function(x){
		console.log(x);
	});
	return result;
}

function getChromeTabs(callback){
	chrome.tabs.query({}, function(chromeTabs){
		callback(chromeTabs);
	});
}

function getActiveTabs(chromeTabs){
	return chromeTabs.map(function(item){
		return {path: [item.title], tabId: item.id, url: item.url};
	});
}

function getBookmarks(chromeBookmarks)
{
	var walkTree = function walkTree(bookmark, currentItem, results){
		debug('walkTree, bookmark id: {0}, title: {1}', bookmark.id, bookmark.title);
		var currentItemCopy = JSON.parse(JSON.stringify(currentItem));
		if (bookmark.url) {
			currentItemCopy.url = bookmark.url;
			results.push(currentItemCopy);
		}
		else if (!bookmark.url && bookmark.children){
			bookmark.children.forEach(function(item){
				currentItemCopy = JSON.parse(JSON.stringify(currentItem));
				if (item.id != 0 //bookmarks root
					&& item.id != 1 //title: "bookmarks bar"
					&& item.id != 2) { // title: "other bookmarks"
					currentItemCopy.path.push(item.title);
				}
				walkTree(item, currentItemCopy, results);
			});
		}
	};
	var result = [];
	chromeBookmarks.forEach(function(item){
		walkTree(item, {path:[]}, result);
	})

	return result;
}

function mergeTabsWithBookmarks(tabs, bookmarks){
	var additionalBookmarks = [];
	tabs.forEach(function(tab){
		var foundBookmark = bookmarks.find(function(item){
			debug('comparing {0} with {1}', item.url, tab.url);
			return item.url == tab.url;
		});
		if (foundBookmark){
			debug('found bookmark in tabs: ' + foundBookmark.path);
			foundBookmark = JSON.parse(JSON.stringify(foundBookmark));
			foundBookmark.tabId = tab.id;
			additionalBookmarks.push(foundBookmark);
		}
		else {
			debug('not found bookmark');
		}
	});
	return additionalBookmarks.concat(tabs).concat(bookmarks);
}

function searchBookmarks(bookmarks, phrase) {
	debug('running searchBookmarks with phrase: {0}', phrase);
	var result = [];

	bookmarks.forEach(function(bookmark){
		var phraseCursor = 0;
		bookmark = JSON.parse(JSON.stringify(bookmark));
		for(var i=0; i < bookmark.path.length; i++){
			var part = bookmark.path[i];
			var partCursor = 0;
			partCursor = 0;
			if (i == bookmark.path.length - 1){
				var remainingPhrase = phrase.substring(phraseCursor).toLowerCase();
				var index = part.toLowerCase().indexOf(remainingPhrase);
				if (remainingPhrase.length && index != -1){
					var endIndex = index + remainingPhrase.length;
					var first = part.slice(0, index);
					var second = part.slice(index, endIndex);
					var third = part.slice(endIndex, part.length);
					part = first + '```' + second + '```' + third;
					bookmark.path[i] = part;
					result.push(bookmark);
				}
				else if (!remainingPhrase.length){
					result.push(bookmark);
				}
			}
			else {
				var isFoundInPart = false;
				var match = '';
				while(part.toLowerCase()[partCursor] == phrase.toLowerCase()[phraseCursor]){
					if (isFoundInPart == false){
						match = '```';
						isFoundInPart = true;
					}
					match += part[partCursor];
					partCursor++;
					phraseCursor++;
				}

				if (partCursor > 0){
					match += '```';
				}
				match = match + part.substring(partCursor);
				bookmark.path[i] = match;
			}
		}
	});
	debug("searchBookmarks result: {0}", JSON.stringify(result));
	return result;
}

function renderBookmark(bookmark){
	var templateFolder = '<span class="b-f">{{content}}</span>';
	var templateHighlightStart = '<span class="b-highlight">';
	var templateHighlightEnd = '</span>';
	var templateFolderSeparator = ' / ';
	var template = '<div class="bookmark">{{folders}} / <span class="b-n" title="{{url}}">{{title}}</span></div>';

	var path = bookmark.path.map(function(item){
		return item.replace('```', templateHighlightStart)
			       .replace('```', templateHighlightEnd);
	});

	var folders = path.slice(0, path.length - 1).map(function(item){
		return templateFolder.replace(/{{content}}/gi, item);
	});
	var foldersString = folders.join(templateFolderSeparator);
	var title = path[path.length - 1];
	var result = template
		.replace(/{{folders}}/gi, foldersString)
		.replace(/{{url}}/gi, bookmark.url)
		.replace(/{{title}}/gi, title);
	return result;

}

function forTesting() {
	return 'tested';
}

function chromeOmnicompleteOnSearching(phrase, listBox, callback) {
	var chromeBookmarks = getChromeBookmarks(function(chromeBookmarks){
		var bookmarks = getBookmarks(chromeBookmarks);
		getChromeTabs(function(chromeTabs){
			var tabs = getActiveTabs(chromeTabs);
			var tabsAndBookmarks = tabs.concat(bookmarks);

			var found = searchBookmarks(tabsAndBookmarks, phrase);
			var foundAsHtml = found.map(function(item){
				return renderBookmark(item);
			});
			var html = foundAsHtml.join();
			callback(html, found);
			listBox.reset(found);
		});
	});
}

function BookmarksListBox(){
	var self = this;
	self.currentIndex = 0;
	self.bookmarks = [];
	self.listboxDiv = null;

	self.init = function(){
		document.getElementById('chrome-omnicomplete-input').addEventListener('keydown', function(e){
			self.processKey(e);
		});
		self.listboxDiv = document.getElementById('chrome-omnicomplete-listbox');
	}

	self.reset = function(bookmarks){
		self.currentIndex = 0;
		self.bookmarks = bookmarks;
		if (self.bookmarks.length>0){
			self.markSelection(0);
		}
	}

	self.processKey = function(e){
		var keyCode = e.keyCode;
		if (keyCode == 40) {//down
			self.currentIndex++;
		}
		else if (keyCode == 38) {//down
			self.currentIndex--;
		}
		else if (keyCode == 13) {//down
			var bookmark = self.bookmarks[self.currentIndex];
			var url = bookmark.url;
			console.log('openning page: ' + url);
			if (bookmark.tabId){
				chrome.tabs.update(bookmark.tabId, {selected: true});
			}
			else {
				chrome.tabs.create({url: url});
			}
		}

		if (self.currentIndex >= self.bookmarks.length - 1){
			self.currentIndex = self.bookmarks.length - 1;
		}
		else if (self.currentIndex < 0){
			self.currentIndex = 0;
		}

		self.markSelection(self.currentIndex);
	}

	self.markSelection = function (index){

		var alreadySelected = self.listboxDiv.getElementsByClassName('selected');
		if (alreadySelected.length>0){
				alreadySelected[0].className = alreadySelected[0].className.replace('selected', '');
		}
		var bookmarks = self.listboxDiv.getElementsByClassName('bookmark');
		if (bookmarks.length > 0){
			bookmarks[index].className += ' selected';
		}
	}

	self.init();
} 

if (document && document.getElementById('chrome-omnicomplete-input')){
	var listBox = new BookmarksListBox();
	document.getElementById('chrome-omnicomplete-input').addEventListener('input', function(){
		var phrase = document.getElementById('chrome-omnicomplete-input').value;
		chromeOmnicompleteOnSearching(phrase, listBox, function(html){
			var listbox = document.getElementById('chrome-omnicomplete-listbox');
			listbox.innerHTML = html;
		});
	});
}