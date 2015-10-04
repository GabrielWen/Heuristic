
import java.io.*;
import java.util.StringTokenizer;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Collections;

class Contestant extends NoTippingPlayer {
    private static BufferedReader br;
    private Weight[] board;
    private HashMap finalState;
    private boolean[] availables;
    private HashMap enemyWeights;
    private boolean firstPlayer;
    private Weight strategy;

    private int getIdx(int i) {
      return 25 + i;
    }

    private class Weight {
      public int weight;
      public int position;
      public boolean mine;

      public Weight(int weight, int position, boolean mine) {
        this.weight = weight;
        this.position = position;
        this.mine = mine;
      }
    }

    private class Choice implements Comparable<Choice> {
      public int count;
      public Weight w;

      public Choice(int count, Weight w) {
        this.count = count;
        this.w = w;
      }

      @Override
      public int compareTo(Choice c) {
        if (this.count < c.count) {
          return 1;
        } else {
          return -1;
        }
      }
    }

    private boolean hasWeights() {
      for (int i = 1; i <= 15; i++) {
        if (availables[i])  return true;
      }

      return false;
    }

    private boolean verifyGameNotOver() {
        int left_torque = 0;
        int right_torque = 0;
        for (int i = -25; i <= 25; i++) {
          left_torque -= (board[getIdx(i)].position - (-3)) * board[getIdx(i)].weight;
          right_torque -= (board[getIdx(i)].position - (-1)) * board[getIdx(i)].weight;
        }

        boolean gameOver = (left_torque > 0 || right_torque < 0);
        return !gameOver;
    }

    Contestant(int port) {
        super(port);
    }

    private Weight firstPlayerAdd() {
      Weight ret = new Weight(0, 0, true);

      //Step1: Check if blocking a final state is possible
      for (int i = 25; i >= -25; i--) {
        if (board[getIdx(i)].weight > 0)  continue;
        for (int w = 15; w > 0; w--) {
          if (!availables[w]) continue;
          board[getIdx(i)] = new Weight(w, i, true);
          boolean gameOver = !verifyGameNotOver();
          board[getIdx(i)] = new Weight(0, i, true);
          if (gameOver) continue;

          //Safe to put weight, now check if a final state is successfully blocked
          board[getIdx(i)] = new Weight(w, i, true);
          int numBlocked = 0;
          for (Object fIdx: finalState.keySet()) {
            int pos = (Integer) fIdx;
            if (board[getIdx(pos)].weight > 0)  continue;

            int count = 0;
            ArrayList<Integer> weights = (ArrayList<Integer>) finalState.get(fIdx);
            for (Integer x: weights) {
              board[getIdx(pos)] = new Weight(x, pos, false);
              if (!verifyGameNotOver()) {
                count++;
              }
              board[getIdx(pos)] = new Weight(0, pos, false);
            }
            numBlocked = numBlocked > count ? numBlocked : count;
          }
          board[getIdx(i)] = new Weight(0, i, true);

          if (numBlocked > 0) {
            System.out.println("First part: " + i + " " + w);
            return new Weight(w, i, true);
          }
        }
      }

      //Step2: If not possible, use MinMax with priority on heavier weight
      ArrayList<Choice> choices = new ArrayList<Choice>();
      for (int w = 15; w > 0; w--) {
        if (!availables[w]) continue;
        for (int i = -25; i <= 25; i++) {
          if (board[getIdx(i)].weight > 0)  continue;
          board[getIdx(i)] = new Weight(w, i, true);
          boolean gameOver = !verifyGameNotOver();
          board[getIdx(i)] = new Weight(0, i, false);
          if (gameOver) continue;

          int count = 0;
          board[getIdx(i)] = new Weight(w, i, true);
          availables[w] = false;
          for (int enemy_w = 15; enemy_w > 0; enemy_w--) {
            if (enemyWeights.get(enemy_w) != null)  continue;
            for (int enemy_i = -25; enemy_i <= 25; enemy_i++) {
              if (board[getIdx(enemy_i)].weight > 0)  continue;
              board[getIdx(enemy_i)] = new Weight(enemy_w, enemy_i, false);
              boolean enemyDone = !verifyGameNotOver();
              board[getIdx(enemy_i)] = new Weight(0, enemy_i, false);

              if (enemyDone)  continue;

              board[getIdx(enemy_i)] = new Weight(enemy_w, enemy_i, false);
              for (int w2 = 15; w2 > 0; w2--) {
                if (!availables[w2]) continue;
                for (int i2 = -25; i2 <= 25; i2++) {
                  if (board[getIdx(i2)].weight > 0) continue;
                  board[getIdx(i2)] = new Weight(w2, i2, true);
                  boolean secondDone = verifyGameNotOver();
                  board[getIdx(i2)] = new Weight(0, i2, false);
                  if (secondDone) {
                    count++;
                  }
                }
              }
              board[getIdx(enemy_i)] = new Weight(0, enemy_i, false);
            }
          }
          board[getIdx(i)] = new Weight(0, i, false);
          availables[w] = true;
          if (count > 0) {
            choices.add(new Choice(count, new Weight(w, i, true)));
          }
        }
      }
      Collections.sort(choices);

      return choices.get(0).w;
    }

