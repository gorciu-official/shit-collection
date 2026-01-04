import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.GradientPaint;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import javax.swing.ImageIcon;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JMenuItem;
import javax.swing.JPanel;
import javax.swing.JPopupMenu;
import javax.swing.SwingUtilities;
import net.walker.Walker;

public class Main extends JFrame {
   private static final int WORLD_SIZE = 32;
   private static final int BLOCK_SIZE = 25;
   private char[][] world;
   private int playerX = 0;
   private int playerY = 0;
   private JPanel worldPanel;
   private JLabel inventoryLabel;
   private boolean hasBlock = false;

   public Main() {
      Walker.loadingBar();
      this.initializeWorld();
      this.setupUI();
      Walker.start();
   }

   private void initializeWorld() {
      this.world = new char[32][32];

      for(int var1 = 0; var1 < 32; ++var1) {
         for(int var2 = 0; var2 < 32; ++var2) {
            this.world[var1][var2] = '.';
         }
      }

   }

   private void setupUI() {
      this.setTitle("Gorciu: Walker");
      this.setDefaultCloseOperation(3);
      this.setResizable(false);
      ImageIcon var1 = new ImageIcon("favicon.png");
      this.setIconImage(var1.getImage());
      this.worldPanel = new JPanel() {
         protected void paintComponent(Graphics var1) {
            super.paintComponent(var1);

            for(int var2 = 0; var2 < 32; ++var2) {
               for(int var3 = 0; var3 < 32; ++var3) {
                  int var4 = var3 * 25;
                  int var5 = var2 * 25;
                  if (var2 == Main.this.playerY && var3 == Main.this.playerX) {
                     var1.setColor(Color.BLUE);
                     var1.fillRect(var4, var5, 25, 25);
                  } else {
                     Color var6 = Color.LIGHT_GRAY;
                     Color var7 = Color.DARK_GRAY;
                     GradientPaint var8 = new GradientPaint((float)var4, (float)var5, var6, (float)(var4 + 25), (float)(var5 + 25), var7);
                     Graphics2D var9 = (Graphics2D)var1;
                     var9.setPaint(var8);
                     var9.fillRect(var4, var5, 25, 25);
                  }

                  if (Main.this.world[var2][var3] == 'B') {
                     var1.setColor(Color.GREEN);
                     var1.fillRect(var4, var5, 25, 25);
                  }
               }
            }

         }
      };
      this.worldPanel.setPreferredSize(new Dimension(800, 800));
      this.worldPanel.setFocusable(true);
      this.worldPanel.requestFocus();
      this.worldPanel.addKeyListener(new KeyAdapter() {
         public void keyPressed(KeyEvent var1) {
            int var2 = var1.getKeyCode();
            switch(var2) {
            case 37:
               Main.this.movePlayer(-1, 0);
               break;
            case 38:
               Main.this.movePlayer(0, -1);
               break;
            case 39:
               Main.this.movePlayer(1, 0);
               break;
            case 40:
               Main.this.movePlayer(0, 1);
               break;
            case 65:
               Main.this.movePlayer(-1, 0);
               break;
            case 66:
               if (Main.this.hasBlock) {
                  Main.this.buildBlock();
               }
               break;
            case 68:
               Main.this.movePlayer(1, 0);
               break;
            case 69:
               Main.this.toggleInventory();
               break;
            case 77:
               Main.this.showGameMenu();
               break;
            case 81:
               Walker.end();
               break;
            case 83:
               Main.this.movePlayer(0, 1);
               break;
            case 87:
               Main.this.movePlayer(0, -1);
            }

            Main.this.worldPanel.repaint();
         }
      });
      this.add(this.worldPanel, "Center");
      this.inventoryLabel = new JLabel("Inventory: Empty");
      this.add(this.inventoryLabel, "South");
      this.pack();
      this.setLocationRelativeTo((Component)null);
      this.setVisible(true);
   }

   private void movePlayer(int var1, int var2) {
      int var3 = this.playerX + var1;
      int var4 = this.playerY + var2;
      if (var3 >= 0 && var3 < 32 && var4 >= 0 && var4 < 32) {
         this.playerX = var3;
         this.playerY = var4;
      }

   }

   private void buildBlock() {
      if (this.world[this.playerY][this.playerX] == '.') {
         this.world[this.playerY][this.playerX] = 'B';
         this.hasBlock = false;
         this.updateInventoryLabel();
      }

   }

   private void toggleInventory() {
      this.hasBlock = !this.hasBlock;
      this.updateInventoryLabel();
   }

   private void updateInventoryLabel() {
      if (this.hasBlock) {
         this.inventoryLabel.setText("Inventory: Block");
      } else {
         this.inventoryLabel.setText("Inventory: Empty");
      }

   }

   private void showHelp() {
      System.out.println("W, A, S, D controls the hero, B places a block and E changes the item in the inventory.");
   }

   private void showGameMenu() {
      final JPopupMenu var1 = new JPopupMenu();
      JMenuItem var2 = new JMenuItem("Resume");
      var2.addActionListener(new ActionListener(this) {
         public void actionPerformed(ActionEvent var1x) {
            var1.setVisible(false);
         }
      });
      JMenuItem var3 = new JMenuItem("Help");
      var3.addActionListener(new ActionListener() {
         public void actionPerformed(ActionEvent var1x) {
            Main.this.showHelp();
            var1.setVisible(false);
         }
      });
      JMenuItem var4 = new JMenuItem("Quit");
      var4.addActionListener(new ActionListener(this) {
         public void actionPerformed(ActionEvent var1) {
            Walker.end();
         }
      });
      var1.add(var2);
      var1.add(var3);
      var1.add(var4);
      var1.show(this.worldPanel, 0, 0);
   }

   public static void main(String[] var0) {
      SwingUtilities.invokeLater(Main::new);
   }
}
