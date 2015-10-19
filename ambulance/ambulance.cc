#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <set>
#include <queue>
#include <utility>
#include <algorithm>
#include <math.h>
#include <cmath>
#include <pthread.h>
#include <stdlib.h>
#include <time.h>
#include <limits.h>
#include <cfloat>
#include <stdio.h>

#include <time.h>
#include <assert.h>

using namespace std;

const int numAnts = 100;
const float alpha = 0.1;
const float beta = 9.f;
const float initPhe = 1.f;
const float Q = 1e-4;
const float P = 0.8;

struct patient {
  int id;
  int x;
  int y;
  int time;
  bool saved;

  patient(int i, int X, int Y, int t):id(i), x(X), y(Y), time(t), saved(false) {};
};

struct hospital {
  int id;
  int x;
  int y;
  int numAmbulance;

  hospital(int i, int a):id(i), numAmbulance(a) {};
  hospital() {};
};

struct cluster {
  hospital centroid;
  set<int> nearPatients;
};

struct ambulance {
  int id;
  int startX;
  int startY;
  int endX;
  int endY;
  vector<int> patientsIds;

  ambulance(int i, int x, int y): id(i), startX(x), startY(y), endX(x), endY(y) {};
};

int dist(int x1, int y1, int x2, int y2) {
  return abs(x1 - x2) + abs(y1 - y2);
}

bool patientComp(patient a, patient b) {
  return a.time < b.time;
}

bool hospitalComp(hospital a, hospital b) {
  return a.numAmbulance > b.numAmbulance;
}

bool clusterComp(cluster a, cluster b) {
  return a.nearPatients.size() > b.nearPatients.size();
}
//-------- K-Means -------------
void updateCentroid(cluster c, vector<patient> patients) {
  int xSum = 0, ySum = 0;
  set<int>::iterator it;
  for (it = c.nearPatients.begin(); it != c.nearPatients.end(); it++) {
    xSum += patients[*it].x;
    ySum += patients[*it].y;
  }
  if (c.nearPatients.size()) {
    c.centroid.x = xSum / c.nearPatients.size();
    c.centroid.y = ySum / c.nearPatients.size();
  }
}

bool checkIdentical(cluster a, cluster b) {
  if (a.nearPatients.size() != b.nearPatients.size()) {
    return false;
  }

  //TODO: Might need to update
  set<int>::iterator it;
  for (it = a.nearPatients.begin(); it != a.nearPatients.end(); it++) {
    if (!b.nearPatients.count(*it)) {
      return false;
    }
  }

  return true;
}

void runKMeans(vector<cluster> &groups, vector<patient> &patients) {
  vector<cluster> newGroups;
  for (int i = 0; i < groups.size(); i++) {
    cluster c;
    c.centroid = groups[i].centroid;
    newGroups.push_back(c);
  }

  for (int i = 0; i < patients.size(); i++) {
    int minDist = INT_MAX, newGIdx = -1;
    for (int g = 0; g < newGroups.size(); g++) {
      int dis = dist(newGroups[g].centroid.x, newGroups[g].centroid.y, patients[i].x, patients[i].y);
      if (dis < minDist) {
        minDist = dis;
        newGIdx = g;
      }
    }
    newGroups[newGIdx].nearPatients.insert(i);
  }

  //Update centroid
  for (int i = 0; i < newGroups.size(); i++) {
    updateCentroid(newGroups[i], patients);
  }

  //Check if convergence
  bool conv = true;
  for (int i = 0; i < groups.size(); i++) {
    if (!checkIdentical(groups[i], newGroups[i])) {
      conv = false;
      break;
    }
  }

  if (!conv) {
    groups = newGroups;
    runKMeans(groups, patients);
  }
}

// ----------- ACO -----------------
/**
TODO:
1. Reachable function
2. Attractive function
3. Pheromone function
*/
float newPhe(float pheromone, float added) {
  return (1.f - P) * pheromone + added;
}

