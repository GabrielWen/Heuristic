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

struct patient {
  int id;
  int x;
  int y;
  int time;

  patient(int i, int X, int Y, int t):id(i), x(X), y(Y), time(t) {};
};

struct hospital {
  int id;
  int x;
  int y;
  int numAmbulance;

  hospital(int i, int a):id(i), numAmbulance(a) {};
};

struct cluster {
  hospital *centroid;
  set<int> nearPatients;
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

//-------- K-Means -------------
void updateCentroid(cluster c, vector<patient> patients) {
  int xSum = 0, ySum = 0;
  set<int>::iterator it;
  for (it = c.nearPatients.begin(); it != c.nearPatients.end(); it++) {
    xSum += patients[*it].x;
    ySum += patients[*it].y;
  }
  if (c.nearPatients.size()) {
    c.centroid->x = xSum / c.nearPatients.size();
    c.centroid->y = ySum / c.nearPatients.size();
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

/**
TODO:
1. Take ambulance count into consideration
2. Take reackable patients into consideration
*/
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
      int dis = dist(newGroups[g].centroid->x, newGroups[g].centroid->y, patients[i].x, patients[i].y);
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
  for (int i = 0; i < (patients.size() > hospitals.size() ? hospitals.size() : patients.size()); i++) {
    hospitals[i].x = patients[i].x;
    hospitals[i].y = patients[i].y;
  }

  //KMeans stage
  vector<cluster> groups;
  for (int i = 0; i < hospitals.size(); i++) {
    cluster c;
    c.centroid = &hospitals[i];
    groups.push_back(c);
  }
  runKMeans(groups, patients);
  
  return 0;
}
