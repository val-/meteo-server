#include <LowPower.h>
#include <avr/wdt.h>
#include <Adafruit_CC3000.h>
#include <SPI.h>
#include <Wire.h>
#include <SFE_BMP180.h>
#include <DHT.h>

#define DHT_PIN                 2
#define POWER_PIN               7
#define ADAFRUIT_CC3000_IRQ     3
#define ADAFRUIT_CC3000_VBAT    5
#define ADAFRUIT_CC3000_CS      10

#define WLAN_SSID               "janeNet"
#define WLAN_PASS               "777777777"
#define WLAN_SECURITY           WLAN_SEC_WPA2

#define LOGGING_INTERVAL        225
#define SERVER_IP               192, 168, 1, 93
#define SERVER_PORT             8000


DHT dht(DHT_PIN, DHT22);
SFE_BMP180 bmp;
Adafruit_CC3000 cc3000 = Adafruit_CC3000(ADAFRUIT_CC3000_CS, ADAFRUIT_CC3000_IRQ, ADAFRUIT_CC3000_VBAT);
uint32_t ip;

int counter = 0;

String getMsg() {
    
    char status;
    double T1, P;
    float T2, H;
    
    if (bmp.begin()) {
        Serial.println(F("BMP180 init success"));
    } else {
        Serial.println(F("BMP180 init fail"));
        while(1);
    }
    
    dht.begin();    

    status = bmp.startTemperature();

    if (status != 0) {

        delay(status);
        status = bmp.getTemperature(T1);

        if (status != 0) {

            Serial.print("T1: ");
            Serial.println(T1, 2);
            status = bmp.startPressure(3);

            if (status != 0) {

                delay(status);
                status = bmp.getPressure(P, T1);
                
                if (status != 0) {
                    
                    Serial.print("P: ");
                    Serial.println(P/1.33322, 1);
                    
                    H = dht.readHumidity();
                    T2 = dht.readTemperature();

                    if (!isnan(H) && !isnan(T2) && !isnan(T1) && !isnan(P)) {
                        Serial.print("T2: ");
                        Serial.println(T2, 2);
                        Serial.print("H: ");
                        Serial.println(H, 2);
                        return String(round((T1+T2)/2)) + String(" ") + String(round(P/1.33322)) + String(" ") + String(round(H)) + String("/n");
                    }
                    
                }
            }
        }
    }
    
    Serial.println("Read sensors error!");
    return "";
  
}

void logSensorReading() {
    
    Serial.println(F("\nInitializing CC3000..."));
    if (!cc3000.begin()) {
        Serial.println(F("Couldn't begin()! Check your wiring?"));
        while(1);
    }

    Serial.println(F("Connect to AP..."));
    if (!cc3000.connectToAP(WLAN_SSID, WLAN_PASS, WLAN_SECURITY)) {
        Serial.println(F("Failed!"));
        while(1);
    }
    Serial.println(F("Connected!"));

    Serial.println(F("Request DHCP"));
    while (!cc3000.checkDHCP()) {
        delay(100);
    }    

    Serial.print(F("Sending measurement... "));
    Adafruit_CC3000_Client server = cc3000.connectTCP(ip, SERVER_PORT);
    
    if (server.connected()) {
        server.println(getMsg());
        wdt_reset();
    } else {
        Serial.println(F("Error sending measurement!"));
    }
    Serial.println(F("Done!"));

    delay(500);

    server.close();
    
    if (cc3000.checkConnected()) {
        cc3000.disconnect();
    }
    
    while (cc3000.checkConnected()) {
        delay(100);
    }
    
    wlan_stop(); 

}

void setup(void) {
    
    Serial.begin(115200);
    ip = cc3000.IP2U32(SERVER_IP);
    
    Serial.println(F("Setup complete."));
    
    pinMode(POWER_PIN, OUTPUT);
    digitalWrite(POWER_PIN, HIGH);
    delay(1000);
    
    logSensorReading();
    
    digitalWrite(POWER_PIN, LOW);
    
}

void loop(void) {
    
    Serial.print(F("Counter: "));
    Serial.println(counter);        
    counter++;
    
    if (counter < LOGGING_INTERVAL) {
        LowPower.powerDown(SLEEP_8S, ADC_OFF, BOD_OFF);
    } else {
        wdt_enable(WDTO_8S);
    }
    
}

