//
// Created by Mathieu Le Goc on 2/15/18.
//

#include "Sandbox.h"


//--------------------------------------------------------------
DataPoint::DataPoint(){
    id = -1;
    position.set(0.0f);
}

//--------------------------------------------------------------
DataPoint::DataPoint(int _id, ofVec2f _position){
    id = _id;
    position = _position;
}

//--------------------------------------------------------------
int DataPoint::getId(){
    return id;
}

//--------------------------------------------------------------
ofVec2f DataPoint::getPosition(){
    return position;
}

//--------------------------------------------------------------
void DataPoint::setId(int _id){
    id = _id;
}

//--------------------------------------------------------------
void DataPoint::setPosition(ofVec2f _position){
    position = _position;
}



//--------------------------------------------------------------
//--------------------------------------------------------------
//--------------------------------------------------------------
PointSet::PointSet() {

}

//--------------------------------------------------------------
PointSet::PointSet(DataPoint _origin, DataPoint _point_a, DataPoint _point_b){
    origin = _origin;
    point_a = _point_a;
    point_b = _point_b;
}

//--------------------------------------------------------------
void PointSet::setOrigin(DataPoint _origin) {
    origin = _origin;
}

//--------------------------------------------------------------
void PointSet::setPointA(DataPoint _point_a) {
    point_a = _point_a;
}

//--------------------------------------------------------------
void PointSet::setPointB(DataPoint _point_b) {
    point_b = _point_b;
}

//--------------------------------------------------------------
DataPoint PointSet::getOrigin(){
    return origin;
}

//--------------------------------------------------------------
DataPoint PointSet::getPointA(){
    return point_a;
}

//--------------------------------------------------------------
DataPoint PointSet::getPointB(){
    return point_b;
}

//--------------------------------------------------------------
float PointSet::getWidth() {
    return (float)(point_a.getPosition()-origin.getPosition()).length();
}

//--------------------------------------------------------------
float PointSet::getHeight() {
    return (point_b.getPosition()-origin.getPosition()).length();
}

//--------------------------------------------------------------
//--------------------------------------------------------------
Sandbox::Sandbox() {
    id = -1;
    x_variable = string();
    y_variable = string();
    type = SandboxType::none;
}

//--------------------------------------------------------------
Sandbox::Sandbox(unsigned int _id){
    id = _id;
    x_variable = string();
    y_variable = string();
    type = SandboxType::none;
}

//--------------------------------------------------------------
Sandbox::Sandbox(unsigned int _id, DataPoint _origin, DataPoint _point_a, DataPoint _point_b, SandboxType _type, string _x_variable, string _y_variable){
    id = _id;
    points.setOrigin(_origin);
    points.setPointA(_point_a);
    points.setPointB(_point_b);
    
    type = _type;
    x_variable = _x_variable;
    y_variable = _y_variable;
    
    contour.addVertex(points.getPointA().getPosition());
    contour.addVertex(points.getOrigin().getPosition());
    contour.addVertex(points.getPointB().getPosition());
    contour.addVertex(points.getPointA().getPosition() + points.getPointB().getPosition() - points.getOrigin().getPosition());
    
}

//--------------------------------------------------------------
unsigned int Sandbox::getId() {
    return id;
}

//--------------------------------------------------------------
PointSet Sandbox::getPoints() {
    return points;
}

//--------------------------------------------------------------
float Sandbox::getWidth(){
    return points.getWidth();
}

//--------------------------------------------------------------
float Sandbox::getHeight(){
    return points.getHeight();
}

//--------------------------------------------------------------
float Sandbox::getOrientation() {
    return points.getOrientation();
}

//--------------------------------------------------------------
SandboxType Sandbox::getType() {
    return type;
}

//--------------------------------------------------------------
string Sandbox::getXVariable(){
    return x_variable;
}

//--------------------------------------------------------------
string Sandbox::getYVariable(){
    return y_variable;
}

//--------------------------------------------------------------
bool Sandbox::isInside(ofVec2f p){
    return contour.inside(p);
}

//--------------------------------------------------------------
void Sandbox::setId(unsigned int _id) {
    id = _id;
}

//--------------------------------------------------------------
void Sandbox::setSandboxType(SandboxType _type) {
    type = _type;
}

//--------------------------------------------------------------
void Sandbox::setXVariable(string _x_variable) {
    x_variable = _x_variable;
}

//--------------------------------------------------------------
void Sandbox::setYVariable(string _y_variable) {
    y_variable = _y_variable;
}

//--------------------------------------------------------------
void Sandbox::setPoints(PointSet _points){
    points = _points;
    contour.clear();
    contour.addVertex(points.getPointA().getPosition());
    contour.addVertex(points.getOrigin().getPosition());
    contour.addVertex(points.getPointB().getPosition());
    contour.addVertex(points.getPointA().getPosition() + points.getPointB().getPosition() - points.getOrigin().getPosition());
    
}

//--------------------------------------------------------------
void Sandbox::addDustInSandbox(unsigned int dustId){
    if (find(dusts_in_sandbox.begin(), dusts_in_sandbox.end(), dustId) == dusts_in_sandbox.end()) {
        dusts_in_sandbox.push_back(dustId);
    }
}

//--------------------------------------------------------------
void Sandbox::removeDustFromSandbox(unsigned int dustId){
    vector<unsigned int>::iterator it = find(dusts_in_sandbox.begin(), dusts_in_sandbox.end(), dustId);
    if (it != dusts_in_sandbox.end()) {
        dusts_in_sandbox.erase(it);
    }
}

//--------------------------------------------------------------
vector<unsigned int> Sandbox::getDustsInSandbox(){
    return dusts_in_sandbox;
}

//--------------------------------------------------------------
SandboxType Sandbox::findType(){
    float length1 = (points.getPointA().getPosition()-points.getOrigin().getPosition()).length();
    float length2 = (points.getPointB().getPosition()-points.getOrigin().getPosition()).length();
    
    if(length1 > 100.0f && length2 >100.0f && length1 < 500.0f && length2 < 500.0f){
        type = SandboxType::scatterplot;
    }

    return type;
}

//--------------------------------------------------------------
void Sandbox::draw() {
    
    ofMesh area;
    area.setMode(OF_PRIMITIVE_TRIANGLE_FAN);
    area.addVertices(contour.getVertices());
    
    ofSetLineWidth(2.0f);
    
    ofFill();
    if(type == SandboxType::scatterplot)
        ofSetColor(ofColor::red, 100);
    else if(type==SandboxType::map)
        ofSetColor(ofColor::green, 100);
    
    area.draw();
    

    ofSetColor(ofColor::darkGrey);
    contour.draw();
    
    ofSetColor(ofColor::blue, 100);
    ofDrawCircle(points.getPointA().getPosition(), 10.0f);
    ofSetColor(ofColor::green, 100);
    ofDrawCircle(points.getPointB().getPosition(), 10.0f);
    
    ofSetColor(ofColor::black);
    ofDrawBitmapString("A", points.getPointA().getPosition());
    ofDrawBitmapString("B", points.getPointB().getPosition());
}
