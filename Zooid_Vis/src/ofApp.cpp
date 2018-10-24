#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
    ofSetFrameRate(60);
    ofBackground(ofColor::lightGray);
    zooidManager.initialize(ofGetWidth(), ofGetHeight());
    zooidManager.useWindowCoordinates();
    datasetLoaded = false;
    
    ofxLibwebsockets::ServerOptions options = ofxLibwebsockets::defaultServerOptions();
    options.port = 9093;
    options.bUseSSL = false; // you'll have to manually accept this self-signed cert if 'true'!
    webServer = new ofxLibwebsockets::Server();
    bool initOk = webServer->setup(options);
    // this adds your app as a listener for the server
    webServer->addListener(this);
}

//--------------------------------------------------------------
void ofApp::update() {
    if (zooidManager.receiveInformation()){
        updateFromZooids();
        
        //store consecutive touch states to create events
        for(int i=0;i<zooidManager.getNbZooids();++i) {
            if(zooidTouches.find(i) == zooidTouches.end()){
                zooidTouches.insert(make_pair(i, make_pair(zooidManager.isZooidTouched(i), zooidManager.isZooidTouched(i))));
            }
            else{
                zooidTouches[i].first = zooidTouches[i].second;
                zooidTouches[i].second = zooidManager.isZooidTouched(i);
            }
        }
        
        vector<DataPoint> zooidsPositions;
        
        if(datasetLoaded){
            //store magnets and idle zooids not in the deadzone to find sandboxes
            for(auto m:magnets) {
                zooidsPositions.push_back(DataPoint(m.first,m.second.getPosition()));
            }
            for(int i:idleZooids) {
                if(!isInDeadzone(zooidManager.getZooidPosition(i)))
                    zooidsPositions.push_back(DataPoint(i, zooidManager.getZooidPosition(i)));
            }
        
            
            //track sandbox
            findSandboxes(zooidsPositions);
            findDustInSandboxes();
            
            //checking for dusts in the deadzone
            for(auto &d:dusts){
                if(isInDeadzone(d.second.getPosition())){
                    if(zooidTouches[d.first].first && !zooidTouches[d.first].second)
                        d.second.hasToBeUpdated(false);
                }
                else
                    d.second.hasToBeUpdated(true);
            }
            //checking for magnets in the deadzone
            for(auto &m:magnets){
                if(isInDeadzone(m.second.getPosition())){
                    if(zooidTouches[m.first].first && !zooidTouches[m.first].second){
                        magnets.erase(magnets.find(m.first));
                        resetColors();
                        break;
                    }
                }
                else{
                    if(!zooidTouches[m.first].first && zooidTouches[m.first].second)
                        highlightDimension(m.second.getType());
                    else if(zooidTouches[m.first].first && !zooidTouches[m.first].second)
                        resetColors();
                }
            }
            updatePhysics();
            placeDustInSandbox();
        }
        
        updateZooids();
        checkInteraction();
    }
}

