# Lytup-CLI #
CLI for Lytup.com

## Installation
```sh
$ npm i -g lytup
```

## Usage

### Upload file(s)
```sh
$ lytup -u node-v0.10.15.pkg chromecast-setup.dmg
Receive file(s):
 Lytup => lytup -d 8pxpa
 Browser => http://lytup.com/8pxpa
 Curl => curl -Lo 8pxpa.zip http://lytup.com/8pxpa
 Wget => wget -O 8pxpa.zip http://lytup.com/8pxpa
Sending 12.3 MB of file(s)
[##############################] 100% |  684.3 KB/s
Transfer complete
```


### Download file(s)
```sh
$ lytup -d 8pxpa
Receiving 12.3 MB of file(s) | saving to "8pxpa.zip"
[##############################] 100% |  684.3 KB/s
Transfer complete
```