int numRescued(vector<ambulance> trucks) {
  int ret = 0;

  for (int i = 0; i < trucks.size(); i++) {
    ret += trucks[i].patientsIds.size();
  }

  return ret;
}

void updatePheromones(vector<ambulance> trucks, map<int, float> &pheromones, int numRescued) {

}

float getProb(float pheromone, int distance, int timeToLive) {
  return pow(pheromone, alpha) * pow(1.f/distance, beta) * (1.f/timeToLive);
}

vector<ambulance> scheduling(vector<ambulance> trucks, vector<hospital> hospitals, vector<patient> patients, map<int, float> pheromones) {
  for (int t = 0; t < trucks.size(); t++) {
    int now = 0, x = trucks[t].startX, y = trucks[t].startY;
    while (1) {
      if (trucks[t].patientsIds.size() >= 4) {
        //TODO: Unload
        continue;
      }
      //TODO: Unload if someone on truck is dying

      vector<pair<float, int> > candidates;
      for (int p = 0; p < patients.size(); p++) {
        if (patients[p].saved) continue;
        int distance = dist(x, y, patients[p].x, patients[p].y);
        if (distance * 2 + 2 + now > patients[p].time)  continue;//Filter out impossible patients

        int id = patients[p].id;
        candidates.push_back(make_pair(getProb(pheromones[id], distance, patients[p].time - now), id));
      }

      if (!candidates.size()) break;

      //TODO: Pick and update
    }
  }

  return trucks;
}

vector<ambulance> antColonyAlgo(vector<ambulance> trucks, vector<hospital> hospitals, vector<patient> patients) {
  map<int, float> pheromones; //Patient Id to amount of pheromones
  for (int i = 0; i < patients.size(); i++) {
    pheromones[i] = initPhe;
  }

  int maxRescued = 0;
  vector<ambulance> bestRoute;
  for (int ant = 0; ant < numAnts; ant++) {
    vector<ambulance> newRoute = scheduling(trucks, hospitals, patients, pheromones);
    int rescued = numRescued(newRoute);
    updatePheromones(newRoute, pheromones, rescued);

    if (rescued > maxRescued) {
      maxRescued = rescued;
      bestRoute = newRoute;
    }
  }

  return bestRoute;
}

// --------- Utilities ------------

int main() {
  vector<patient> patients;
  vector<hospital> hospitals;

  string in("");
  bool p = true;
  int numPs = 0, numHs = 0;
  while ((getline(cin, in))) {
    if (!in.size()) continue;

    if (in.find("person") != string::npos) {
      p = true;
    } else if (in.find("hospital") != string::npos) {
      p = false;
    } else {
      if (p) {
        int x, y, t;
        sscanf(in.c_str(), "%d,%d,%d", &x, &y, &t);
        patients.push_back(patient(numPs, x, y, t));
        numPs++;
      } else {
        int numAmbulance;
        sscanf(in.c_str(), "%d", &numAmbulance);
        hospitals.push_back(hospital(numHs, numAmbulance));
        numHs++;
      }
    }
  }
  sort(patients.begin(), patients.end(), patientComp);
  sort(hospitals.begin(), hospitals.end(), hospitalComp);

  //KMeans stage
  vector<cluster> groups;
  for (int i = 0; i < hospitals.size(); i++) {
    cluster c;
    if (i < patients.size()) {
      c.centroid.x = patients[i].x;
      c.centroid.y = patients[i].y;
    } else {
      c.centroid.x = 0;
      c.centroid.y = 0;
    }
    groups.push_back(c);
  }
  runKMeans(groups, patients);
  vector<ambulance> ambulances;
  int ambulanceId = 0;
  sort(groups.begin(), groups.end(), clusterComp);
  for (int i = 0; i < groups.size(); i++) {
    hospitals[i].x = groups[i].centroid.x;
    hospitals[i].y = groups[i].centroid.y;

    for (int a = 0; a < hospitals[i].numAmbulance; a++) {
      ambulances.push_back(ambulance(ambulanceId, hospitals[i].x, hospitals[i].y));
    }
  }

  return 0;
}