//--------------------------------------------------------------
void ofApp::placeDustInSandbox(){
    
    //keep robots in the sandbox
    for(auto &s:sandboxes){
        PointSet sandbox_points = s.getPoints();
        ofVec2f i = (sandbox_points.getPointA().getPosition() - sandbox_points.getOrigin().getPosition()).getNormalized();
        ofVec2f j = (sandbox_points.getPointB().getPosition() - sandbox_points.getOrigin().getPosition()).getNormalized();
        
        pair<float, float> minMaxX = findExtremum(s.getXVariable(), 0, dusts.size());
        pair<float, float> minMaxY = findExtremum(s.getYVariable(), 0, dusts.size());
        
        for(auto &id: s.getDustsInSandbox()){
            //start at negative values just for the case of unicharts (1 dimension scatterplot)
            float x = -2.1f * zooidManager.getZooidSize(id);
            float y = -2.1f * zooidManager.getZooidSize(id);
            if(!zooidTouches[id].first && !zooidTouches[id].second){
                //put the right value once i figure out how to store the multidimensional data
                
                // x coordinate
                if(s.getXVariable() != string()){
                    x = getStudentValue(dusts.at(id).getStudent(), s.getXVariable());
                
                    //for the maps, not looking at extrema of the dimension, but just using the absolute
                    if(s.getXVariable() == "longitude")
                        x = ofMap(x, -180.0f, 180.0f, 4.2f*zooidManager.getZooidSize(id), s.getWidth() - 4.2f*zooidManager.getZooidSize(id), true);
                    else if(s.getXVariable() == "latitude")
                        x = ofMap(x, -90.0f, 90.0f, 4.2f*zooidManager.getZooidSize(id), s.getWidth() - 4.2f*zooidManager.getZooidSize(id), true);
                    //otherwise, maps using the extrema in th dataset
                    else
                        x = ofMap(x, minMaxX.first, minMaxX.second,4.2f*zooidManager.getZooidSize(id), s.getWidth() - 4.2f*zooidManager.getZooidSize(id), true);
                }
                else{
                    x += 2.1f * zooidManager.getZooidSize(id);
                }
                //y coordinate
                if(s.getYVariable() != string()){
                    y = getStudentValue(dusts.at(id).getStudent(), s.getYVariable());
                
                    //for the maps, not looking at extrema of the dimension, but just using the absolute
                    if(s.getYVariable() == "longitude")
                        y = ofMap(y, -180.0f, 180.0f,  4.2f*zooidManager.getZooidSize(id), s.getHeight() - 4.2f*zooidManager.getZooidSize(id), true);
                    else if(s.getYVariable() == "latitude")
                        y = ofMap(y, -90.0f, 90.0f,  4.2f*zooidManager.getZooidSize(id), s.getHeight() - 4.2f*zooidManager.getZooidSize(id), true);
                    //otherwise, maps using the extrema in the dataset
                    else
                        y = ofMap(y, minMaxY.first, minMaxY.second,  4.2f*zooidManager.getZooidSize(id), s.getHeight() - 4.2f*zooidManager.getZooidSize(id), true);
                }
                else{
                    y += 2.1f * zooidManager.getZooidSize(id);
                }
                
                ofVec2f newPosition = sandbox_points.getOrigin().getPosition() + i*x + j*y;
                dusts.at(id).setPosition(newPosition);
            }
        }
    }
}

//--------------------------------------------------------------
void ofApp::checkInteraction(){
    static pair<int,float> magnetInitialOrientation = make_pair(-1,0.0f);
    
    for(auto &d:dusts){
        if(zooidTouches[d.first].first != zooidTouches[d.first].second)
            requestDetailOnDemand(d.second.getStudent().getId(), zooidTouches[d.first].second);
    }
    
    for(auto &m:magnets){
        if(!isSandbox(m.first))
            m.second.shimmerColor();
        else
            m.second.restoreColor();
        
        if(zooidTouches[m.first].first != zooidTouches[m.first].second){
            if(zooidTouches[m.first].second){
                magnetInitialOrientation.first = m.first;
                magnetInitialOrientation.second = zooidManager.getZooidOrientation(m.first);
            }
            else{
                magnetInitialOrientation.first = -1;
                magnetInitialOrientation.second = 0.0f;
            }
        }
        if(m.first == magnetInitialOrientation.first && zooidTouches[m.first].first && zooidTouches[m.first].second){
            float delta = zooidManager.getZooidOrientation(m.first) - magnetInitialOrientation.second;
            if(abs(delta)>0.0f){
                float newCharge = ofMap(delta, -MAGNET_ROTATION_RANGE/2.0f, MAGNET_ROTATION_RANGE/2.0f, 0.0f, MAGNET_MAX_CHARGE, true);
                m.second.setCharge(newCharge);
                m.second.setColor(ofColor(10,10,10).lerp(dimensionsColors[m.second.getType()],  m.second.getCharge()/MAGNET_MAX_CHARGE));
                break;
            }
        }
    }
}

//--------------------------------------------------------------
void ofApp::requestDetailOnDemand(unsigned int id, bool activate) {
    StringBuffer s;
    s.Reserve(10000);
    Writer<StringBuffer> writer(s);
    
    writer.StartObject();
    {
        writer.Key("message_id");
        writer.Int(MSG_ID_POINT_TO_DISPLAY);
        
        writer.Key("point_id");
        writer.Int(id);
        writer.Key("action");
        writer.String(activate?"show":"hide");
    }
    writer.EndObject();
    //    cout<<"Touch on Zooid#"<<id<<", "<<(activate?"showing":"hiding")<< " details"<<endl;
    sendMessageToClient(s.GetString());
}

