# mySkin

Predict. Prevent. Protect.

## Description

"mySkin" is a German React Native app to detect skin cancer (melanoma) from a mole image uploaded by the user. This app is a proof-of-concept and the first React native app known to include a locally saved and run AI model, imported with TensorflowJS. The model is totally encapsulated and doesn't share any data. The model was trained with over 10,000 publicly accessable images (HAM10000). Beside that, the app offers many information, real-time UV index, reminder function for the next skin screening and a discussion forum. The app is the final project of an intense 3-months bootcamp on JavaScript and should not only showcase what has been learned but also what is possbile nowadays with this powerful programming language.

![mySkin screens](screenshots/myskin-overview.png)

The skin cancer prediction part is easy-to-use and analyzes the mole image within seconds. After finishing the analyses a probability score (0-100%) is output.

![mySkin screens](screenshots/myskin-predict-animated.gif)

## Getting Started

The front-end part of "mySkin" was created with Expo. In the back-end there is a server hosted on Heroku with database connection to AWS. In order to run the app you have to install Expo and all the dependencies (see package.json). After running the app please register or just login with username "guest" and password "guest".

### Dependencies

```
package.json
```

### Installing

```
npm install
```

### Executing program

```
npm start
```

## Authors

* Lin Xiang (AI model and implementation)
* Dan Pina (Discussion forum)
* Cristina Trebe (Layout and contents)
* Ricky Duncan-Williams (UV-Index)

## Acknowledgments

* [HAM10000 dataset](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/DBW86T)
