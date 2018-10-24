//
//  parameters.h
//  Zooid_Vis
//
//  Created by Mathieu Le Goc on 3/24/18.
//
//

#ifndef parameters_h
#define parameters_h


#define MSG_ID_DATASET_DATA         0x00
#define MSG_ID_POINT_TO_DISPLAY     0x01
#define MSG_ID_DATASET_TO_LOAD      0x10
#define MSG_ID_DIMENSION_SELECTED   0x11

#define UPDATE_TIMESTEP             1  // in ms
#define K_COLLISION                 2000.0f
#define K_FRICTION                  0.90f

#define MAGNET_SHIMMER_INC          0.025f
#define MAGNET_MAX_CHARGE           20.0f
#define MAGNET_ROTATION_RANGE       180.0f
#define DEADZONE_WIDTH              100.0f

const ofColor myColors[] = {ofColor(200,0,0),
                            ofColor(0,0,200),
                            ofColor(0,200,0),
                            ofColor(128,0,128),
                            ofColor(255,165,0),
                            ofColor(255,255,0),
                            ofColor(255,250,250),
                            ofColor(247,129,191),
                            ofColor(217,217,217),
                            ofColor(188,128,189),
                            ofColor(204,235,197),
                            ofColor(255,237,111)};


const ofColor continentColors[] = {ofColor(166,206,227),
    ofColor(31,120,180),
    ofColor(178,223,138),
    ofColor(51,160,44),
    ofColor(251,154,153),
    ofColor(227,26,28),
    ofColor(253,191,111)};

#endif /* parameters_h */
