#pragma once

#include <stdint.h>

#include "ofMain.h"
#include "ofxNetwork.h"
#include "ZooidManager.h"
#include "Sandbox.h"
#include "Magnet.h"
#include "Dust.h"
#include "Student.h"
#include "parameters.h"

#include "ofxLibwebsockets.h"
#include "ofxCsv.h"

#include "../rapidjson/writer.h"
#include "../rapidjson/stringbuffer.h"
#include "../rapidjson/document.h"

using namespace rapidjson;
using namespace std;


enum class ClientMsgIds{dataset = (int)0x00, point_to_display = (int)0x01, dataset_to_load = (int)0x10, dimension_selected = (int)0x11};

inline bool sortbysec(const pair<int,float> &a, const pair<int,float> &b){
    return (a.second < b.second);
}

inline int max(const int &a, const int &b, const int &c=0) {
    if(c==0)
        return (a>b)?a:b;
    else
        return max(max(a,b),c);
}


inline int min(const int &a, const int &b, const int &c=0) {
    if(c==0)
        return (a<b)?a:b;
    else
        return min(min(a,b),c);
}


class ofApp : public ofBaseApp{
private:
    ZooidManager zooidManager;
    vector<Sandbox> sandboxes;
    unordered_map<unsigned int, Dust> dusts;
    unordered_map<unsigned int, Magnet> magnets;
    unordered_map<string, ofColor> dimensionsColors;
    
    vector<Student> students;
    
    ofxLibwebsockets::Server* webServer;
    bool clientConnected;    
    unordered_map<int, pair<bool,bool>> zooidTouches;
    
    vector<int> idleZooids;
    
    const float angleTolerance = 5.0f;
    bool datasetLoaded;
    
public:
    void setup();
    void update();
    void draw();
        
    void keyPressed(int key);
    void keyReleased(int key);
    void mouseMoved(int x, int y );
    void mouseDragged(int x, int y, int button);
    void mousePressed(int x, int y, int button);
    void mouseReleased(int x, int y, int button);
    void mouseEntered(int x, int y);
    void mouseExited(int x, int y);
    void windowResized(int  w, int h);
    void dragEvent(ofDragInfo dragInfo);
    void gotMessage(ofMessage msg);
    
    void placeDustInSandbox();
    void checkInteraction();
    void requestDetailOnDemand(unsigned int id, bool activate);
    void requestDetailOnDemand(vector<int>& ids);
    void findSandboxes(vector<DataPoint>& points);
    void findDustInSandboxes();

    float getStudentValue(Student &s, const string &dimension);
    
    float getScaledStudentValue(Student &s, const string &dimension);
    bool isDust(unsigned int id);
    bool isMagnet(unsigned int id);
    bool isIdle(unsigned int id);
    bool isSandbox(unsigned int id);
    bool isInDeadzone(ofVec2f p);
        
    ofVec2f calculateSumOfForces(Dust currentDust);
    ofVec2f calculateSumOfForces(Magnet currentMagnet);
    
    void updatePhysics();
    void updateFromZooids();
    void updateZooids();
    
    void highlightDimension(const string &dimension);
    void resetColors();
    
    bool loadDataset(const string &file_path);
    string exportStudents();
    void sendMessageToClient(const string &msg);
    void processClientMessage(string &message);
    
    pair<float,float> findExtremum(const string &dimension);
    pair<float,float> findExtremum(const string &dimension, int start, int end);
    void makeMagnet(int id, const string &dimension);

    int findFirstTouchedZooid();
    
    
    // websocket methods
    void onConnect( ofxLibwebsockets::Event& args );
    void onOpen( ofxLibwebsockets::Event& args );
    void onClose( ofxLibwebsockets::Event& args );
    void onIdle( ofxLibwebsockets::Event& args );
    void onMessage( ofxLibwebsockets::Event& args );
    void onBroadcast( ofxLibwebsockets::Event& args );
};
