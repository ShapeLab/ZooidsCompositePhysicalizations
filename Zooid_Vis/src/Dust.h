//
//  Dust.hpp
//  Zooid_Vis
//
//  Created by Mathieu Le Goc on 3/6/18.
//
//

#ifndef Dust_hpp
#define Dust_hpp

#include <stdio.h>
#include "ofMain.h"
#include "Particle.h"
#include "Student.h"

class Dust: public Particle{
private:
    Student& student;
    bool to_update;

public:
    Dust(Student &_student);
    Dust(ofVec2f _position, Student& _student);
    
    bool operator==(const Dust& r);
    bool operator!=(const Dust& r);
    
    bool toBeUpdated();
    void hasToBeUpdated(bool update);
    void setStudent(const Student& _student);
    Student& getStudent();

    void draw();
};

#endif /* Dust_hpp */
