//
// Created by Mathieu Le Goc on 2/15/18.
//

#ifndef ZOOID_VIS_SANDBOX_H
#define ZOOID_VIS_SANDBOX_H

#include "ofMain.h"
#include "parameters.h"

using namespace std;

enum class SandboxType{none, scatterplot, map};

class DataPoint{
public:
    DataPoint();
    DataPoint(int _id, ofVec2f _position);
    int getId();
    ofVec2f getPosition();
    void setId(int _id);
    void setPosition(ofVec2f _position);
private:
    unsigned int id;
    ofVec2f position;
};

class PointSet{
public:
    PointSet();
    PointSet(DataPoint _origin, DataPoint _point_a, DataPoint _point_b);
    
    void setOrigin(DataPoint _origin);
    void setPointA(DataPoint _point_a);
    void setPointB(DataPoint _point_b);
    
    DataPoint getOrigin();
    DataPoint getPointA();
    DataPoint getPointB();
    float getWidth();
    float getHeight();
    float getOrientation();
    
private:
    DataPoint origin;
    DataPoint point_a;
    DataPoint point_b;
};

class Sandbox {
private :
    unsigned int id;
    PointSet points;
    string x_variable;
    string y_variable;
    SandboxType type;
    vector<unsigned int> dusts_in_sandbox;
    ofPolyline contour;
    
public:
    Sandbox();
    Sandbox(unsigned int _id);

    Sandbox(unsigned int _id, DataPoint _origin, DataPoint _point_a, DataPoint _point_b, SandboxType _type = SandboxType::none, string _x_variable = string(), string _y_variable = string());


    unsigned int getId();
    float getWidth();
    float getHeight();
    float getOrientation();
    SandboxType getType();
    string getXVariable();
    string getYVariable();
    PointSet getPoints();
    bool isInside(ofVec2f p);
    
    
    void setId(unsigned int _id);
    void setWidth(float _width);
    void setHeight(float _height);
    void setOrientation(float _orientation);
    void setSandboxType(SandboxType _type);
    void setXVariable(string _x_variable);
    void setYVariable(string _y_variable);
    void setPoints(PointSet _points);
    
    void addDustInSandbox(unsigned int dustId);
    void removeDustFromSandbox(unsigned int dustId);
    vector<unsigned int> getDustsInSandbox();

    SandboxType findType();
    
    void draw();
};


#endif //ZOOID_VIS_SANDBOX_H
