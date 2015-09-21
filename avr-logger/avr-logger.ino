#include <Adafruit_CC3000.h>
#include <SPI.h>
#include <avr/wdt.h>
#include <Wire.h>
#include <SFE_BMP180.h>
#include <DHT.h>

#define DHT_PIN                 2
#define ADAFRUIT_CC3000_IRQ     3
#define ADAFRUIT_CC3000_VBAT    5
#define ADAFRUIT_CC3000_CS      10

#define WLAN_SSID               "janeNet"
#define WLAN_PASS               "777777777"
#define WLAN_SECURITY           WLAN_SEC_WPA2

#define LOGGING_INTERVAL        180
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
        Serial.println(F("BMP180 init fail\n\n"));
        while(1);
    }
    
    dht.begin();    

    status = bmp.startTemperature();

    if (status != 0) {

        delay(status);
        status = bmp.getTemperature(T1);

        if (status != 0) {

            Serial.print("T1: ");
            Serial.println(T1,2);
            status = bmp.startPressure(3);

            if (status != 0) {

                delay(status);
                status = bmp.getPressure(P,T1);
                
                if (status != 0) {
                    
                    Serial.print("P: ");
                    Serial.println(P/1.33322,1);
                    
                    H = dht.readHumidity();
                    T2 = dht.readTemperature();

                    if (!isnan(H) && !isnan(T2) && !isnan(T1) && !isnan(P)) {
                        Serial.print("T2: ");
                        Serial.println(T2,2);
                        Serial.print("H: ");
                        Serial.println(H,2);
                        return String(round((T1+T2)/2)) + String(" ") + String(round(P/1.33322)) + String(" ") + String(round(H));
                    }
                    
                }
            }
        }
    }
    
    Serial.println("Read sensors error!");
    return "";
  
}

void logSensorReading() {
    
    // Initialize the CC3000.
    Serial.println(F("\nInitializing CC3000..."));
    if (!cc3000.begin()) {
        Serial.println(F("Couldn't begin()! Check your wiring?"));
        while(1);
    }
    
    wdt_reset();

    // Connect to AP.
    if (!cc3000.connectToAP(WLAN_SSID, WLAN_PASS, WLAN_SECURITY)) {
        Serial.println(F("Failed!"));
        while(1);
    }
    Serial.println(F("Connected!"));
    
    wdt_reset();

    // Wait for DHCP to be complete.
    Serial.println(F("Request DHCP"));
    while (!cc3000.checkDHCP()) {
        wdt_reset();
        delay(100);
    }    

    Serial.print(F("Sending measurement... "));
    Adafruit_CC3000_Client server = cc3000.connectTCP(ip, SERVER_PORT);
    
    wdt_reset();
    
    if (server.connected()) {
        server.println(getMsg());
        wdt_reset();
    } else {
        Serial.println(F("Error sending measurement!"));
    }
    Serial.println(F("done."));

    delay(500);

    server.close();
    
    wdt_reset();
    
    if (cc3000.checkConnected()) {
        cc3000.disconnect();
    }
    
    wdt_reset();

    // Wait for the CC3000 to finish disconnecting before
    // continuing.
    while (cc3000.checkConnected()) {
        wdt_reset();
        delay(100);
    }
    
    wlan_stop(); 

}

void setup(void) {
    
    Serial.begin(115200);
    ip = cc3000.IP2U32(SERVER_IP);
    Serial.println(F("Setup complete."));
    
    logSensorReading();
    
    wdt_enable(WDTO_8S);
    
}

void loop(void) {
    
    Serial.print(F("Counter: "));
    Serial.println(counter);
    
    counter++;
    delay(5000);
    
    if (counter < LOGGING_INTERVAL) {
        wdt_reset();
    }
    
    
}
