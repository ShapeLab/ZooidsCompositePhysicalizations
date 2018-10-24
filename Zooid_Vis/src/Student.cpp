//
//  Student.cpp
//  Zooid_Vis
//
//  Created by Mathieu Le Goc on 3/6/18.
//
//

#include "Student.h"


City::City(){
    name = string();
    coordinates.set(0.0f);
}

City::City(const string &_name, const ofVec2f &_coordinates) {
    name = _name;
    coordinates = _coordinates;
}

void City::operator=(const City &other) {
    name = other.name;
    coordinates = other.coordinates;
}

void City::setName(const string &_name) {
    name = _name;
}

void City::setCoordinates(const ofVec2f &_coordinates) {
    coordinates = _coordinates;
}

string& City::getName() {
    return name;
}

ofVec2f& City::getCoordinates() {
    return coordinates;
}

Student::Student() {
    id = 0;
    age = 0;
    name = string();
    city = City(string(), ofVec2f(0.0f));
    gender = Gender::other;
}

Student::Student(unsigned int _id, const string &_name, const string &_nationality, const string &_city_name, const ofVec2f &_city_coordinates, Gender _gender, unsigned int _age){
    id = _id;
    name = _name;
    nationality = _nationality;
    city = City(_city_name, _city_coordinates);
    gender = _gender;
    age = _age;
}

void Student::operator=(const Student &other){
    name = other.name;
    age = other.age;
    city = other.city;
    gender = other.gender;
    grades = other.grades;
}

string Student::toString(){
    return to_string(id)+"-"+name+"-"+genderToString(gender)+"-"+to_string(age)+"-"+nationality;
}


string& Student::getName(){
    return name;
}

unsigned int Student::getAge(){
    return age;
}

Gender Student::getGender(){
    return gender;
}

string& Student::getCity() {
    return city.getName();
}

string& Student::getNationality(){
    return nationality;
}

unsigned int Student::getId(){
    return id;
}

ofVec2f& Student::getCityCoordinates() {
    return city.getCoordinates();
}

void Student::setAge(unsigned int _age) {
    age = _age;
}

void Student::setName(const string _name){
    name = _name;
}

void Student::setGender(Gender _gender) {
    gender = _gender;
}

void Student::setCity(const City &_city){
    city = _city;
}

void Student::setNationality( const string &_nationality){
    nationality = _nationality;
}

void Student::addGrade(const string &course, float grade){
    auto g = grades.find(course);
    if(g == grades.end())
        grades.insert(make_pair(course, grade));
    else
        g->second = grade;
}

float Student::getGrade(const string &course){
    auto g = grades.find(course);
    if(g != grades.end())
        return g->second;
    else
        return 0.0f;
}

bool Student::removeGrade(const string &course){
    auto g = grades.find(course);
    if(g != grades.end()){
        grades.erase(g);
        return true;
    }
    else
        return false;
}

vector<string> Student::getCourses(){
    vector<string> keys;
    keys.reserve(grades.size());
    
    for(auto k : grades) {
        keys.push_back(k.first);
    }
    return keys;
}
