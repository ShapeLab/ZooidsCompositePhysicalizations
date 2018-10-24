//
//  Particle.cpp
//  Zooid_Vis
//
//  Created by Mathieu Le Goc on 3/6/18.
//
//

#include "Particle.h"


Particle::Particle() {
    position.set(0.0f);
    speed.set(0.0f);
    charge = 1.0f;
    size = 20.0f;
    mass = 1.0f;
    color = ofColor::black;
    type = string();
    is_highlighted = false;
    to_update = true;
    
    debug = false;
    friction = K_FRICTION;
}

Particle::Particle(float _size) {
    position.set(0.0f);
    speed.set(0.0f);
    charge = 1.0f;
    size = _size;
    mass = 1.0f;
    color = ofColor::black;
    type = string();
    is_highlighted = false;
    to_update = true;
    
    debug = false;
    friction = K_FRICTION;
}

Particle::Particle(const ofVec2f &_position, float _charge, float _size, float _mass, const ofColor &_color, const string &_type){
    position = _position;
    speed.set(0.0f);
    charge = _charge;
    size = _size;
    mass = _mass;
    color = _color;
    type = _type;
    is_highlighted = false;
    to_update = true;
    
    debug = false;
    friction = K_FRICTION;
}

void Particle::setPosition(ofVec2f _position){
    position = _position;
}

void Particle::setSize(float _size){
    size = _size;
}

void Particle::draw() {
    if (to_update)
    {
        if(is_highlighted){
            ofSetColor(ofColor::white);
            ofNoFill();
            ofDrawCircle(position, size*1.1f);
        }
        
        ofSetColor(color);
        ofFill();
        ofDrawCircle(position, size);
        if(debug)
            ofDrawLine(position, position+speed);
    }
}

void Particle::solveEulerDiffEq(ofVec2f acceleration, float timestep){
    speed += acceleration * timestep;
    speed *= friction;
    position += speed * timestep;
}

void Particle::checkBorderCollisions(float minX, float maxX, float minY, float maxY){
    if (position.x<minX+size/2.0f)
        position.set(minX+size/2.0f, position.y);
    if (position.y<minY+size/2.0f)
        position.set(position.x, minY+size/2.0f);
    if (position.x>ofGetWidth()-size/2.0f)
        position.set(ofGetWidth()-size/2.0f, position.y);
    if (position.y>ofGetHeight()-size/2.0f)
        position.set(position.x,ofGetHeight()-size/2.0f);
    
    if (position.x>maxX-size/2.0f && position.y>maxY-size/2.0f){
        if (speed.x>speed.y)
            speed.x = -(speed.x+20.0f);
        else
            speed.y = - (speed.y+20.0f) ;
    }
}

void Particle::setColor(const ofColor _c) {
    super::color = _c;
}

ofVec2f Particle::getPosition() {
    return position;
}

ofColor Particle::getColor() {
    return super::color;
}

float Particle::getSize(){
    return size;
}

string Particle::getType(){
    return type;
}

float Particle::getMass(){
    return mass;
}

void Particle::setCharge(float _charge){
    charge =_charge;
}

float Particle::getCharge(){
    return charge;
}