//--------------------------------------------------------------
void ofApp::requestDetailOnDemand(vector<int>& ids) {
    StringBuffer s;
    s.Reserve(10000);
    Writer<StringBuffer> writer(s);
    
    writer.StartObject();
    {
        writer.Key("message_id");
        writer.Int(MSG_ID_POINT_TO_DISPLAY);
        
        writer.Key("points_ids");
        writer.StartArray();
        {
            for(auto i:ids)
                writer.Int(i);
        }
        writer.EndArray();
    }
    writer.EndObject();
    
    sendMessageToClient(s.GetString());
}

//--------------------------------------------------------------
void ofApp::findSandboxes(vector<DataPoint>& points) {
    
    sandboxes.clear();

//    look at existing sandboxes and make sure points are still well positioned
//    if not then delete the sandbox
//    for(auto s:sandboxes){
//        PointSet p;
//        p.getOrigin().setPosition(zooidManager.getZooidPosition(s.getPoints().getOrigin().getId()));
//        p.getPointA().setPosition(zooidManager.getZooidPosition(s.getPoints().getPointA().getId()));
//        p.getPointB().setPosition(zooidManager.getZooidPosition(s.getPoints().getPointB().getId()));
//        
//        s.setPoints(p);
//    }
    
    
    
    if(magnets.size()>0 && points.size()>=3) {
        int origin_index = 0;
        
        while(origin_index < points.size() && points.size() >= 3){
            vector<pair<int, float>> angles;
            for(int j=(origin_index+1) % points.size() ; j!=origin_index ; j = (j+1) % points.size()){
                ofVec2f v1 = points[origin_index].getPosition() - points[j].getPosition();
                angles.push_back(pair<int, float>(j, ofRadToDeg(atan2(v1.y, v1.x))));
            }
            
            sort(angles.begin(), angles.end(), sortbysec);
            
            //two iterators to cross the vector of angles pair by pair
            vector<pair<int, float>>::iterator p1 = angles.begin();
            vector<pair<int, float>>::iterator p2 = angles.begin()+1;
            
            while(p1 != angles.end()-1){
                //look at the difference of angle with the horizontal until reaching 90deg
                float alpha = (*p2).second - (*p1).second;
                float length1 = (points[(*p1).first].getPosition()-points[origin_index].getPosition()).length();
                float length2 = (points[(*p2).first].getPosition()-points[origin_index].getPosition()).length();
                
                // right angle
                if(abs(abs(alpha) - 90.0f) <= angleTolerance && !isMagnet(points[origin_index].getId())) {
                    
                    Sandbox tmpSandbox(sandboxes.size());
                    ///put the long side as the x axis
//                    if(length1>length2)
                    tmpSandbox.setPoints(PointSet(points[origin_index], points[(*p1).first], points[(*p2).first]));
//                    else
//                        tmpSandbox.setPoints(PointSet(points[origin_index], points[(*p2).first], points[(*p1).first]));
                    
                    SandboxType type = tmpSandbox.findType();
                    
                    if(type == SandboxType::scatterplot){
                        //if at least one A or B is a magnet
                        if(isMagnet(tmpSandbox.getPoints().getPointB().getId())){
                            //get pointB - magnet's type
                            //B is the X axis
                            tmpSandbox.setXVariable(magnets[tmpSandbox.getPoints().getPointB().getId()].getType());
                        }
                        if(isMagnet(tmpSandbox.getPoints().getPointA().getId())){
                            //get pointA - magnet's type
                            //check that the magnet exists
                            //A is the Y axis
                            tmpSandbox.setYVariable(magnets[tmpSandbox.getPoints().getPointA().getId()].getType());
                        }
                        
                        sandboxes.push_back(tmpSandbox);
                        //find and delete the three points from the list to avoid further processing on them
                        int ido = points[origin_index].getId();
                        int ida = points[(*p1).first].getId();
                        int idb = points[(*p2).first].getId();
                        
                        auto it = find_if(points.begin(), points.end(), [&ido](DataPoint &p) { return p.getId() == ido; });
                        if (it != points.end()) points.erase(it);
                        it = find_if(points.begin(), points.end(), [&ida](DataPoint &p) { return p.getId() == ida; });
                        if (it != points.end()) points.erase(it);
                        it = find_if(points.begin(), points.end(), [&idb](DataPoint &p) { return p.getId() == idb; });
                        if (it != points.end()) points.erase(it);
                        
                        //start over with the remaining points
                        origin_index=-1;
                        break;
                    }
                    else{
                        ++p2;
                        if(p2==angles.end())
                            p2 = ++p1+1;
                    }
                }
                // acute angle, angles are too small, move p2
                else if(alpha < 90.0f - angleTolerance){
                    ++p2;
                    if(p2==angles.end())
                        p2 = ++p1+1;
                }
                //obtus angle, angles are now too large, move p1 forward
                else{
                    p2 = ++p1+1;
                }
            }
            origin_index++;
        }
    }
}

