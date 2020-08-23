import React from "react";
import {
  StyleSheet,
  Text,
  ImageBackground,
  View,
  ActivityIndicator,
} from "react-native";

const Output = (props) => {
  const { status, image, predictions, error } = props;
  let output;

  if (!error) {
    if (status === "modelReady" && !image)
      output = <Text style={{ fontSize: "50px" }}>&uarr;</Text>;
    else if (status === "finished") {
      output = (
        <ImageBackground
          source={image}
          blurRadius={20}
          style={styles.predictedImage}
          imageStyle={styles.predictedImageExtras}
        >
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
            }}
          >
            <Text>
              Probability of melanoma:{" "}
              {Math.round(predictions.dataSync()[0] * 100)}
              <Text style={styles.predictedNumberPercentage}> %</Text>
            </Text>
          </View>
        </ImageBackground>
      );
    } else
      output = (
        <ActivityIndicator
          size="large"
          style={styles.indicator}
          animating={true}
        />
      );
  } else output = <Text>Please try again</Text>;

  return output;
};

const styles = StyleSheet.create({
  predictedImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  predictedImageExtras: { borderRadius: 20 },
  predictedNumberHeader: { fontSize: 12, color: "white" },
  predictedNumberPercentage: { fontSize: 24, color: "white" },
  predictedNumber: {
    fontSize: 64,
    fontWeight: "bold",
    color: "darkorange",
    shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: "black",
    shadowOffset: { height: 10, width: 10 },
  },
  indicator: {
    flex: 1,
  },
});

export default Output;