socks-rtc
=========

[![Build Status](https://travis-ci.org/uProxy/socks-rtc.png?branch=master)](https://travis-ci.org/uProxy/socks-rtc)

Library which allows you to proxy SOCKS5 through WebRTC.

This is built on top of [freedom](https://github.com/UWNetworksLab/freedom).

At the moment this only supports chrome.

### Requirements

- node + npm
- grunt `npm install -g grunt-cli`

### Initial Setup

- Run `npm install` from the base directory to obtain all prerequisites.
- Run `grunt setup` to prepare the freedom installation. (This step should
  disappear with future versions of freedom)
- Run `grunt` which builds everything.
- Go to `chrome://extensions`, ensure developer mode is enabled, and load
  unpacked extension the `socks-rtc/chrome/` directory.
- Open the background page.

### Build
Assuming you've done initial setup:
- Run `grunt`.
- Reload extension.

### End-to-End Test

#### Automated
We have a Selenium test which starts Chrome with the proxy loaded and its proxy
settings pointing at the proxy. You will need to have the Selenium server
running locally (on localhost:4444). To do this:

 - download the "Standalone Server" from http://docs.seleniumhq.org/download/
 - run the Selenium server, e.g. `java -jar selenium-server-standalone-*.jar`
 - run the test with `grunt endtoend`

#### Manual
At the moment, the way to test that this works is to just curl a webpage
through the proxy which socks-rtc sets up if you've built it successfully.
For example:

`curl -x socks5h://localhost:9999 www.google.com`

There will be more tests soon!