//--------------------------------------------------------------
void ofApp::findDustInSandboxes(){
    //check if the remaining zooids are in the sandboxes
    for(auto &s:sandboxes){
        for(auto &d:dusts){
            if(s.isInside(d.second.getPosition()))
                s.addDustInSandbox(d.first);
            else
                s.removeDustFromSandbox(d.first);
        }
    }
}

//--------------------------------------------------------------
bool ofApp::isDust(unsigned int id){
    return dusts.find(id) != dusts.end();
}

//--------------------------------------------------------------
bool ofApp::isMagnet(unsigned int id){
    if(magnets.find(id) != magnets.end())
        return true;
    else
        return false;
}

//--------------------------------------------------------------
bool ofApp::isIdle(unsigned int id){
    return find(idleZooids.begin(), idleZooids.end(), id) != idleZooids.end();
}

//--------------------------------------------------------------
bool ofApp::isSandbox(unsigned int id){

    for(auto s:sandboxes){
        if(s.getPoints().getOrigin().getId() == id ||
           s.getPoints().getPointA().getId() == id ||
           s.getPoints().getPointB().getId() == id)
            return true;
    }
    return false;
}

//--------------------------------------------------------------
bool ofApp::isInDeadzone(ofVec2f p){
    return p.x < DEADZONE_WIDTH;
}

//--------------------------------------------------------------
ofVec2f ofApp::calculateSumOfForces(Dust currentDust){
    
    ofVec2f sumOfForces(0.0f);
    
    //collisions with other dusts
    for(auto d:dusts){
        if (d.second != currentDust && d.second.toBeUpdated()) {
            ofVec2f force = currentDust.getPosition() - d.second.getPosition();
            float distance = force.length();
            float minimumDistance = 1.5f*(d.second.getSize() + currentDust.getSize());
            
            if (distance < minimumDistance){
                force *= (minimumDistance - distance) * K_COLLISION;
                sumOfForces += force;
            }
        }
    }
    
    //collision with magnets
    for(auto m:magnets) {
        ofVec2f force = currentDust.getPosition() - m.second.getPosition();
        float distance = force.length();
        float minimumDistance = m.second.getSize() + currentDust.getSize();
        
        if (distance < minimumDistance){
            force *= (minimumDistance - distance) * K_COLLISION;
            sumOfForces += force;
        }
    }
    
    //attraction from magnets
    for(auto m:magnets) {
        if (m.second.getType() != string() && !isSandbox(m.first)){
            ofVec2f force = (m.second.getPosition() - currentDust.getPosition());
            float distance = force.length();
            force.normalize();
            
            float grade = 0.05f+getScaledStudentValue(currentDust.getStudent(), m.second.getType());
            force *= 10.0f * m.second.getCharge() * grade * distance;
            
            float maxD = 5.0f*(m.second.getSize() + currentDust.getSize()) + 150.0f * (1.0f-grade);
            if(distance > maxD)
                sumOfForces += force;
            else
                sumOfForces -= force;
        }
    }
    return sumOfForces;
}

//--------------------------------------------------------------
ofVec2f ofApp::calculateSumOfForces(Magnet currentMagnet){
    
    
    return ofVec2f(0.0f);
}

