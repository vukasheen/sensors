# sensors
Wireless sensors

Raspbian steps:

* sudo raspi-config -> interfacing options -> enable SPI
* curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
* sudo apt-get install -y nodejs
* npm install nrf
* sudo apt-get install mongodb-server
* sudo service mongodb start
* cd node-server-sensors
* npm install
* cd node-server-web
* npm install