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

Download => lytup 90W1C

More Options
 * Browser => http://localhost:8080/90W1C
 * Curl => curl -Lo '90W1C.zip' http://localhost:8080/90W1C
 * Wget => wget -O '90W1C.zip' http://localhost:8080/90W1C

[||||||||||||||||||||] 100% | 11.5 MB of 11.5 MB | -- | --
✔ TRANSFER COMPLETED
```

### Download files
```sh
$ lytup 90W1C
                               _             _  
 |       _|_       ._         / \     /|      ) 
 |_  \/   |_  |_|  |_)    \/  \_/  o   |  o  /_ 
     /             |                            

Saving to 90W1C

[||||||||||||||||||||] 100% | 11.5 MB of 11.5 MB | -- | --
✔ TRANSFER COMPLETED
```
