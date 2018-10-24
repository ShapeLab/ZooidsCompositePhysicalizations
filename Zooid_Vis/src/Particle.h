//
//  Particle.hpp
//  Zooid_Vis
//
//  Created by Mathieu Le Goc on 3/6/18.
//
//

#ifndef Particle_hpp
#define Particle_hpp

#include <stdio.h>
#include "ofMain.h"
#include "parameters.h"


class Particle
{
protected:
    typedef Particle super;
    
    ofVec2f position;
    ofVec2f speed;
    float charge;
    float size;
    float mass;
    ofColor color;
    string type;
    bool is_highlighted;
    bool to_update;
    
    /*static*/ bool debug;
    /*static*/ float friction;
    
public:
    Particle();
    Particle(float _size);
    Particle(ofVec2f _position, float _charge, float _size, string _type, ofColor _color);

    Particle(const ofVec2f &_position, float _charge, float _size, float _mass, const ofColor &_color, const string &_type);
    void setPosition(ofVec2f _position);
    void draw();
    void solveEulerDiffEq(ofVec2f acceleration, float timestep);
    void checkBorderCollisions(float minX, float maxX, float minY, float maxY);
    void setColor(ofColor _c);
    
    ofVec2f getPosition();
    ofColor getColor();
    float getSize();
    string getType();
    float getMass();
    float getCharge();
    void setSize(float _size);
    void setCharge(float _charge);
    
    
};

#endif /* Particle_hpp */
