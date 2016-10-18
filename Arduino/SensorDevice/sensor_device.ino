#include <nRF24L01.h>
#include <RF24.h>
#include <RF24_config.h>
#include <SPI.h>
#include <dht.h>
 
#define DHT_PIN 2     // what pin we're connected to

dht DHT;

RF24 radio(9,10);
const uint64_t pipe = 0xE8E8F0F0E2LL;

struct Data {
  uint32_t id;
  float temp;
  float hum;
} data;
 
void setup(void) {
  data.id = 0xE2E2E2E2; // should be unique per sensor device (change it before uplading the sketch to each new Arduino)
  
  Serial.begin(9600);
  radio.begin();
  radio.setChannel(0x76);
  radio.openWritingPipe(pipe);
  radio.enableDynamicPayloads();
  delay(2000);
}
 
void loop(void){    
  DHT.read22(DHT_PIN);
  data.temp = DHT.temperature;
  data.hum = DHT.humidity;
  
  radio.write(&data, sizeof(data));
  
  Serial.print("Sent temperature: ");
  Serial.print(data.temp);
  Serial.println(". Going to sleep for a while...");
  
  radio.powerDown(); 
  delay(2000);
  radio.powerUp();
}
