# Lytup-CLI
Command-line interface for [Lytup](http://lytup.com) - A blazing fast file transfer platform

## Installation
```sh
$ npm i -g lytup
```

## Usage

### Upload files
```sh
$ lytup node-v0.10.22.pkg chromecast-setup.1.3.0.428.dmg 
                               _             _  
 |       _|_       ._         / \     /|      ) 
 |_  \/   |_  |_|  |_)    \/  \_/  o   |  o  /_ 
     /             |                            

Download => lytup 0fk3N

More Options
 * Browser => http://lytup.com/0fk3N
 * Curl => curl -Lo '0fk3N.zip' http://lytup.com/0fk3N
 * Wget => wget -O '0fk3N.zip' http://lytup.com/0fk3N

[||||||||||||||||||||] 100% | 11.5 MB of 11.5 MB | 695.0 KB/s | 00:00:00 ETA
✔ TRANSFER COMPLETED
```

### Download files
```sh
$ lytup 0fk3N
                               _             _  
 |       _|_       ._         / \     /|      ) 
 |_  \/   |_  |_|  |_)    \/  \_/  o   |  o  /_ 
     /             |                            

Saving to 0fk3N

[||||||||||||||||||||] 100% | 11.5 MB of 11.5 MB | 695.0 KB/s | 00:00:00 ETA
✔ TRANSFER COMPLETED
```
