import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function App() {
  const [shipPosition, setShipPosition] = useState(0);
  const [asteroidX, setAsteroidX] = useState(0);
  const [asteroidY, setAsteroidY] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

 const moveLeft = () => {
  setShipPosition((prev) => Math.max(prev - 20, -150));
};

const moveRight = () => {
  setShipPosition((prev) => Math.min(prev + 20, 150));
};

const SHIP_WIDTH = 54;
const SHIP_HEIGHT = 45;

const ASTEROID_SIZE = 40;

const startGame = () => {
  setGameStarted(true);
};

const restartGame = () => {
  setScore(0);

  setShipPosition(0);

  setAsteroidY(0);

  setAsteroidX(
  Math.floor(Math.random() * (width - ASTEROID_SIZE))
);

  setGameOver(false);

  setGameStarted(true);
};

const loadHighScore = async () => {
  const savedScore = await AsyncStorage.getItem("highScore");

  if (savedScore !== null) {
    setHighScore(Number(savedScore));
  }
};

const saveHighScore = async (currentScore) => {
  if (currentScore > highScore) {
    setHighScore(currentScore);

    await AsyncStorage.setItem(
      "highScore",
      currentScore.toString()
    );
  }
};

useEffect(() => {
  loadHighScore();
}, []);

useEffect(() => {
  const timer = setInterval(() => {
    // Stop updating if the game is over
    if (!gameStarted || gameOver) {
      return;
    }

    setAsteroidY((currentY) => {
      const nextY = currentY + 5;

      // --------------------------
      // Collision Detection
      // --------------------------

      const SHIP_X = width / 2 - SHIP_WIDTH / 2 + shipPosition;
      const SHIP_Y = height - 120;

       const collision =
        asteroidX + 12 < SHIP_X + SHIP_WIDTH - 12 &&
        asteroidX + ASTEROID_SIZE - 12 > SHIP_X + 12 &&
        nextY + 12 < SHIP_Y + SHIP_HEIGHT - 12 &&
        nextY + ASTEROID_SIZE - 12 > SHIP_Y + 12;

      if (collision) {
        saveHighScore(score);
        setGameOver(true);
        return currentY;
      }

      // --------------------------
      // Asteroid reached bottom
      // --------------------------

      if (nextY > height) {
        setScore((prev) => prev + 1);
        setAsteroidX(Math.floor(Math.random() * (width - ASTEROID_SIZE)));
        return 0;
      }

      return nextY;
    });
  }, 40);

  return () => clearInterval(timer);
}, [shipPosition, asteroidX, gameOver]);



  return (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar
      translucent
      backgroundColor="transparent"
      barStyle="light-content"
    />
    <LinearGradient
      colors={["#020617", "#0F172A", "#1E3A8A"]}
      style={styles.gradient}
    >
      {/* ========== START SCREEN ========== */}
      {!gameStarted && !gameOver && (
        <View style={styles.centerScreen}>
          <Text style={styles.title}>🚀 Space Escape Runner</Text>

          <TouchableOpacity style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ========== GAME SCREEN ========== */}
      {gameStarted && !gameOver && (
        <>
          {/* SCORE UI */}
          <View style={styles.topUI}>
            <Text style={styles.scoreText}>Score: {score}</Text>
            <Text style={styles.scoreText}>High: {highScore}</Text>
          </View>

          {/* ASTEROID */}
          <View
            style={[
              styles.asteroid,
              {
                left: asteroidX,
                top: asteroidY,
              },
            ]}
          >
            <View style={styles.crater1} />
            <View style={styles.crater2} />
          </View>

          {/* SPACESHIP */}
          <View
            style={[
              styles.shipContainer,
              {
                transform: [{ translateX: shipPosition }],
              },
            ]}
          >
            <View style={styles.shipNose} />
            <View style={styles.shipBody}>
              <View style={styles.leftWing} />
              <View style={styles.rightWing} />
            </View>
          </View>

          {/* CONTROLS */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton} onPress={moveLeft}>
              <Text style={styles.buttonText}>⬅</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={moveRight}>
              <Text style={styles.buttonText}>➡</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ========== GAME OVER SCREEN ========== */}
      {gameOver && (
        <View style={styles.centerScreen}>
          <Text style={styles.gameOverText}>💥 Game Over</Text>

          <Text style={styles.finalScore}>
            Final Score: {score}
          </Text>

          <Text style={styles.finalScore}>
            High Score: {highScore}
          </Text>

          <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
            <Text style={styles.buttonText}>Restart</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },

  safeArea: {
  flex: 1,
  backgroundColor: "#020617",
},

gradient: {
  flex: 1,
},

centerScreen: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  paddingHorizontal: 20,
},

topUI: {
  position: "absolute",
  top: 60,
  width: "100%",
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: 25,
},

scoreText: {
  color: "#FFFFFF",
  fontSize: 20,
  fontWeight: "bold",
},

  /* ================= TITLE ================= */
  title: {
  fontSize: 32,
  fontWeight: "bold",
  color: "#FFFFFF",
  marginBottom: 30,
  textAlign: "center",
},

  /* ================= SCORE UI ================= */
  scoreContainer: {
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 18,
    width: 220,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#334155",
    elevation: 5,
  },

  scoreLabel: {
    fontSize: 16,
    color: "#CBD5E1",
  },

  score: {
    fontSize: 42,
    color: "#38BDF8",
    fontWeight: "bold",
    marginTop: 8,
  },

  /* ================= BUTTON ================= */
  button: {
  backgroundColor: "#3B82F6",
  width: 230,
  height: 55,
  borderRadius: 28,
  justifyContent: "center",
  alignItems: "center",
  elevation: 8,
  marginTop: 20,
},

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  /* ================= GAME OVER ================= */
  gameOverContainer: {
    alignItems: "center",
    marginVertical: 20,
  },

  gameOverText: {
    fontSize: 34,
    color: "#EF4444",
    fontWeight: "bold",
  },

  finalScore: {
    fontSize: 20,
    color: "#FFFFFF",
    marginTop: 8,
  },

  restartButton: {
  backgroundColor: "#16A34A",
  width: 230,
  height: 55,
  borderRadius: 28,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 25,
},

  /* ================= CONTROLS ================= */
  controls: {
  position: "absolute",
  bottom: 140,
  width: "100%",
  flexDirection: "row",
  justifyContent: "space-evenly",
  alignItems: "center",
},

  controlButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 25,
    marginHorizontal: 10,
    elevation: 6,
  },

  /* ================= SPACESHIP ================= */
  shipContainer: {
  position: "absolute",
  bottom: 40,
  left: width / 2 - 15, // center the 30px-wide ship
  alignItems: "center",
},

  shipNose: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#38BDF8",
  },

  shipBody: {
    width: 30,
    height: 45,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  leftWing: {
    position: "absolute",
    left: -12,
    width: 10,
    height: 25,
    backgroundColor: "#60A5FA",
    borderRadius: 5,
  },

  rightWing: {
    position: "absolute",
    right: -12,
    width: 10,
    height: 25,
    backgroundColor: "#60A5FA",
    borderRadius: 5,
  },

  shipCockpit: {
    width: 16,
    height: 12,
    backgroundColor: "#7DD3FC",
    borderRadius: 8,
    marginBottom: -2,
  },

  engine: {
    width: 12,
    height: 18,
    backgroundColor: "#F97316",
    borderRadius: 6,
  },

  /* ================= ASTEROID ================= */
  asteroid: {
  position: "absolute",
  width: 46,
  height: 46,
  borderRadius: 23,
  backgroundColor: "#6B7280",
  borderWidth: 3,
  borderColor: "#9CA3AF",
},

  crater1: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4B5563",
    position: "absolute",
    top: 8,
    left: 8,
  },

  crater2: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4B5563",
    position: "absolute",
    bottom: 8,
    right: 8,
  },

  /* ================= STARS ================= */
  star1: {
    position: "absolute",
    top: 60,
    left: 40,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "white",
  },

  star2: {
    position: "absolute",
    top: 150,
    right: 60,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "white",
  },

  star3: {
    position: "absolute",
    top: 260,
    left: 120,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "white",
  },

  star4: {
    position: "absolute",
    top: 380,
    right: 120,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "white",
  },

  star5: {
    position: "absolute",
    top: 520,
    left: 80,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "white",
  },
});
