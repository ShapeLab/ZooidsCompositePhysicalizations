//
//  Dust.cpp
//  Zooid_Vis
//
//  Created by Mathieu Le Goc on 3/6/18.
//
//

#include "Dust.h"


Dust::Dust(Student& _student) : Particle(), student(_student) {
    super::color = ofColor::darkGray;
    to_update = true;
}

Dust::Dust(ofVec2f _position, Student& _student) : Particle(), student(_student) {
    super::position = _position;
    super::color = ofColor::darkGray;
    to_update = true;
}

bool Dust::operator==(const Dust& d){
    return this->position == d.position;
}

bool Dust::operator!=(const Dust& r) {
    return !(*this == r);
}

void Dust::hasToBeUpdated(bool update){
    to_update = update;
}

bool Dust::toBeUpdated(){
    return to_update;
}

void Dust::setStudent(const Student& _student){
    student = _student;
}

Student& Dust::getStudent(){
    return student;
}

void Dust::draw(){
    
    super::draw();
    ofSetColor(ofColor::dimGray);
    ofSetLineWidth(1.0f);
    ofNoFill();
    ofDrawCircle(position, size*1.1f);
}
