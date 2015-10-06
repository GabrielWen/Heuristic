###Use of AddStrategy

- Step 1: Initialize in process
```java
if (strategy == null) {
  //...
  AddStrategy addStrategy = new AddStrategy();
  //...
}
```
- Step 2: Upon receiving an add command
```java
Weight decision;
if (command.equals("ADDING")) {
  String addMove = addStrategy.process(position, weight);
  tk = new StringTokenizer(addMove);
  int addPosition = Integer.parseInt(tk.nextToken());
  int addWeight = Integer.parseInt(tk.nextToken());
  //....
} else {
  //...
}
```