//--------------------------------------------------------------
void ofApp::updatePhysics(){
    static unsigned long previousTimestep = ofGetElapsedTimeMillis();
    unsigned long remainingTime = ofGetElapsedTimeMillis() - previousTimestep;
    
    while (remainingTime >= UPDATE_TIMESTEP){
        for (int i=0; i<dusts.size(); i++) {
            if (dusts.at(i).toBeUpdated()){
                dusts.at(i).solveEulerDiffEq(calculateSumOfForces(dusts.at(i))/dusts.at(i).getMass(), 0.001f);
            }
        }
    
        remainingTime -= UPDATE_TIMESTEP;
    }
    previousTimestep = ofGetElapsedTimeMillis();
}

//--------------------------------------------------------------
void ofApp::updateFromZooids(){
    idleZooids.clear();
    
    //looking for idle zooids, starting with saving everything
    //and
    for(int i=0;i<zooidManager.getNbZooids();++i)
        idleZooids.push_back(i);
    
    
    for(auto &d:dusts){
        if(d.second.getPosition() == ofVec2f(0.0f) || zooidManager.isZooidTouched(d.first))
            d.second.setPosition(zooidManager.getZooidPosition(d.first));
        d.second.setSize(zooidManager.getZooidSize(d.first));
        
        auto it = find(idleZooids.begin(),idleZooids.end(),d.first);
        if(it != idleZooids.end())
            idleZooids.erase(it);
    }
    
    for(auto &m:magnets){
        m.second.setPosition(zooidManager.getZooidPosition(m.first));
        m.second.setSize(zooidManager.getZooidSize(m.first));
        auto it = find(idleZooids.begin(),idleZooids.end(),m.first);
        if(it != idleZooids.end())
            idleZooids.erase(it);
    }
    
    ///////////////////////
    // TODO !!!!! make sure that sandboxes' points update well !!
    // not sure witht the references
    ///////////////////////
    for(auto s:sandboxes){
        PointSet p;
        p.getOrigin().setPosition(zooidManager.getZooidPosition(s.getPoints().getOrigin().getId()));
        p.getPointA().setPosition(zooidManager.getZooidPosition(s.getPoints().getPointA().getId()));
        p.getPointB().setPosition(zooidManager.getZooidPosition(s.getPoints().getPointB().getId()));
        
        s.setPoints(p);
    }
}

//--------------------------------------------------------------
void ofApp::updateZooids(){
    
    //sync the zooids
    for(auto d:dusts){
        //        zooidManager.updateZooid(d.first, zooidManager.getZooidPosition(d.first), d.second.getColor());
        zooidManager.updateZooid(d.first, d.second.getPosition(), d.second.getColor());
    }
    for(auto &m:magnets){
        zooidManager.updateZooid(m.first, m.second.getPosition(), m.second.getColor(), false);
    }
    for(int i=0;i<idleZooids.size();++i){
        ofVec2f p(50.0f + (float)(i%2)*3.0f*zooidManager.getZooidSize(idleZooids[i]), 50.0f+float(i)*2.5f*zooidManager.getZooidSize(idleZooids[i]));
        zooidManager.updateZooid(idleZooids[i], p, ofColor::black, true);
    }
    //deactivate sandboxes zooids to prevent them from moving
    for(auto &s:sandboxes) {
        zooidManager.deactivateZooid(s.getPoints().getOrigin().getId());
        zooidManager.deactivateZooid(s.getPoints().getPointA().getId());
        zooidManager.deactivateZooid(s.getPoints().getPointB().getId());
    }
    
    //send updates
    zooidManager.sendUpdates();
}

