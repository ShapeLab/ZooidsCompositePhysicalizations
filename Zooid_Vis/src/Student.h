//
//  Student.h
//  Zooid_Vis
//
//  Created by Mathieu Le Goc on 3/6/18.
//
//

#ifndef Student_hpp
#define Student_hpp

#include <stdio.h>
#include "ofMain.h"
#include "parameters.h"

enum class Gender {male=0, female, other};

inline Gender stringToGender(const string &_str) {
    if(_str == "F")
        return Gender::female;
    else if(_str == "M")
        return Gender::male;
    else
        return Gender::other;
}

inline string genderToString(Gender g) {
    if(g == Gender::female)
        return "F";
    else if(g == Gender::male)
        return "M";
    else
        return "other";
}

class City{
private:
    string name;
    ofVec2f coordinates;
public:
    City();
    City(const string &_name, const ofVec2f &_coordinates);
    void operator=(const City &other);
    
    void setName(const string &_name);
    void setCoordinates(const ofVec2f &_coordinates);
    string &getName();
    ofVec2f &getCoordinates();
};

class Student{
private:
    unsigned int id;
    unsigned int age;
    string name;
    string nationality;
    City city;
    Gender gender;
    unordered_map<string, float> grades;
    
public:
    Student();
    Student(unsigned int id, const string &_name, const string &_nationality, const string &_city_name, const ofVec2f &_city_coordinates, Gender _gender, unsigned int _age);
    
    void operator=(const Student &other);
    string toString();
    string &getName();
    unsigned int getAge();
    Gender getGender();
    string &getCity();
    ofVec2f &getCityCoordinates();
    string &getNationality();
    unsigned int getId();
    
    void setAge(unsigned int _age);
    void setName(const string _name);
    void setGender(Gender _gender);
    void setCity(const City &_city);
    void setNationality( const string &_nationality);
    
    void addGrade(const string &course, float grade);
    float getGrade(const string &course);
    bool removeGrade(const string &course);
    vector<string> getCourses();
};

#endif /* Student_hpp */
