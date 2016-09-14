## Introduction

This is a Chrome extension that allows to naviate quickly through opened tabs and bookmarks organized in folders. If you have the following bookmarks structure:
    Bookmarks bar
      +--- Blogs
      |      +--- Programming
      |      +--- Parenting
      |               +---- Superpapa
      |               +---- Supermama
      +--- Projects
             +--- ps-menu
Then you could run the extension and search:
    bpama
This should find only one bookmark:  *B*logs / *Pa*renting / Super*ma*ma
If the bookmark was already opened in some tab, it would be suggest to go to this tab first.

## Setup

First install dependencies

    npm install

Testem is needed to run unit tests. Run:

    npm install -g testem

Then, just run tests (Chrome is needed)

    testem -l Chrome