//--------------------------------------------------------------
bool ofApp::loadDataset(const string &file_path){
    ofxCsv csv;
    dimensionsColors.clear();
    students.clear();
    dusts.clear();
    magnets.clear();
    datasetLoaded = false;
    
    if(file_path == "student-dataset" && csv.load(file_path+".csv")) {
        for(int j=0;j<csv.getNumCols();++j){
            dimensionsColors.insert(make_pair(csv[0][j], ofColor(0)));
        }
        
        dimensionsColors["english.grade"] = myColors[0];
        dimensionsColors["sciences.grade"] = myColors[1];
        dimensionsColors["math.grade"] = myColors[2];
        dimensionsColors["portfolio.rating"] = myColors[3];
        dimensionsColors["coverletter.rating"] = myColors[4];
        dimensionsColors["refletter.rating"] = myColors[5];
        dimensionsColors["age"] = myColors[6];
        dimensionsColors["language.grade"] = myColors[7];
        
        students.reserve(csv.getNumRows()-1);
        dusts.reserve(csv.getNumRows()-1);
        
        int count=0;
        //        for(int i=1;i<=zooidManager.getNbZooids()-5;++i){
        for(int i=1;i<=csv.getNumRows()-1;++i){
            Student s(stoi(csv[i][0]), csv[i][1], csv[i][2], csv[i][3],
                      ofVec2f(stof(csv[i][4]), stof(csv[i][5])), stringToGender(csv[i][6]), stoi(csv[i][8]));
            for(int j=9;j<=15;++j){
                s.addGrade(csv[0][j], stof(csv[i][j]));
            }
            
            if(s.getGrade("math.grade")>=3.7f &&
               s.getGrade("sciences.grade")>=3.7f &&
               s.getGrade("english.grade")>=3.7f &&
               students.size() < min(24,zooidManager.getNbZooids()-5)
               ){
                students.push_back(s);
                dusts.insert(make_pair(dusts.size(),
                                       Dust(ofVec2f(ofRandom(100.0f, ofGetWidth()-100.0f),
                                                    ofRandom(100.0f, ofGetHeight()-100.0f)), students.at(students.size()-1))));
                
            }
            
        }
        resetColors();
        sendMessageToClient(exportStudents());
        
        datasetLoaded = true;
        return true;
    }
    else
        return false;
}

//--------------------------------------------------------------
string ofApp::exportStudents(){
    StringBuffer s;
    s.Reserve(10000);
    Writer<StringBuffer> writer(s);
    
    writer.StartObject();{
        writer.Key("message_id");
        writer.Int(MSG_ID_DATASET_DATA);
        writer.Key("dataset");
        writer.String("students");
        writer.Key("nb_students");
        writer.Int(students.size());
        
        writer.Key("students");
        writer.StartArray();
        {
            for(auto s:students){
                writer.StartObject();
                {
                    writer.Key("id");
                    writer.Int(s.getId());
                    writer.Key("name");
                    writer.String(s.getName().data());
                    writer.Key("nationality");
                    writer.String(s.getNationality().data());
                    writer.Key("city");
                    writer.String(s.getCity().data());
                    writer.Key("city_coordinates");
                    writer.StartArray();
                    {
                        writer.Double((double(s.getCityCoordinates().x)));
                        writer.Double((double(s.getCityCoordinates().y)));
                    }
                    writer.EndArray();
                    writer.Key("gender");
                    writer.String(genderToString(s.getGender()).data());
                    writer.Key("age");
                    writer.Int(s.getAge());
                    
                    writer.Key("grades");
                    writer.StartArray();
                    {
                        for(auto g:s.getCourses()){
                            writer.String(g.data());
                            writer.Double(s.getGrade(g));
                        }
                    }
                    writer.EndArray();
                }
                writer.EndObject();
            }
        }
        writer.EndArray();
    }
    writer.EndObject();
    
    cout<<"Dataset exported to client"<<endl;
    
    return s.GetString();
}

//--------------------------------------------------------------
void ofApp::sendMessageToClient(const string &msg){
    webServer->send(msg);
}

//--------------------------------------------------------------
void ofApp::highlightDimension(const string &dimension) {
    cout<<"Highlighting "<<dimension<<endl;
    
    if(dimension == "age"){
        pair<float, float> minMax = findExtremum(dimension, 0, dusts.size());
        
        for(auto &d:dusts) {
            float value = students[d.first].getAge()/(minMax.second-minMax.first) - minMax.first/(minMax.second-minMax.first) ;
            d.second.setColor(ofColor::darkGrey.getLerped(dimensionsColors[dimension], value));
        }
    }
    else if(dimension == "gender"){
        for(auto &d:dusts) {
            if(d.second.getStudent().getGender() == Gender::female)
                d.second.setColor(ofColor::deepPink);
            else if(d.second.getStudent().getGender() == Gender::male)
                d.second.setColor(ofColor::darkBlue);
            else
                d.second.setColor(ofColor::grey);
        }
    }
    else if(dimension.find("grade")!=string::npos || dimension.find("rating")!=string::npos){
        pair<float, float> minMax = findExtremum(dimension, 0, dusts.size());
        for(auto &d:dusts) {
            //get a normalize value of the grade between the min and max of the dataset
            float value = students[d.first].getGrade(dimension)/(minMax.second-minMax.first) - minMax.first/(minMax.second-minMax.first);
            d.second.setColor((ofColor(0).getLerped(dimensionsColors[dimension], 0.05f)).getLerped(dimensionsColors[dimension], value));
        }
    }
    
    else if(dimension == "nationality"){
        
    }
}

