# diginote_cloud_functions

The Firebase Cloud Functions for an electronic Post-It note system, [Diginote](https://github.com/kelvin589/diginote) and [Diginote Screen](https://github.com/kelvin589/diginotescreen).

## Overview
An overview of the cloud functions:
* ```notifyDevicesToLowBattery``` notifies devices, linked to the screen, to low battery of a screen.
* ```getUsersEmail``` retrieves a user's email based on user ID.
* ```onIsOnlineChanged``` listens to updates in Firebase Realtime Database and notifies devices, linked to the screen, to changes in screen presence.
* ```notifyDevicesToOnlineStatus``` manually sets a screen's online status and notifies devices, linked to the sceen, to the updated status.

## Setup
These setup instructions assume you have setup firebase prior using instructions from [Diginote](https://github.com/kelvin589/diginote) or [Diginote Screen](https://github.com/kelvin589/diginotescreen).
1. Ensure your project is on the blaze plan (you will not be charged as long as you stay below limits)
2. Clone the project to get a local copy
``` bash
git clone https://github.com/kelvin589/diginote_cloud_functions
```
3. Change your directory to the project folder
``` bash
cd diginote_cloud_functions
```
4. Run ``` firebase use --add``` to create an alais for your Firebase project
5. Ensure your Firebase poject is selected using ```firebase use```
    * If your Firebase project is not selected, run ```firebase use <project-alias>
6. Initiate the project folder for Firebase Cloud Functions using ```firebase init functions```
    * Choose JavaScript for the language
    * Use ESLint
    * If asked, do not overwrite existing files
    * Choose the option to install dependencies with npm
7. Run ```firebase deploy --only functions``` to deploy the Cloud Functions 
8. The Cloud Functions are ready to use
