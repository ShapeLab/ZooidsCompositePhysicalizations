//
//  Magnet.hpp
//  Zooid_Vis
//
//  Created by Mathieu Le Goc on 3/6/18.
//
//

#ifndef Magnet_hpp
#define Magnet_hpp

#include <stdio.h>
#include "ofMain.h"
#include "Particle.h"

class Magnet : public Particle{
private:
    bool isBeingMoved;
    bool isResizable;
    float shimmer;
    bool countingUp;
public:
    Magnet();
    Magnet(string _type);
    Magnet(string _type, ofColor _color);

    void draw();
    void shimmerColor();
    ofColor getColor();

    void setColor(ofColor _color);
    void restoreColor();
};

#endif /* Magnet_hpp */