//--------------------------------------------------------------
void ofApp::resetColors(){
    for(auto &d:dusts) {
        d.second.setColor(ofColor(10,10,10));
    }
}

//--------------------------------------------------------------
pair<float,float> ofApp::findExtremum(const string &dimension){
    return findExtremum(dimension, 0, dusts.size());
}

//------------------------------------------- -------------------
pair<float,float> ofApp::findExtremum(const string &dimension, int start, int end){
    pair<float, float> minMax = make_pair(0.0f, 0.0f);
    
    if(start >= 0 && end <= dusts.size()){
        if(dimension == "age"){
            minMax.first = minMax.second = dusts.at(start).getStudent().getAge();
            for(int i=start+1;i<end;++i) {
                if(dusts.at(i).getStudent().getAge() > minMax.second)
                    minMax.second = dusts.at(i).getStudent().getAge();
                if(dusts.at(i).getStudent().getAge() < minMax.first)
                    minMax.first = dusts.at(i).getStudent().getAge();
            }
        }
        else if(dimension.find("grade")!=string::npos || dimension.find("rating")!=string::npos){
            minMax.first = minMax.second = dusts.at(start).getStudent().getGrade(dimension);
            for(int i=start+1;i<end;++i) {
                float grade = dusts.at(i).getStudent().getGrade(dimension);
                if(dusts.at(i).getStudent().getGrade(dimension) > minMax.second)
                    minMax.second = dusts.at(i).getStudent().getGrade(dimension);
                if(dusts.at(i).getStudent().getGrade(dimension) < minMax.first)
                    minMax.first = dusts.at(i).getStudent().getGrade(dimension);
            }
        }
    }
    return minMax;
}

//--------------------------------------------------------------
void ofApp::makeMagnet(int id, const string &dimension){
    
    if(isIdle(id))
    {
        magnets.insert(make_pair(id, Magnet(dimension, dimensionsColors[dimension])));
        magnets[id].setPosition(magnets[id].getPosition()+ofVec2f(DEADZONE_WIDTH,0.0f));
        idleZooids.erase(find(idleZooids.begin(), idleZooids.end(),id));
        cout<<"Created magnet "<<dimension<<" with Zooid#"<<id<<endl;
    }
    
}

//--------------------------------------------------------------
int ofApp::findFirstTouchedZooid(){
    for(auto z:zooidTouches){
        if(z.second.first && z.second.second)
            return z.first;
    }
    return -1;
}

