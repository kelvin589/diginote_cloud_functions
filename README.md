# diginote_cloud_functions

The Firebase Cloud Functions for an electronic Post-It note system, [Diginote](https://github.com/kelvin589/diginote) and [Diginote Screen](https://github.com/kelvin589/diginotescreen).

## Overview
An overview of the cloud functions:
* ```notifyDevicesToLowBattery``` notifies devices, linked to the screen, to low battery of a screen.
* ```getUsersEmail``` retrieves a user's email based on user ID.
* ```onIsOnlineChanged``` listens to updates in Firebase Realtime Database and notifies devices, linked to the screen, to changes in screen presence.
* ```notifyDevicesToOnlineStatus``` manually sets a screen's online status and notifies devices, linked to the sceen, to the updated status.
