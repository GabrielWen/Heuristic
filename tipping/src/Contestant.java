
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
    private boolean addStage;
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

    private class MinMaxParam {
      public int alpha; //Next move opponent has
      public int beta; //Next move I have

      public MinMaxParam(int alpha, int beta) {
        this.alpha = alpha;
        this.beta = beta;
      }

      public float getNumber() {
        return alpha == 0 ? 0.f : ((float) beta) / alpha;
      }
    }

    private void printBoard() {
      System.out.println("Printing board...");
      for (int i = -25; i <= 25; i++) {
        System.out.println("Position: " + board[getIdx(i)].position + " : " + board[getIdx(i)].weight + " -> " + board[getIdx(i)].mine);
      }
    }

    private class MinMaxChoice implements Comparable<MinMaxChoice> {
      public float num;
      public Weight w;

      public MinMaxChoice(float num, Weight w) {
        this.num = num;
        this.w = w;
      }

      @Override
      public int compareTo(MinMaxChoice c) {
        if (this.num < c.num) {
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

    private MinMaxParam countNumMyMoves(int stage) {
      int alpha = 0, beta = 0;
      for (int i = 25; i >= -25; i--) {
        if (board[getIdx(i)].weight > 0)  continue;
        for (int w = 15; w > 0; w--) {
          if (!availables[w])  continue;
          board[getIdx(i)] = new Weight(w, i, true);
          boolean gameNotOver = verifyGameNotOver();
          if (gameNotOver) {
            beta++;
          }

          board[getIdx(i)] = new Weight(0, i, false);
        }
      }

      return new MinMaxParam(alpha, beta);
    }

    private MinMaxParam countNumEnemyMoves(int stage) {
      int alpha = 0, beta = 0;
      for (int i = -25; i <= 25; i++) {
        if (board[getIdx(i)].weight > 0)  continue;
        for (int w = 1; w <= 15; w++) {
          if (enemyWeights.get(w) != null)  continue;

          board[getIdx(i)] = new Weight(w, i, false);
          boolean gameNotOver = verifyGameNotOver();
          if (gameNotOver) {
            if (stage == 0) {
              enemyWeights.put(w, new Weight(w, i, false));
              MinMaxParam p = countNumMyMoves(stage+1);
              enemyWeights.remove(w);
              alpha += p.alpha + 1;
              beta += p.beta;
            }
          }

          board[getIdx(i)] = new Weight(0, i, false);
        }
      }

      return new MinMaxParam(alpha, beta);
    }

    private Weight firstPlayerAdd() {
      //Step1: Check if blocking a final state is possible
      ArrayList<Choice> choices = new ArrayList<Choice>();
      for (int i = 25; i >= -25; i--) {
        if (board[getIdx(i)].weight > 0)  continue;
        for (int w = 15; w > 0; w--) {
          if (!availables[w]) continue;
          board[getIdx(i)] = new Weight(w, i, true);
          boolean gameOver = !verifyGameNotOver();
          board[getIdx(i)] = new Weight(0, i, false);
          if (gameOver) continue;

          int numBlocked = 0;
          board[getIdx(i)] = new Weight(w, i, true);
          //Safe to put weight, now check if a final state is successfully blocked
          for (Object idx: finalState.keySet()) {
            int pos = (Integer) idx;
            if (board[getIdx(pos)].weight > 0)  continue;

            ArrayList<Integer> weights = (ArrayList<Integer>) finalState.get(idx);
            for (Integer x: weights) {
              if (enemyWeights.get(x) != null && !availables[x])  continue;
              board[getIdx(pos)] = new Weight(x, pos, false);
              if (!verifyGameNotOver()) numBlocked++;
              board[getIdx(pos)] = new Weight(0, pos, false);
            }
          }
          board[getIdx(i)] = new Weight(0, i, false);
          if (numBlocked > 0) {
            choices.add(new Choice(numBlocked, new Weight(w, i, true)));
          }
        }
      }
      if (choices.size() > 0) {
        //Got some choices
        Collections.sort(choices);
        System.out.println("First part...");
        return choices.get(0).w;
      }

      //Step2: If not possible, use MinMax with priority on heavier weight
      ArrayList<MinMaxChoice> minMaxChoices = new ArrayList<MinMaxChoice>();
      for (int w = 15; w > 0; w--) {
        if (!availables[w]) continue;
        for (int i = -25; i <= 25; i++) {
          if (board[getIdx(i)].weight > 0)  continue;

          board[getIdx(i)] = new Weight(w, i, true);
          boolean gameNotOver = verifyGameNotOver();
          if (gameNotOver) {
            availables[w] = false;
            MinMaxParam p = countNumEnemyMoves(0);
            availables[w] = true;
            minMaxChoices.add(new MinMaxChoice(p.getNumber() * ((float) Math.sqrt(w)), new Weight(w, i, true)));
          }
          board[getIdx(i)] = new Weight(0, i, false);
        }
      }
      if (minMaxChoices.size() > 0) {
        Collections.sort(minMaxChoices);
        return minMaxChoices.get(0).w;
      } else {
        System.out.println("Last resort...");
        for (int w = 15; w > 0; w--) {
          if (!availables[w]) continue;
          for (int i = -25; i <=25; i++) {
            if (board[getIdx(i)].weight > 0)  continue;

            board[getIdx(i)] = new Weight(w, i, true);
            boolean gameNotOver = verifyGameNotOver();
            board[getIdx(i)] = new Weight(0, i, false);
            if (gameNotOver) {
              return new Weight(w, i, true);
            }
          }
        }
      }
      System.out.println("Lose...");
      return new Weight(0, 0, true);
    }

    private Weight secondPlayerAdd() {
      //Step1: Check if placing a final state is possible
      int optimalPos = -26, optimalW = 0;
      for (Object idx: finalState.keySet()) {
        int i = (Integer) idx;
        if (board[getIdx(i)].weight > 0)  continue;

        ArrayList<Integer> weights = (ArrayList<Integer>) finalState.get(i);
        int maxWeight = 0;
        for (Integer w: weights) {
          if (!availables[w]) continue;
          board[getIdx(i)] = new Weight(w, i, true);
          boolean gameNotOver = verifyGameNotOver();
          board[getIdx(i)] = new Weight(0, i, false);
          if (gameNotOver) {
            maxWeight = maxWeight > w ? maxWeight : w;
          }
        }
        if (maxWeight > 0 && maxWeight > optimalW) {
          optimalPos = i;
          optimalW = maxWeight;
        }
      }
      if (optimalW > 0) {
        return new Weight(optimalW, optimalPos, true);
      }

      //Step2: If not, use MinMax
      ArrayList<Choice> choices = new ArrayList<Choice>();
      for (int w = 15; w > 0; w--) {
        if(!availables[w])  continue;
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
              boolean enemyOver = !verifyGameNotOver();
              board[getIdx(enemy_i)] = new Weight(0, enemy_i, false);
              if (enemyOver)  continue;//TODO

              board[getIdx(enemy_i)] = new Weight(enemy_w, enemy_i, false);
              for (int w2= 15; w2 > 0; w2--) {
                if (!availables[w2])  continue;
                for (int i2 = -25; i2 <= 25; i2++) {
                  if (board[getIdx(i2)].weight > 0) continue;
                  board[getIdx(i2)] = new Weight(w2, i2, true);
                  boolean secondNotOver = verifyGameNotOver();
                  board[getIdx(i2)] = new Weight(0, i2, false);
                  if (secondNotOver) {
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

      if (choices.size() > 0) {
        return choices.get(0).w;
      } else {
        for (int w = 1; w <= 15; w++) {
          if (!availables[w]) continue;
          for (int i = -25; i <= 25; i++) {
            if (board[getIdx(i)].weight > 0)  continue;
            board[getIdx(i)] = new Weight(w, i, true);
            boolean gameNotOver = verifyGameNotOver();
            board[getIdx(i)] = new Weight(0, i, false);

            if (gameNotOver) {
              return new Weight(w, i, true);
            }
          }
        }
      }
      System.out.println("Lose...");
      return new Weight(0, 0, true);
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

    private int weightsOnBoard() {
      int ret = 0;
      for (int i = -25; i <= 25; i++) {
        if (board[getIdx(i)].weight > 0)
          ret++;
      }

      return ret;
    }

    protected String process(String command) {
      if (strategy == null) {
        board = new Weight[52];
        for (int i = -25; i <= 25; i++) {
          board[getIdx(i)] = new Weight(0, i, false);
        }

        initFinalStates();
        board[getIdx(-4)] = new Weight(3, -4, true);
        availables = new boolean[16];
        for (int i = 0; i <= 15; i++) {
          availables[i] = true;
        }
        enemyWeights = new HashMap<Integer, Weight>();
        addStage = true;
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
          if (addStage && firstPlayer && weightsOnBoard() == 29) {
            addStage = false;
            board[getIdx(position)] = new Weight(weight, position, false);
          } else {
            board[getIdx(position)] = new Weight(0, position, false);
            enemyWeights.remove(weight);
          }
        }
      }

      if (command.equals("ADDING")) {
        strategy = addWeight();
        board[getIdx(strategy.position)] = strategy;
        availables[strategy.weight] = false;
      } else {
        strategy = removeWeight();
        board[getIdx(strategy.position)] = new Weight(0, strategy.position, false);
        availables[strategy.weight] = true;
      }

      return strategy.position + " " + strategy.weight;
    }

    public static void main(String[] args) throws Exception {
        br = new BufferedReader(new InputStreamReader(System.in));
        new Contestant(Integer.parseInt(args[0]));
    }
}