//--------------------------------------------------------------
void ofApp::processClientMessage(string &message){
    
    Document clientMsg;
    if(!clientMsg.ParseInsitu(&message[0]).HasParseError()){
        if (clientMsg.HasMember("message_id")){
            int messageId = clientMsg["message_id"].GetInt();
            
            switch(messageId){
                case MSG_ID_DATASET_TO_LOAD:
                    if(/*findFirstTouchedZooid() > -1 &&*/ clientMsg.HasMember("dataset"))
                        loadDataset(clientMsg["dataset"].GetString());
                    break;
                case MSG_ID_DIMENSION_SELECTED:
                    if(clientMsg.HasMember("dimension")){
                        
                        //find the first idle zooid touched
                        int touchedIdleZooid=-1;
                        for(int i:idleZooids){
                            if(zooidManager.isZooidTouched(i)){
                                touchedIdleZooid = i;
                                break;
                            }
                        }
                        
                        // if no idle zooid was touched then
                        // set all the points color the shade of the color matching
                        if(clientMsg.HasMember("action") && strcmp(clientMsg["action"].GetString(),"show")==0){
                            bool magnetExists = false;
                            for(auto &m:magnets){
                                if(m.second.getType()==clientMsg["dimension"].GetString())
                                    magnetExists = true;
                            }
                            if(!magnetExists && touchedIdleZooid != -1 &&
                               strcmp(clientMsg["dimension"].GetString(), "age") != 0 &&
                               strcmp(clientMsg["dimension"].GetString(), "gender") != 0 &&
                               strcmp(clientMsg["dimension"].GetString(), "name") != 0){
                                makeMagnet(touchedIdleZooid, clientMsg["dimension"].GetString());
//                                makeMagnet(idleZooids.front(), clientMsg["dimension"].GetString());
                            }
                            else{
                                highlightDimension(clientMsg["dimension"].GetString());
                            }
                        }
                        else{
                            resetColors();
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }
}

//--------------------------------------------------------------
float ofApp::getStudentValue(Student &s, const string &dimension){
    float result = 0.0f;
    
    if(dimension.find("grade") != string::npos || dimension.find("rating") != string::npos)
        result = s.getGrade(dimension);
    else if(dimension == "age")
        result = s.getAge();
    else if(dimension == "longitude")
        result = s.getCityCoordinates().x;
    else if(dimension == "latitude")
        result = s.getCityCoordinates().y;
    return result;
}

//--------------------------------------------------------------
float ofApp::getScaledStudentValue(Student &s, const string &dimension){
    float result = 0.0f;
    
    if(dimension.find("grade") != string::npos || dimension.find("rating") != string::npos){
        pair<float, float> minMax = findExtremum(dimension, 0, dusts.size());
        result = (s.getGrade(dimension)/(minMax.second-minMax.first) - minMax.first/(minMax.second-minMax.first));
    }
    else if(dimension == "age"){
        pair<float, float> minMax = findExtremum(dimension, 0, dusts.size());
        result = 1.0f - (s.getAge()/(minMax.second-minMax.first) - minMax.first/(minMax.second-minMax.first));
        
    }
    
    return result;
}

//--------------------------------------------------------------
void ofApp::draw(){
    ofFill();
    ofSetColor(ofColor::slateGray);
    ofDrawRectangle(0.0f, 0.0f, DEADZONE_WIDTH, ofGetHeight());
    
    for(auto m:magnets)
        m.second.draw();
    
    for(auto d:dusts)
        d.second.draw();
    
    ofSetColor(ofColor::darkGrey);
    ofFill;
    for(int i=0;i<zooidManager.getNbZooids();++i) {
        ofDrawCircle(zooidManager.getZooidPosition(i), 3.0f);
    }
    
    for(auto s:sandboxes){
        s.draw();
        ofSetColor(ofColor::azure);
        for(auto i:s.getDustsInSandbox()){
            ofDrawCircle(dusts.at(i).getPosition(), 5.0f);
        }
    }
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){
    
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){
    
}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){
    
}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){
}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button) {
}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){
    
}

//--------------------------------------------------------------
void ofApp::mouseEntered(int x, int y){
    
}

//--------------------------------------------------------------
void ofApp::mouseExited(int x, int y){
    
}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){
    zooidManager.setWindowSize(w, h);
}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){
    
}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){
    
}

//--------------------------------------------------------------
void ofApp::onConnect( ofxLibwebsockets::Event& args ){
    //    cout<<"on connected"<<endl;
}

//--------------------------------------------------------------
void ofApp::onOpen( ofxLibwebsockets::Event& args ){
    cout<<"new connection open: "<<  args.conn.getClientIP() << ", " << args.conn.getClientName() << endl;
    clientConnected = true;
}

//--------------------------------------------------------------
void ofApp::onClose( ofxLibwebsockets::Event& args ){
    cout<<"on close"<<endl;
    clientConnected = false;
}

//--------------------------------------------------------------
void ofApp::onIdle( ofxLibwebsockets::Event& args ){
    //    cout<<"on idle"<<endl;
}

//--------------------------------------------------------------
void ofApp::onMessage( ofxLibwebsockets::Event& args ){
    transform(args.message.begin(), args.message.end(), args.message.begin(), ::tolower);
    processClientMessage(args.message);
}

//--------------------------------------------------------------
void ofApp::onBroadcast( ofxLibwebsockets::Event& args ){
    //    cout<<"got broadcast "<<args.message<<endl;
}
