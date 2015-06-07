### PirateBox
This is a vagrant box pre setup to use run nzbdrone, couchPotato, and sabnzbd

## Prerequisites
1. Download [virtualbox](https://www.virtualbox.org/)
2. Download [vagrant](https://www.vagrantup.com/downloads.html)
3. Get a usenet provider like [astraweb](http://www.astraweb.com/)
4. Get a premium usenet indexer like [oznzb](https://www.oznzb.com/)


## Installation
1. clone this project
2. rename settings.template.sh -> settings.sh
3. Change the settings to your settings in settings.sh
4. navigate to this folder in the command line
5. type `vagrant up`

## Links to virtual machine
Couch Potato: http://192.168.1.121:5050

NzbDrone: http://192.168.1.121:8989

SabNzbdPlus: http://192.168.1.121:8080 (username: vagrant - password: vagrant)


If you don't want your virtual machine to use this address, change it in VagrantFile by modifying this line
```
config.vm.network "public_network", ip: "192.168.1.121", bridge: 'en0: Wi-Fi (AirPort)'
# change too
config.vm.network "public_network", ip: "A different IP", bridge: 'en0: Wi-Fi (AirPort)'
```
