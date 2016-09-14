var expect = chai.expect;

describe('testing testFunc', function(){
    it('should return tested', function(){
        expect(forTesting()).to.equal('tested');
    });
});

describe('Getting chrome bookmars', function(){
	var chromeBookmars = [{
		title: '',
		id: 0,
		children: [
			{
				title: 'Bookmarks bar',
				id: 1,
				children: [
					{
						id: 4,
						title: 'my folder',
						children: [
							{
								id: 5,
								title: 'Stackoverflow',
								url: 'http://stackoverflow.com/'
							},
							{
								id: 6,
								title: 'facebook',
								url: 'http://facebook.com/'
							}
						]
					}
				]
			},
			{
				title: 'Other bookmarks',
				id: 2,
				children: [
					{
						title: 'Chrome store',
						id: 3,
						url: 'http://chrome.store/'
					}
				]
			}
		]
	}];
	var bookmarks=null;

	beforeEach(function(){
		bookmarks = getBookmarks(chromeBookmars);
	});

	it('should return array of bookmark elemets', function(){
		expect(bookmarks[0].path).to.deep.equal(['my folder', 'Stackoverflow']);
		expect(bookmarks[0].url).to.equal('http://stackoverflow.com/');

		expect(bookmarks[1].path).to.deep.equal(['my folder', 'facebook']);
		expect(bookmarks[1].url).to.equal('http://facebook.com/');
	})
})

describe('searching', function(){
	it('should mark found phrases', function(){
		var bookmarks = [
			bookmark('Software', 'hello world')
		];

		var results = searchBookmarks(bookmarks, 'Soft');

		expect(results[0].path).to.deep.equal(['```Soft```ware', 'hello world']);
	});

	it('should mark all found phrases', function(){
		var bookmarks = [
			bookmark('Software', 'hello world'),
			bookmark('Software', 'hello world 2'),
			bookmark('Other', 'hello world'),
			bookmark('hello world'),
		];

		var results = searchBookmarks(bookmarks, 'Soft');

		expect(results[0].path).to.deep.equal(['```Soft```ware', 'hello world']);
		expect(results[1].path).to.deep.equal(['```Soft```ware', 'hello world 2']);
	});

	it('should be case-insensitive during searching', function(){
		var bookmarks = [
			bookmark('Software', 'Hello world'),
			bookmark('Other', 'Software'),
			bookmark('hello world'),
		];

		var results = searchBookmarks(bookmarks, 'soft');

		expect(results[0].path).to.deep.equal(['```Soft```ware', 'Hello world']);
		expect(results[1].path).to.deep.equal(['Other', '```Soft```ware']);
	});

	it('should be search using all parts of path', function(){
		var bookmarks = [
			bookmark('Software', 'Hello world'),
			bookmark('Other', 'hello world'),
			bookmark('hello world'),
		];

		var results = searchBookmarks(bookmarks, 'shell');

		expect(results[0].path).to.deep.equal(['```S```oftware', '```Hell```o world']);
	});

	it('should search in beginning of folder names', function(){
		var bookmarks = [
			bookmark('Software', 'hello world'),
			bookmark('Software', 'hello world 2'),
			bookmark('Software', 'Hello', 'hello world'),
			bookmark('Software', 'H1', 'hello world'),
			bookmark('Other', 'hello world'),
			bookmark('hello world'),
		];

		var results = searchBookmarks(bookmarks, 'shell');

		expect(results[0].path).to.deep.equal(['```S```oftware', '```hell```o world']);
		expect(results[1].path).to.deep.equal(['```S```oftware', '```hell```o world 2']);
		expect(results[2].path).to.deep.equal(['```S```oftware', '```Hell```o', 'hello world']);
		expect(results[3].path).to.deep.equal(['```S```oftware', '```H```1', 'h```ell```o world']);
	});
});

describe('rendering bookmark', function(){
	it('should render bookmark', function(){
		var testBookmark = bookmark('Software', 'hello world');
		testBookmark.url = 'http://test.com/';

		var result = renderBookmark(testBookmark);

		expect(result).to.equal('<div class="bookmark"><span class="b-f">Software</span> / <span class="b-n" title="http://test.com/">hello world</span></div>');
	});

	it('should mark selected text', function(){
		var testBookmark = bookmark('```Soft```ware', 'h```ello``` world');

		var result = renderBookmark(testBookmark);

		expect(result).to.contain('class="b-f"><span class="b-highlight">Soft</span>ware');
		expect(result).to.contain('h<span class="b-highlight">ello</span> world');
	});
});

describe('merging tabs and bookmarks', function(){
	it('when tab with the same url is open, it should be discovered as bookmark', function(){
		var bookmark1 = bookmark('Software', 'hello world'); bookmark1.url = 'http://software.xxx/hello';
		var bookmark2 = bookmark('Software', 'hello world 2'); bookmark2.url = 'http://software.xxx/hello2';
		var tab1 = tab('some title', 'http://software.xxx/hello', 1);
		var tab2 = tab('some title 2', 'http://software.xxx/otherlink', 2);
		var tabs = getActiveTabs([tab1, tab2]);

		var merged = mergeTabsWithBookmarks(tabs, [bookmark1, bookmark2]);

		expect(merged[0]).to.contain.all.keys({path: ['Software', 'hello world'], tabId: 1});
		expect(merged[1]).to.contain.all.keys({path: ['some title'], tabId: 1});
		expect(merged[2]).to.contain.all.keys({path: ['some title 2'], tabId: 2});
		expect(merged[3]).to.contain.all.keys({path: ['Software', 'hello world']});
		expect(merged[4]).to.contain.all.keys({path: ['Software', 'hello world 2']});

	});
});

function bookmark(){
	var bookmark = {path: [], url: 'http://test.com/'};
	Array.from(arguments).forEach(function(item){
		bookmark.path.push(item);
	});
	return bookmark;
}

function tab(title, url, id){
	return {
		url: url,
		title: title,
		id: id
	};
}
