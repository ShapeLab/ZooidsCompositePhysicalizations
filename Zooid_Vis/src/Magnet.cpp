//
//  Magnet.cpp
//  Zooid_Vis
//
//  Created by Mathieu Le Goc on 3/6/18.
//
//

#include "Magnet.h"

Magnet::Magnet() : Particle(){
    type = string();
    mass = 100.0f;
    charge = 10.0f;
    shimmer = 0.0f;
    countingUp = true;
}

Magnet::Magnet(string _type) : Particle(){
    type = _type;
    mass = 100.0f;
    charge = 10.0f;
    shimmer = 0.0f;
    countingUp = false;
}

Magnet::Magnet(string _type, ofColor _color) : Particle(){
    type = _type;
    mass = 100.0f;
    color = _color;
    shimmer = 0.0f;
    countingUp = true;
    charge = 10.0f;
}


void Magnet::draw(){
    ofSetColor(getColor());
    ofFill();
    ofDrawCircle(position, size);

    ofSetColor(ofColor::darkGray);
    ofSetLineWidth(3.0f);
    ofNoFill();
    ofDrawCircle(position, size*1.1f);
}

void Magnet::shimmerColor(){
    if(countingUp)
        shimmer += MAGNET_SHIMMER_INC;
    else
        shimmer -= MAGNET_SHIMMER_INC;
    
    if (shimmer >= 1.0f){
        countingUp = false;
        shimmer = 1.0f;
    }
    else if (shimmer <= 0.0f){
        countingUp = true;
        shimmer = 0.0f;
    }
}

void Magnet::setColor(ofColor _color){
    shimmer = 1.0f;
    super::color = _color;
}

ofColor Magnet::getColor(){
    return ofColor(10,10,10).getLerped(super::color, shimmer);
}

void Magnet::restoreColor(){
    shimmer = 1.0f;
}
