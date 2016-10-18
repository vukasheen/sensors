#include <nRF24L01.h>
#include <RF24.h>
#include <RF24_config.h>
#include <SPI.h>

/*
  This sketch receives strings from sending unit via nrf24
  and prints them out via serial.  The sketch waits until
  it receives a specific value (2 in this case), then it
  prints the complete message and clears the message buffer.
*/

float receivedTemp;
RF24 radio(9, 10);
const uint64_t pipe = 0xE8E8F0F0E1LL;
void setup(void) {
  Serial.begin(9600);
  radio.begin();
  radio.openReadingPipe(1, pipe);
  radio.startListening();
  Serial.println("Listening...");
}
void loop(void) {
  if (radio.available()) {
    radio.read(&receivedTemp, sizeof(float));
    Serial.print("Received temperature: ");
    Serial.print(receivedTemp);
    Serial.println(" C");
  }
}
