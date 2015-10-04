
import java.io.*;
import java.util.StringTokenizer;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;

class Contestant extends NoTippingPlayer {
    private static BufferedReader br;
    private Weight[] board;
    private HashMap finalState;
    private boolean[] availables;
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

    private String firstPlayerAdd() {
      return "";
    }

    private String secondPlayerAdd() {
      return "";
    }

    private String addWeight() {
      if (firstPlayer) {
        return firstPlayerAdd();
      } else {
        return secondPlayerAdd();
      }
    }

    private String firstPlayerRemove() {
      return "";
    }

    private String secondPlayerRemove() {
      return "";
    }

    private String removeWeight() {
      if (firstPlayer) {
        return firstPlayerRemove();
      } else {
        return secondPlayerRemove();
      }
    }

    protected String process(String command) {
      if (strategy == null) {
        board = new Weight[52];
        for (int i = -25; i <= 25; i++) {
          board[getIdx(i)] = new Weight(0, i, false);
        }
        board[getIdx(-4)] = new Weight(3, -4, false);
        availables = new boolean[16];
        for (int i = 0; i <= 15; i++) {
          availables[i] = true;
        }
      }
      System.out.println(command);
      StringTokenizer tk = new StringTokenizer(command);
      command = tk.nextToken();
      int position = Integer.parseInt(tk.nextToken());
      int weight = Integer.parseInt(tk.nextToken());

      if (position == 0 && weight == 0) {
        firstPlayer = true;
      } else {
        if (command.equals("ADDING")) {
          board[getIdx(position)] = new Weight(weight, position, false);
        } else {
          board[getIdx(position)] = new Weight(0, position, false);
        }
      }

      if (command.equals("ADDING")) {
        return addWeight();
      } else {
        return removeWeight();
      }
    }

    public static void main(String[] args) throws Exception {
        br = new BufferedReader(new InputStreamReader(System.in));
        new Contestant(Integer.parseInt(args[0]));
    }
}
