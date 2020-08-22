import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import * as tf from "@tensorflow/tfjs";
import { fetch, bundleResourceIO } from "@tensorflow/tfjs-react-native";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as jpeg from "jpeg-js";

class App extends React.Component {
  state = {
    isTfReady: false,
    isModelReady: false,
    predictions: null,
    image: null,
    tfjsmodel: null,
    error: false,
  };

  async componentDidMount() {
    try {
      await tf.ready();
      this.setState({
        isTfReady: true,
      });

      let tfjsmodel;

      const tfmodel = require("./assets/model/model.json");
      const weights = require("./assets/model/weights.bin");
      tfjsmodel = await tf.loadGraphModel(bundleResourceIO(tfmodel, weights));

      this.setState({ isModelReady: true, tfjsmodel });
      this.getPermissionAsync();
    } catch (e) {
      console.log(e);
    }
  }

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== "granted") {
        alert("Permission for camera access required.");
      }
    }
  };

  imageToTensor(rawImageData) {
    const TO_UINT8ARRAY = true;
    const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY);

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

  classifyImage = async (source) => {
    try {
      const imageAssetPath = Image.resolveAssetSource(source);
      const response = await fetch(imageAssetPath.uri, {}, { isBinary: true });
      const rawImageData = await response.arrayBuffer();
      const imageTensor = this.imageToTensor(rawImageData);
      //const options = { centerCrop: true };
      const predictions = await this.state.tfjsmodel.predict(
        imageTensor
        //options
      );
      this.setState({ predictions });
    } catch (error) {
      this.setState({ error });
    }
  };

  handlerSelectImage = async () => {
    try {
      let response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [4, 3],
      });

      if (!response.cancelled) {
        const source = { uri: response.uri };
        this.setState({ image: source });
        this.classifyImage(source);
      }
    } catch (error) {
      this.setState({ error });
    }
  };

  render() {
    const { isTfReady, isModelReady, predictions, image, error } = this.state;

    let loading;

    if (isTfReady && isModelReady && !image && !predictions) loading = false;
    else if (isModelReady && image && predictions) loading = false;
    else if (isModelReady && image && !predictions) loading = "predict";
    else loading = "model";

    if (predictions) console.log(predictions);

    if (!error) {
      if (!loading) {
        if (image && !predictions) output = <Image source={image} />;
        else if (image && predictions) {
          output = (
            <React.Fragment>
              <ImageBackground
                source={image}
                blurRadius={50}
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
                    borderRadius: 150,
                  }}
                >
                  <Animatable.Text
                    animation={"pulse"}
                    duration={2000}
                    style={styles.predictedNumberHeader}
                  >
                    <Text>Wahrscheinlichkeit für Melanom:</Text>
                  </Animatable.Text>

                  <Animatable.Text
                    animation={"bounceIn"}
                    duration={5000}
                    style={styles.predictedNumber}
                  >
                    <Text>
                      {Math.round(predictions.dataSync()[0] * 100)}
                      <Text style={styles.predictedNumberPercentage}> %</Text>
                    </Text>
                  </Animatable.Text>
                </View>
              </ImageBackground>
            </React.Fragment>
          );
        } else if (isModelReady && !image)
          output = (
            <Animatable.View animation={"wobble"} duration={3000}>
              <Icon
                style={{
                  width: 100,
                  height: 100,
                }}
                name="image-outline"
              />
            </Animatable.View>
          );
      } else {
        switch (loading) {
          case "model":
            output = (
              <BarIndicator
                size={80}
                style={styles.indicator}
                color="darkorange"
              />
            );
            break;
          case "predict":
            output = (
              <WaveIndicator
                size={80}
                count={10}
                style={styles.indicator}
                color="darkorange"
              />
            );
          default:
            break;
        }
      }
    } else
      output = (
        <React.Fragment>
          <ImageBackground
            source={image}
            blurRadius={50}
            style={styles.predictedImage}
            imageStyle={styles.predictedImageExtras}
          >
            <Text>Bitte versuchen Sie es nochmal.</Text>
          </ImageBackground>
        </React.Fragment>
      );

    return (
      <View style={styles.container}>
        <View style={styles.innercontainer}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={
              isModelReady && this.state.tfjsmodel.predict && !predictions
                ? this.handlerSelectImage
                : undefined
            }
          ></TouchableOpacity>
        </View>
      </View>
    );
  }
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
  status: { marginBottom: 20 },
  imageContainer: {
    width: 300,
    height: 300,
    padding: 5,
    borderRadius: 20,
    opacity: 0.7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "lightgrey",
    borderColor: "white",
    borderWidth: 5,
    borderStyle: "dotted",
  },
});

export default App;