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
const float Q = 5;
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
  vector<int> saved;

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
float newPhe(float pheromone, float added) {
  return (1.f - P) * pheromone + added;
}

int numRescued(vector<ambulance> trucks) {
  int ret = 0;

  for (int i = 0; i < trucks.size(); i++) {
    ret += trucks[i].saved.size();
  }

  return ret;
}

void updatePheromones(vector<ambulance> trucks, map<int, float> &pheromones, int numRescued) {
  for (int t = 0; t < trucks.size(); t++) {
    for (int p = 0; p < trucks[t].patientsIds.size(); p++) {
      if (pheromones.find(trucks[t].patientsIds[p]) == pheromones.end()) {
        pheromones[trucks[t].patientsIds[p]] = initPhe;
      } else {
        pheromones[trucks[t].patientsIds[p]] = newPhe(pheromones[trucks[t].patientsIds[p]], Q * numRescued);
      }
    }
  }
}

float getProb(float pheromone, int distance, int timeToLive) {
  return pow(pheromone, alpha) * pow(1.f/distance, beta) * (1.f/timeToLive);
}

int unload(ambulance &truck, vector<hospital> hospitals) {
  int minDist = INT_MAX;
  int hospitalIdx = -1;
  for (int i = 0; i < hospitals.size(); i++) {
    int distance = dist(truck.endX, truck.endY, hospitals[i].x, hospitals[i].y);
    if (distance < minDist) {
      minDist = distance;
      hospitalIdx = i;
    }
  }

  truck.endX = hospitals[hospitalIdx].x;
  truck.endY = hospitals[hospitalIdx].y;

  for (int i = 0; i < truck.patientsIds.size(); i++) {
    truck.saved.push_back(truck.patientsIds[i]);
  }
  truck.patientsIds = vector<int>();

  return minDist + 1;
}

bool candidateComp(pair<float, int> a, pair<float, int> b) {
  return a.first < b.first;
}

bool someoneWillDie(ambulance truck, int now, patient p, vector<hospital> hospitals, vector<patient> patients) {
  int pickup = dist(truck.endX, truck.endY, p.x, p.y);
  int minTime = INT_MAX;
  for (int i = 0; i < truck.patientsIds.size(); i++) {
    int id = truck.patientsIds[i];
    minTime = min(patients[id].time - now - pickup, minTime);
  }

  if (minTime < 0)  return true;

  int minDist = INT_MAX;
  for (int i = 0; i < hospitals.size(); i++) {
    minDist = min(minDist, dist(p.x, p.y, hospitals[i].x, hospitals[i].y));
  }
  if (minDist + 1 > minTime) {
    return true;
  } else {
    return false;
  }
}

void onNoOneCanBeSaved(ambulance &truck, vector<hospital> hospitals) {
  if (!truck.patientsIds.size()) {
    unload(truck, hospitals);
  }
}

bool ambulanceFull(ambulance &truck, int &now, vector<hospital> hospitals) {
  if (truck.patientsIds.size() >= 4) {
    now += unload(truck, hospitals);
    return true;
  }

  return false;
}

vector<ambulance> scheduling(vector<ambulance> trucks, vector<hospital> hospitals, vector<patient> patients, map<int, float> pheromones) {
  for (int t = 0; t < trucks.size(); t++) {
    int now = 0;
    while (1) {
      if (ambulanceFull(trucks[t], now, hospitals)) continue;

      vector<pair<float, int> > candidates;
      int minDist = INT_MAX;
      float totalProb = 0.f;
      for (int p = 0; p < patients.size(); p++) {
        if (patients[p].saved) continue;
        int distance = dist(trucks[t].endX, trucks[t].endY, patients[p].x, patients[p].y);
        if (distance * 2 + 2 + now > patients[p].time)  continue;//Filter out impossible patients

        minDist = min(distance, minDist);
        float newProb = getProb(pheromones[p], distance, patients[p].time - now);
        totalProb += newProb;
        candidates.push_back(make_pair(newProb, p));
      }

      //Stop if no one can be saved anymore
      if (!candidates.size()) {
        onNoOneCanBeSaved(trucks[t], hospitals);
        break;
      }

      //Pick one and proceed
      for (int i = 0; i < candidates.size(); i++) {
        candidates[i] = make_pair(candidates[i].first / totalProb, candidates[i].second);
      }
      sort(candidates.begin(), candidates.end(), candidateComp);
      float pick = (rand() % 100) / 100.f;
      int p = candidates.size() - 1;
      for (int i = 0; i < candidates.size(); i++) {
        if (pick < candidates[i].first) {
          p = i;
          break;
        } else {
          pick -= candidates[i].first;
        }
      }
      p = candidates[p].second;
      if (trucks[t].patientsIds.size() && someoneWillDie(trucks[t], now, patients[p], hospitals, patients)) {
        now += unload(trucks[t], hospitals);
      } else {
        now += dist(trucks[t].endX, trucks[t].endY, patients[p].x, patients[p].y);
        trucks[t].endX = patients[p].x;
        trucks[t].endY = patients[p].y;
        patients[p].saved = true;
        trucks[t].patientsIds.push_back(p);
      }
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

int main() {
  srand(time(NULL));
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

  //ACO Stage
  vector<ambulance> test = antColonyAlgo(ambulances, hospitals, patients);
  int num = 0;
  for (int i = 0; i < test.size(); i++) {
    num += test[i].saved.size();
    printf("Ambulance%d: start(%d, %d) end(%d, %d) with %lu\n", i+1, test[i].startX, test[i].startY,
                                                        test[i].endX, test[i].endY, test[i].saved.size());
  }
  printf("Total: %d\n", num);

  return 0;
}
