# Lytup-CLI #
CLI for Lytup.com

## Installation
```sh
$ npm i lytup -g
```

## Usage

### Upload file(s)
```sh
$ lytup -u node-v0.10.15.pkg chromecast-setup.dmg
download url => http://lytup.com/Unp9t
sending 12.34 MB of file(s)
[##############################] 100 % |     699 KB/s
complete
```


### Download file(s)
```sh
$ lytup -d http://lytup.com/Unp9t
receiving 12.34 MB of file(s) | saving to "Unp9t.zip"
[##############################] 100 % |     699 KB/s
complete
```
