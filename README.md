# Lytup-CLI
Command-line interface for [Lytup](http://lytup.com) - A blazing fast file transfer platform

## Installation
```sh
$ npm i -g lytup
```

## Usage

### Upload files
```sh
$ lytup node-v0.10.21.pkg 
Download @ lytup -d NccUr
Other options:
- Browser => http://lytup.com/NccUr
- Curl => curl -Lo 'node-v0.10.21.pkg' http://lytup.com/NccUr
- Wget => wget -O 'node-v0.10.21.pkg' http://lytup.com/NccUr
Sending 8.7 MB of files
[||||||||||||||||||||||||||||||] 100% |  696.6 KB/s
Transfer complete
```

### Download files
```sh
$ lytup -d NccUr
Receiving 8.7 MB of files | saving to 'node-v0.10.21.pkg'
[||||||||||||||||||||||||||||||] 100% |  696.6 KB/s
Transfer complete
```