    private Weight secondPlayerAdd() {
      Weight ret = new Weight(0, 0, true);

      return ret;
    }

    private Weight addWeight() {
      if (firstPlayer) {
        return firstPlayerAdd();
      } else {
        return secondPlayerAdd();
      }
    }

    private Weight firstPlayerRemove() {
      Weight ret = new Weight(0, 0, true);

      return ret;
    }

    private Weight secondPlayerRemove() {
      Weight ret = new Weight(0, 0, true);

      return ret;
    }

    private Weight removeWeight() {
      if (firstPlayer) {
        return firstPlayerRemove();
      } else {
        return secondPlayerRemove();
      }
    }

    private void initFinalStates() {
      finalState = new HashMap<Integer, ArrayList<Integer> >();
      for (int i = -25; i <= 25; i++) {
        ArrayList<Integer> list = new ArrayList<Integer>();
        for (int w = 1; w <= 15; w++) {
          Weight tmp = board[getIdx(i)];
          board[getIdx(i)] = new Weight(w, i, false);
          if (verifyGameNotOver()) {
            list.add(w);
          }
          board[getIdx(i)] = tmp;
        }
        if (list.size() > 0) {
          finalState.put(i, list);
        }
      }
    }

    protected String process(String command) {
      if (strategy == null) {
        board = new Weight[52];
        for (int i = -25; i <= 25; i++) {
          board[getIdx(i)] = new Weight(0, i, false);
        }

        initFinalStates();
        board[getIdx(-4)] = new Weight(3, -4, false);
        availables = new boolean[16];
        for (int i = 0; i <= 15; i++) {
          availables[i] = true;
        }
        enemyWeights = new HashMap<Integer, Weight>();
      }
      StringTokenizer tk = new StringTokenizer(command);
      command = tk.nextToken();
      int position = Integer.parseInt(tk.nextToken());
      int weight = Integer.parseInt(tk.nextToken());

      if (position == 0 && weight == 0) {
        firstPlayer = true;
      } else {
        if (command.equals("ADDING")) {
          board[getIdx(position)] = new Weight(weight, position, false);
          enemyWeights.put(weight, new Weight(weight, position, false));
        } else {
          board[getIdx(position)] = new Weight(0, position, false);
        }
      }

      if (command.equals("ADDING")) {
        strategy = addWeight();
        board[getIdx(strategy.position)] = strategy;
        availables[strategy.weight] = false;
      } else {
        strategy = removeWeight();
      }

      System.out.println(strategy.position + " " + strategy.weight);

      return strategy.position + " " + strategy.weight;
    }

    public static void main(String[] args) throws Exception {
        br = new BufferedReader(new InputStreamReader(System.in));
        new Contestant(Integer.parseInt(args[0]));
    }
}
