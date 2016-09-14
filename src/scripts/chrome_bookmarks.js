if (!chrome.bookmarks && !chrome.tabs){
	chrome.bookmarks = {
		getTree: function(callback){
			var bookmarks = [
				{"children":[
					{"title":"Bookmarks bar","children":[
						{"title":"StackOverflow","children":[
							{"title":"Stack Overflow","dateAdded":1473739373053,"id":"11","index":0,"parentId":"6","url":"http://stackoverflow.com/"},
							{"title":"Vim shortcuts","dateAdded":1473739470617,"id":"12","index":1,"parentId":"6","url":"http://stackoverflow.com/questions/1218390/what-is-your-most-productive-shortcut-with-vim"}
						],"dateAdded":1473739250758,"dateGroupModified":1473739470617,"id":"6","index":0,"parentId":"1"},
						{"title":"Blogs","children":[
							{"title":"Programming","children":[
								{"title":"Scott Hanselman","dateAdded":1473739514872,"id":"13","index":0,"parentId":"8","url":"http://www.hanselman.com/blog/"},
								{"title":"chrisseroka | Web Notes","dateAdded":1473739544745,"id":"14","index":1,"parentId":"8","url":"https://chrisseroka.wordpress.com/"},
								{"title":"devstyle.pl | Maciej Aniserowicz | blog programisty","dateAdded":1473739587165,"id":"15","index":2,"parentId":"8","url":"http://devstyle.pl/"}
							],"dateAdded":1473739272300,"dateGroupModified":1473739587165,"id":"8","index":0,"parentId":"7"},
							{"title":"Parenting","children":[
								{"title":"Blog Ojciec - Wychowanie dzieci okiem ojca","dateAdded":1473739612834,"id":"16","index":0,"parentId":"9","url":"http://www.blogojciec.pl/"},
								{"title":"Aktywny Tata","dateAdded":1473739688118,"id":"17","index":1,"parentId":"9","url":"http://aktywnytata.blogspot.com/"}
							],"dateAdded":1473739284990,"dateGroupModified":1473739688118,"id":"9","index":1,"parentId":"7"}
						],"dateAdded":1473739260643,"dateGroupModified":1473739284990,"id":"7","index":1,"parentId":"1"},
						{"title":"Projects","children":[
							{"title":"GitHub - chrisseroka/ps-menu: Simple powershell menu to render interactive console menu","dateAdded":1473739709132,"id":"18","index":0,"parentId":"10","url":"https://github.com/chrisseroka/ps-menu"},
							{"title":"GitHub - chrisseroka/Blog.FrontEndTestingSamples: Sample projects with different approaches to front end testing","dateAdded":1473739731527,"id":"19","index":1,"parentId":"10","url":"https://github.com/chrisseroka/Blog.FrontEndTestingSamples"}
						],"dateAdded":1473739297863,"dateGroupModified":1473739731527,"id":"10","index":2,"parentId":"1"}
					],"dateAdded":1473738951114,"dateGroupModified":1473739297863,"id":"1","index":0,"parentId":"0"},
					{"children":[],"dateAdded":1473738951114,"id":"2","index":1,"parentId":"0","title":"Other bookmarks"}
					],"dateAdded":1473738951114,"id":"0","title":""}
			];
			callback(bookmarks);
		}
	};
	chrome.tabs = {
		query: function (queryFilter, callback){
			var tabs = [
				{"title":"Extensions","active":false,"audible":false,"favIconUrl":"chrome://theme/IDR_EXTENSIONS_FAVICON@2x","height":710,"highlighted":false,"id":3219,"incognito":false,"index":0,"mutedInfo":{"muted":false},"pinned":false,"selected":false,"status":"complete","url":"chrome://extensions/","width":1580,"windowId":3183},
				{"title":"Stack Overflow","active":false,"audible":false,"favIconUrl":"http://cdn.sstatic.net/Sites/stackoverflow/img/favicon.ico?v=4f32ecc8f43d","height":710,"highlighted":false,"id":3221,"incognito":false,"index":1,"mutedInfo":{"muted":false},"pinned":false,"selected":false,"status":"complete","url":"http://stackoverflow.com/","width":1580,"windowId":3183},
				{"title":"Scott Hanselman","active":false,"audible":false,"favIconUrl":"http://www.hanselman.com/images/favicon.ico","height":710,"highlighted":false,"id":3223,"incognito":false,"index":2,"mutedInfo":{"muted":false},"pinned":false,"selected":false,"status":"complete","url":"http://www.hanselman.com/blog/","width":1580,"windowId":3183},
				{"title":"chrisseroka | Web Notes","active":false,"audible":false,"favIconUrl":"https://s2.wp.com/i/favicon.ico","height":710,"highlighted":false,"id":3225,"incognito":false,"index":3,"mutedInfo":{"muted":false},"pinned":false,"selected":false,"status":"complete","url":"https://chrisseroka.wordpress.com/","width":1580,"windowId":3183},
				{"title":"GitHub - chrisseroka/ps-menu: Simple powershell menu to render interactive console menu","active":false,"audible":false,"favIconUrl":"https://assets-cdn.github.com/favicon.ico","height":710,"highlighted":false,"id":3227,"incognito":false,"index":4,"mutedInfo":{"muted":false},"pinned":false,"selected":false,"status":"complete","url":"https://github.com/chrisseroka/ps-menu","width":1580,"windowId":3183},
				{"title":"New Tab","active":true,"audible":false,"favIconUrl":"https://www.google.pl/favicon.ico","height":710,"highlighted":true,"id":3238,"incognito":false,"index":5,"mutedInfo":{"muted":false},"openerTabId":3219,"pinned":false,"selected":true,"status":"complete","url":"chrome://newtab/","width":1580,"windowId":3183}
			];
			callback(tabs);
		},
		update: function(id, value){
			alert('making tab #' + id + ' updated with value ' + JSON.stringify(value));
		}
	}
}
