import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Image, Text } from "react-native";
import * as tf from "@tensorflow/tfjs";
import { fetch, bundleResourceIO } from "@tensorflow/tfjs-react-native";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as jpeg from "jpeg-js";
import Output from "./Output";

async function getPermissionAsync() {
  if (Constants.platform.ios) {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status !== "granted") {
      alert("Permission for camera access required.");
    }
  }
}

async function imageToTensor(source) {
  const response = await fetch(source.uri, {}, { isBinary: true });
  const rawImageData = await response.arrayBuffer();

  const { width, height, data } = jpeg.decode(rawImageData, {
    useTArray: true,
  });

  const buffer = new Uint8Array(width * height * 3);
  let offset = 0;
  for (let i = 0; i < buffer.length; i += 3) {
    buffer[i] = data[offset];
    buffer[i + 1] = data[offset + 1];
    buffer[i + 2] = data[offset + 2];
    offset += 4;
  }

  const img = tf.tensor3d(buffer, [width, height, 3]);

  const shorterSide = Math.min(width, height);

  const startingHeight = (height - shorterSide) / 2;
  const startingWidth = (width - shorterSide) / 2;
  const endingHeight = startingHeight + shorterSide;
  const endingWidth = startingWidth + shorterSide;

  const sliced_img = img.slice(
    [startingWidth, startingHeight, 0],
    [endingWidth, endingHeight, 3]
  );
  const resized_img = tf.image.resizeBilinear(sliced_img, [224, 224]);

  const expanded_img = resized_img.expandDims(0);
  return expanded_img.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
}

export default function App() {
  const [isTfReady, setTfReady] = useState(false);
  const [model, setModel] = useState(null);
  const [image, setImage] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      await tf.ready();
      setTfReady(true);

      const model = require("./assets/model.json");
      const weights = require("./assets/weights.bin");
      const loadedModel = await tf.loadGraphModel(
        bundleResourceIO(model, weights)
      );

      setModel(loadedModel);
      getPermissionAsync();
    })();
  }, []);

  async function handlerSelectImage() {
    try {
      let response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [4, 3],
      });

      if (!response.cancelled) {
        const source = { uri: response.uri };
        setImage(source);
        const imageTensor = await imageToTensor(source);
        const predictions = await model.predict(imageTensor);
        setPredictions(predictions);
      }
    } catch (error) {
      setError(error);
    }
  }

  function reset() {
    setPredictions(null);
    setImage(null);
    setError(false);
  }

  let status, statusMessage, showReset;
  const resetLink = (
    <Text onPress={reset} style={styles.reset}>
      Restart
    </Text>
  );

  if (!error) {
    if (isTfReady && model && !image && !predictions) {
      status = "modelReady";
      statusMessage = "Model is ready.";
    } else if (model && image && predictions) {
      status = "finished";
      statusMessage = "Prediction finished.";
      showReset = true;
    } else if (model && image && !predictions) {
      status = "modelPredict";
      statusMessage = "Model is predicting...";
    } else {
      status = "modelLoad";
      statusMessage = "Model is loading...";
    }
  } else {
    statusMessage = "Unexpected error occured.";
    showReset = true;
    console.log(error);
  }

  return (
    <View style={styles.container}>
      <View style={styles.innercontainer}>
        <Text style={styles.status}>
          {statusMessage} {showReset ? resetLink : null}
        </Text>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={model && !predictions ? handlerSelectImage : undefined}
        >
          <Output
            status={status}
            image={image}
            predictions={predictions}
            error={error}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  innercontainer: {
    marginTop: -50,
    alignItems: "center",
    justifyContent: "center",
  },
  status: { marginBottom: 10 },
  reset: { color: "blue" },
  imageContainer: {
    width: 300,
    height: 300,
    borderRadius: 20,
    opacity: 0.7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "lightgrey",
    borderColor: "white",
    borderWidth: 3,
    borderStyle: "dotted",
  },
});
