#include <iostream>
#include <vector>
#include <set>
#include <float.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <algorithm>

using namespace std;

float exactScore(vector<int> denoms, void* obj);
float exchangeScore(vector<int> denoms, void* obj);

class Solution {
private:
  float N; //Assigned value
  int maxVal;
  int numDoms;
  float bestScore;
  vector<int> bestDenoms;
  int numTry;
  float (*getScore)(vector<int>, void*);

public:
  Solution(float n, int questionNum) : N(n), maxVal(239), numDoms(7), bestScore(FLT_MAX), numTry(7) {
    if (questionNum == 1) {
      getScore = &exactScore;
    } else {
      getScore = &exchangeScore;
    }
  }

  float test() {
    return this->getScore(vector<int>(), (void*) this);
  }

  int test2() {
    return this->maxVal;
  }
};

float exactScore(vector<int> denoms, void* obj) {
  return 2.0;
}

float exchangeScore(vector<int> denoms, void* obj) {
  Solution *ptr = (Solution*) obj;
  return 3.0;
}

int main(int argc, char **argv) {

  Solution sol(1.f, 2);

  return 0;
}
