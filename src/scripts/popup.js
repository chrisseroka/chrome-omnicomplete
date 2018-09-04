'use strict';

function debug() {
	var enabled = false;

	var text = arguments[0].toString();
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
		debug('gt inside');
		result = items;
		debug('inside l: ' + items.length);
		callback(items);
	});
	debug('gt outside ' +result.length);
	getChromeTabs(function(x){
		debug(x);
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
			foundBookmark.tabId = tab.tabId;
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

   function partitionizePath(path){
      var parents = [];
      var result = [];
      var pathIndex = 0;
      path.forEach(function(pathMember){
         var parts = partitionizePart(pathIndex++, pathMember);
         parts.forEach(function(part){
            result.push(part);
         });
      });
      return result;
   }

   function partitionizePart(pathIndex, pathPart) {
      return pathPart.split(' ').map(function(x){
         return { value: x + ' ', index: pathIndex };
      });
   }

   function mergeResult(parts){
      var result = [];
      var current = parts[0].index;
      var tmp = '';
      parts.forEach(function(x){ 
         if (x.index == current) {
            tmp += x.value;
         }
         else {
            result.push(tmp.trim());
            tmp = x.value;
            current = x.index;
         }
      });
      result.push(tmp.trim());
      return result;
   }

   function searchPart(phrase, part){
      var partCursor = 0;
      var phraseCursor = 0;
      var match = '';
      var isFoundInPart = false;
      var partValue = part.value;
      while(partCursor < partValue.length && phraseCursor < phrase.length && partValue.toLowerCase()[partCursor] == phrase.toLowerCase()[phraseCursor]){
         if (isFoundInPart == false){
            match = '```';
            isFoundInPart = true;
         }
         match += partValue[partCursor];
         partCursor++;
         phraseCursor++;
      }

      if (partCursor > 0){
         match += '```';
      }
      match = match + partValue.substring(partCursor);
      part.value = match;
      return phrase.substring(phraseCursor);
   }

	bookmarks.forEach(function(bookmark){
      var tmpDistinctCheck = '';
      function pushResult(result, item, sortOrder){
         //replace adjacent highlights
         var path = item.path.join('###').replace(/``````/g, '');
         item.sortPhrase = sortOrder + path;
         if (tmpDistinctCheck == '')
         {
            tmpDistinctCheck = path;
            result.push(item);
         }
         else if (tmpDistinctCheck != path)
         {
            result.push(item);
         }
      }

	   //------- Version 1: Checking parts of folders + parts of bookmark name
      var bookmark2 = JSON.parse(JSON.stringify(bookmark));
      var partitions = partitionizePath(bookmark2.path);
      var subpartIndex = 0;
		var sortOrder = 0;
      var remainingPhrase = phrase;
      while(subpartIndex < partitions.length && remainingPhrase.length > 0)
      {
         var subpart = partitions[subpartIndex];
         var newRemainingPhrase = searchPart(remainingPhrase, subpart);
         if (remainingPhrase != newRemainingPhrase)
         {
            sortOrder++;
         }
         remainingPhrase = newRemainingPhrase;
         subpartIndex++;
      }
      if (remainingPhrase.length == 0)
      {
         bookmark2.path = mergeResult(partitions);
         pushResult(result, bookmark2, sortOrder);
      }

      //----- Version 2: Checking parts of folders + bookmark name contains
		var phraseCursor = 0;
		sortOrder = 1;
		bookmark = JSON.parse(JSON.stringify(bookmark));
		for(var i=0; i < bookmark.path.length; i++){
		   sortOrder = i;
			var part = bookmark.path[i];
			var partCursor = 0;
			partCursor = 0;
			if (i == bookmark.path.length - 1){
				var remainingPhrase = phrase.substring(phraseCursor).toLowerCase();
				if (!remainingPhrase.length){
               pushResult(result, bookmark, sortOrder);
				}
            else {
               var index = part.toLowerCase().indexOf(remainingPhrase);
               if (remainingPhrase.length && index != -1){
                  var endIndex = index + remainingPhrase.length;
                  var first = part.slice(0, index);
                  var second = part.slice(index, endIndex);
                  var third = part.slice(endIndex, part.length);
                  part = first + '```' + second + '```' + third;
                  bookmark.path[i] = part;
                  pushResult(result, bookmark, sortOrder);
               }
            }
			}
			else {
				var isFoundInPart = false;
				var match = '';
				while(partCursor < part.length && phraseCursor < phrase.length && part.toLowerCase()[partCursor] == phrase.toLowerCase()[phraseCursor]){
					if (isFoundInPart == false){
						match = '```';
						isFoundInPart = true;
						sortOrder++;
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
	var templateFolderSeparator = '';
	var template = '<div class="bookmark{{tabtype}}"><span class="icon"></span>{{folders}}<span class="b-n" title="{{url}}">{{title}}</span></div>';
	var tabtype = '';

	function insertHighlight(item) {
	   var isStart = true;
	   while(/```/.test(item)){
         item = item.replace('```', isStart ? templateHighlightStart : templateHighlightEnd );
         isStart = !isStart;
	   }
	   return item;
   }

	var path = bookmark.path.map(insertHighlight);
	if (bookmark.tabId){
		tabtype = ' tab';
	}

	var folders = path.slice(0, path.length - 1).map(function(item){
		return templateFolder.replace(/{{content}}/gi, item);
	});
	var foldersString = folders.join(templateFolderSeparator);
	if (foldersString){
		foldersString += templateFolderSeparator;
	}
	var title = path[path.length - 1];
	var result = template
		.replace(/{{folders}}/gi, foldersString)
		.replace(/{{url}}/gi, bookmark.url)
		.replace(/{{title}}/gi, title)
		.replace(/{{tabtype}}/gi, tabtype);
	return result;

}

function timeCache(){
	var self = this;

	self.data = undefined;
	self.isValid = false;
	self.get = function(){
		return self.data;
	}

	self.set = function(value){
		self.isValid = true;
		self.data = value;

		setTimeout(function(){
			debug('reseting cache');
			self.isValid = false;
			self.data = undefined;
		}, 2000);
	}
}
var tabsCache = new timeCache();


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
			debug('openning page: ' + url);
			debug('openning page {0}', JSON.stringify(bookmark));

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

function showRecentTabs(listBoxControl, listBoxElement){
	getChromeTabs(function(chromeTabs){
		var tabs = getActiveTabs(chromeTabs);
		var backgroundData = chrome.extension.getBackgroundPage().data;
		var tabsOrder = [];

		for(var i in backgroundData){
			tabsOrder.push({tabId: i, lastActivated: backgroundData[i].lastActivated});
		}
		tabsOrder = tabsOrder.sort(function(a,b){
			var aTime = a.lastActivated || 0;
			var bTime = b.lastActivated || 0;
			return bTime - aTime;
		});
		tabsOrder.forEach(function(i){
			debug('sorted: ' + JSON.stringify(i));
		});

		if (tabsOrder.length > 1){
			tabsOrder = tabsOrder.slice(1);
		}
		var result = [];
		tabsOrder.forEach(function(orderedItem){
			var found = tabs.find(function(item){
				return orderedItem.tabId == item.tabId;
			});
			if (found){
				result.push(found);
				var foundIndex = tabs.indexOf(found);
				if (foundIndex > -1) {     
					tabs.splice(foundIndex, 1); 
				};
			}
		});
		renderBookmarks(result, listBoxControl, listBoxElement);
	});
}

function renderBookmarks(bookmarks, listBoxControl, listBoxElement){
	var bookmarksAsHtml = bookmarks.map(function(item){
		return renderBookmark(item);
	});
	var html = bookmarksAsHtml.join('');
	listBoxElement.innerHTML = html;
	listBoxControl.reset(bookmarks);
}

function chromeOmnicompleteOnSearching(phrase, listBox, callback) {
	var searchAndRender = function(tabsAndBookmarks){
		var found = searchBookmarks(tabsAndBookmarks, phrase);
		found = sort(phrase, found);
		var foundAsHtml = found.map(function(item){
			return renderBookmark(item);
		});
		var html = foundAsHtml.join('');
		callback(html, found);
		listBox.reset(found);
	}
	
	if (tabsCache.isValid){
		debug('taking value from cache');
		searchAndRender(tabsCache.get());
	}
	else {
		debug('recalculate cache');
		getChromeBookmarks(function(chromeBookmarks){
			var bookmarks = getBookmarks(chromeBookmarks);
			getChromeTabs(function(chromeTabs){
				var tabs = getActiveTabs(chromeTabs);
				var tabsAndBookmarks = mergeTabsWithBookmarks(tabs, bookmarks);
				tabsCache.set(tabsAndBookmarks);
				searchAndRender(tabsCache.get());
			});
		});
	}
}

function sort(phrase, items) {
   var result = items.sort(function(a, b) {
      return ('' + a.sortPhrase).localeCompare(b.sortPhrase);
   });
   return result;
}

if (document && document.getElementById('chrome-omnicomplete-input')){
	var listBox = new BookmarksListBox();
	var listBoxElement = document.getElementById('chrome-omnicomplete-listbox');
	document.getElementById('chrome-omnicomplete-input').addEventListener('input', function(){
		var phrase = document.getElementById('chrome-omnicomplete-input').value;
		chromeOmnicompleteOnSearching(phrase, listBox, function(html){
			listBoxElement.innerHTML = html;
		});
	});
	debug('popup opened');
	showRecentTabs(listBox, listBoxElement);
}
